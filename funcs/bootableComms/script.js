function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

var bc = {
    generationKey: "",

    init: function() {
        $.ajax({
            url: "http://0.0.0.0:5000/generate"
        }).done(function(data) {
            bc.generationKey = data;

            var url = new URL(window.location.href);
            url.searchParams.set("bckey", bc.generationKey);

            window.location.href = url.href;
        });
    },

    post: function(mode, params = []) {
        var paramsList = "";

        for (var i = 0; i < params.length; i++) {
            paramsList += encodeURIComponent(params[i]).replace(/%0A/g, "%16") + "/"
        }

        paramsList = paramsList.substring(0, paramsList.length - 1);

        if (paramsList == "") {
            $.ajax({
                url: "http://0.0.0.0:5000/" + mode + "/" + bc.generationKey
            });
        } else {
            $.ajax({
                url: "http://0.0.0.0:5000/" + mode + "/" + bc.generationKey + "/" + paramsList
            });  
        }
    },

    get: function(mode, params = [], callback) {
        var paramsList = "";

        for (var i = 0; i < params.length; i++) {
            paramsList += encodeURIComponent(params[i]) + "/"
        }

        paramsList = paramsList.substring(0, paramsList.length - 1);

        if (paramsList == "") {
            $.ajax({
                url: "http://0.0.0.0:5000/" + mode + "/" + bc.generationKey
            }).done(function (data) {
                callback(data);
            });
        } else {
            $.ajax({
                url: "http://0.0.0.0:5000/" + mode + "/" + bc.generationKey + "/" + paramsList
            }).done(function (data) {
                callback(data);
            });  
        }
    }
};

$(function() {
    if (getURLParameter("bootable") == "true") {
        if (getURLParameter("bckey") == null) {
            bc.init();
        } else {
            bc.generationKey = getURLParameter("bckey");
        }
    }
});