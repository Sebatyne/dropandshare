$(document).ready(function() {
    // Holds user name
    $("#name").val(docCookies.getItem("name"));

    $("#name").change(function() {
        docCookies.setItem("name", $(this).val());
    });

    // switch between file and text uploads
    $("#upload-change-to-file").click(function() {
        $("#upload-text-field").hide();
        $("#upload-file-field").show();
    });

    $("#upload-change-to-text").click(function() {
        $("#upload-file-field").hide();
        $("#upload-text-field").show();
    });

    // fill table with the documents
    $.getJSON("/api/get/documents", function (data) {
        for (var i=0; i<data.length; i++) {
            if (data[i]["isText"]) {
                var table_line = "<tr><th>" + data[i]["content"] + "</th>";
             } else {
                 var table_line = "<tr><th><a href=\"/static/uploads/" + data[i]["content"] + "\">" + data[i]["content"] + "</a></th>";
             }
            table_line += "<th>" + data[i]["user"] + "</th>";
            table_line += "<th>" + data[i]["date"] + "</th>";
            table_line += "<th><a href=\"/api/delete/" + data[i]["md5"] + "\">✗</a></th></tr>";
            $("tbody").append(table_line);
        }
    });
});

var docCookies = {
  getItem: function (sKey) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!sKey || !this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: /* optional method: you can safely remove it! */ function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  }
};
