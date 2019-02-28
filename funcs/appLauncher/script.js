var appLauncher = {
    apps: [
        {
            name: _("Test App"),
            native: true,
            nativeHTML: systemApps["testApp"]
        }
    ],

    open: function() {
        menus.show("#appLauncherMenu", 0, 60, false, true);
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
            appRuntime.launchHTML(appLauncher.apps[index].nativeHTML, appLauncher.apps[index].name);
        }
    }
};

$(function() {
    appLauncher.generate();
});