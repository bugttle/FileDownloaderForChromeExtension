$(function() {
    // URL一覧
    var urls = [];

    init(function(tabId) {
        // UIの初期化
        initUICallbacks(tabId)
    });

    // スクリプトの読み込みなど、複数の初期化処理を行う
    function init(callback) {
        // スクリプトの初期化
        chrome.windows.getCurrent(function(currentWindow) {
            chrome.tabs.query({
                active: true,
                windowId: currentWindow.id
            }, function(activeTabs) {
                chrome.tabs.executeScript(activeTabs[0].id, {
                    file: "js/jquery.min.js"
                }, function() {
                    chrome.tabs.executeScript(activeTabs[0].id, {
                        file: "js/find_urls.js"
                    }, function() {
                        callback(activeTabs[0].id);
                    });
                });
            });
        });
    }

    function initUICallbacks(tabId) {
        // テキスト
        $("#text_filter").keyup(function() {
            findURLs(tabId,
                $(this).val(), $("#text_regex").is(":checked"),
                $("#url_filter").val(), $("#url_regex").is(":checked")
            );
        });
        $("#text_regex").change(function() {
            findURLs(tabId,
                $("#text_filter").val(), $(this).is(":checked"),
                $("#url_filter").val(), $("#url_regex").is(":checked")
            );
        });
        // URL
        $("#url_filter").keyup(function() {
            findURLs(tabId,
                $("#text_filter").val(), $("#text_regex").is(":checked"),
                $(this).val(), $("#url_regex").is(":checked")
            );
        });
        $("#url_regex").change(function() {
            findURLs(tabId,
                $("#text_filter").val(), $("#text_regex").is(":checked"),
                $("#url_filter").val(), $(this).is(":checked")
            );
        });
        // ダウンロード開始ボタンのハンドラ
        $("#download_all").click(function() {
            chrome.runtime.sendMessage({
                "command": "download_all",
                "urls": urls
            });
        });
        // ダウンロードキャンセルボタンのハンドラ
        $("#download_cancel").click(function() {
            chrome.runtime.sendMessage({
                "command": "download_cancel"
            });
        });
    }

    // リンクを見つけるために、DOM処理をするファイルへのメッセージ送信
    function findURLs(tabId, textFilter, isTextRegex, urlFilter, isURLRegex) {
        chrome.tabs.sendMessage(tabId, {
            "textFilter": textFilter,
            "isTextRegex": isTextRegex,
            "urlFilter": urlFilter,
            "isURLRegex": isURLRegex
        }, function(results) {
            urls = results;
            $("#urls").html(urls.length + "件</br>" + urls.join("</br>"));
        });
    }
});
