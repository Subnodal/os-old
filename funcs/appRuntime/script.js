var appRuntime = {
    lastAppHTML: "",
    lastAppIcon: "",
    
    launchHTML: function(HTML, title = "Untitled App", icon) {
        appRuntime.lastAppHTML = HTML;
        appRuntime.lastAppIcon = icon;

        newWindow("funcs/appRuntime/sandbox/index.html?lang=" + lang.lang + "&languageWarningMessage=" + _("Sorry! This app is unavailable in your language.") + "&languageWarningButton=" + _("OK"), title, (icon || undefined));
    },

    associateLastApp: function() {
        $("window:last").find("iframe")[0].contentWindow.postMessage({
            for: "subOSApp",
            load: appRuntime.lastAppHTML
        }, "*");

        $("window:last").find("iframe")[0].contentWindow.postMessage({
            for: "subOSApp",
            icon: appRuntime.lastAppIcon
        }, "*");
    }
};