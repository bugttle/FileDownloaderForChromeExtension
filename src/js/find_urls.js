chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    // 指定の文字列が一致しているかどうか
    // @param {String} str 検索対象の文字列
    // @param {String} query 検索クエリ
    // @param {RegExp} regex 正規表現の場合、オブジェクトを指定
    function _isMatchText(str, query, regex) {
        if (str === undefined) {
            return false; // 検索対象がない場合にはマッチさせない
        }
        if (query === "") {
            return true; // クエリが無いときはマッチしたとみなす
        }
        if (regex) {
            // 正規表現
            return regex.test(str);
        } else {
            // 部分一致: 大文字小文字無視
            return (str.toLowerCase().indexOf(query.toLowerCase()) != -1);
        }
    }

    // hrefで示されているリンクを絶対パスに変換して返す
    // @param {String} link hrefで示されているパス
    function _toAbsURL(link) {
        // Network-path reference (//example.jp)
        if (link.indexOf("//") == 0) {
            return location.protocol + link;
        }
        // 相対パス (/example.html, ./example.html, ../example.html)
        if (link.indexOf("/") == 0 || link.indexOf("./") == 0 || link.indexOf("../") == 0) {
            return location.protocol + "//" + location.host + link;
        }
        // パスを含まないリンク (example.html)
        if (link.indexOf("/") == -1) {
            return location.protocol + "//" + location.host + "/" + location.pathname + "/" + link;
        }
        // JavaScriptはリンクとみなさない
        if (link.toLowerCase().indexOf("javascript:") == 0) {
            return null;
        }
        // その他のリンクはそのまま返す
        return link;
    }

    // URL一覧
    var urls = [];

    if (request.textFilter != "" || request.urlFilter != "") {
        var textRegex = (request.isTextRegex) ? new RegExp(request.textFilter, "i") : null;
        var urlRegex = (request.isURLRegex) ? new RegExp(request.urlFilter, "i") : null;
        // 全てのリンクを調査
        $("a").each(function() {
            var text = $(this).text();
            var href = $(this).attr("href");
            // マッチしたURLのみ回収
            if (_isMatchText(text, request.textFilter, textRegex) && _isMatchText(href, request.urlFilter, urlRegex)) {
                var url = _toAbsURL(href);
                if (url) {
                    urls.push(url);
                }
            }
        });
    };

    sendResponse(urls);
});
