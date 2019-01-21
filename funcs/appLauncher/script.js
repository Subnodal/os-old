var appLauncher = {
    apps: [
        {
            name: "Test App",
            native: true,
            nativePath: "nativeApps/test/index.html"
        },
        {
            name: "Calculator",
            native: true,
            nativePath: "nativeApps/calculator/index.html"
        },
        {
            name: "Notes",
            native: true,
            nativePath: "nativeApps/notes/index.html"
        }
    ],

    open: function() {
        menus.show($("#appLauncherMenu"), 0, 60, false, true);
    },

    generate: function() {
        var appsHTMLBuilder = "";

        for (var i = 0; i < appLauncher.apps.length; i++) {
            if (appLauncher.apps[i].native) {
                appsHTMLBuilder += `
                    <button onclick="appLauncher.launch(` + i + `);" class="menuItem">@` + appLauncher.apps[i].name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;") + `</button>
                `
            } else {
                appsHTMLBuilder += `
                    <button onclick="appLauncher.launch(` + i + `);" class="menuItem noTranslate">` + appLauncher.apps[i].name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;") + `</button>
                `
            }
        }

        $("#appLauncherMenu").html(`
            <div class="menuArea coloured">@Apps</div>
        ` + appsHTMLBuilder);
    },

    launch: function(index) {
        if (appLauncher.apps[index].native) {
            newWindow(appLauncher.apps[index].nativePath + "?lang=" + lang.lang + "&languageWarningMessage=" + _("Sorry! This app is unavailable in your language."), _(appLauncher.apps[index].name));
        }
    }
};

$(function() {
    appLauncher.generate();
});