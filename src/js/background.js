// 最大の同時ダウンロード数
var PARALLEL_COUNT = 2;

// ダウンロード対象のURL一覧
var urls = [];

// 現在ダウンロード中のID一覧
var downloadingIds = [];

// 既にダウンロードされているものがあればキャンセル
function cancelDownloads() {
    downloadingIds.forEach(function(id) {
        chrome.downloads.cancel(id);
    });
    downloadingIds = [];
}

// ダウンロードを行う。必ずmanageDownloadから呼ばれること
function download(url) {
    chrome.downloads.download({
        url: url,
        conflictAction: "uniquify"
    }, function(downloadId) {
        downloadingIds.push(downloadId);
    });
}

// ダウンロードの上限などの管理を行う
function manageDownload(delay) {
    if (0 < urls.length && downloadingIds.length < PARALLEL_COUNT) {
        setTimeout(function() {
            var url = urls.shift();
            download(url);
        }, delay);
    }
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "download_all") {
        // 既にダウンロードキューがあればキャンセル
        cancelDownloads();
        // ダウンロード開始
        urls = request.urls;
        // 初回はdelay=0秒
        manageDownload(0);
    } else if (request.command === "download_cancel") {
        // ダウンロードのキャンセル
        cancelDownloads();
        urls = [];
    }
});

// ダウンロード完了時のコールバックハンドラ
chrome.downloads.onChanged.addListener(function(delta) {
    var index = downloadingIds.indexOf(delta.id);
    if (index != -1) {
        if (delta.state && (delta.state.current === "interrupted" || delta.state.current === "complete")) {
            // このスクリプトによりダウンロードされている場合は一覧から削除
            downloadingIds.splice(index, 1);
        }
        // 2つ目以降はdelayを付ける
        manageDownload(1000);
    }
});
