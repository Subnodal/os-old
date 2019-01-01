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

    $(function() {
        core.responseKey = generateID(16);
        
        parent.postMessage({
            for: "subOS",
            helloResponse: core.responseKey
        }, "*");
        
        $(document).on("click", function() {
            parent.postMessage({
                for: "subOS",
                bringToFront: true,
                responseKey: core.responseKey
            }, "*");
        });
    });
})();