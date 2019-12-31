var core;

(function() {
    function generateID(length) {
        var returns = "";
        var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
        
        for (var i = 0; i < length; i++)
            returns += chars.charAt(Math.floor(Math.random() * chars.length));
        
        return returns;
    }
    
    core = {
        doneHello: false,
        responseKey: ""
    };

    if (lang.list["overrides"] == undefined) {
        lang.list["overrides"] = {};
    }

    $(function() {
        core.responseKey = generateID(16);

        addEventListener("message", function(event) {
            if (event.data.for == "subOSApp") {
                if (event.data.load) {
                    $("container").html(event.data.load);
                } else if (event.data.icon) {
                    $("#splashIcon").attr("src", event.data.icon);
                }
            }
        });
        
        parent.postMessage({
            for: "subOS",
            helloResponse: core.responseKey
        }, "*");
        
        $(document).on("click", "*", function() {
            parent.postMessage({
                for: "subOS",
                bringToFront: true,
                responseKey: core.responseKey
            }, "*");
        });

        $(document).on("contextmenu", "*", function(e) {
            e.preventDefault();
        });

        $(document).on("keydown", "*", function(event) {
            if (event.keyCode == 73 && event.altKey) {
                parent.postMessage({
                    for: "subOS",
                    pressWindowButton: 0,
                    responseKey: core.responseKey
                }, "*");
            } else if (event.keyCode == 79 && event.altKey) {
                parent.postMessage({
                    for: "subOS",
                    pressWindowButton: 1,
                    responseKey: core.responseKey
                }, "*");
            } else if (event.keyCode == 80 && event.altKey) {
                parent.postMessage({
                    for: "subOS",
                    pressWindowButton: 2,
                    responseKey: core.responseKey
                }, "*");
            }

            sReader._handleKeypress(event);
    
            event.stopPropagation();
        });

        setTimeout(function() {
            $("#splash").fadeOut();
        }, 1000);
    });
})();