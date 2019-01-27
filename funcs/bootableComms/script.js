var bc = {
    generationKey: "",

    init: function() {
        $.ajax({
            url: "http://0.0.0.0:5000/generate"
        }).done(function(data) {
            bc.generationKey = data;
        });
    },

    post: function(mode, params) {
        var paramsList = "";

        for (var i = 0; i < params.length; i++) {
            paramsList += encodeURIComponent(params[i]) + "/"
        }

        paramsList = paramsList.substring(0, paramsList.length - 1);

        $.ajax({
            url: "http://0.0.0.0:5000/" + mode + "/" + bc.generationKey + "/" + paramsList
        });
    }
};

$(function() {
    bc.init();
});