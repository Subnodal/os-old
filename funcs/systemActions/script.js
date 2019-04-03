var systemActions = {
    shutdown: function(callback = function() {}) {
        alert(_("Please wait while the system shuts down."), _("Shutting down..."), []);

        bc.get("shutdown", callback);
    },

    reboot: function(callback = function() {}) {
        alert(_("Please wait while the system reboots."), _("Rebooting..."), []);

        bc.get("reboot", callback);
    },

    wifiUpdate: function(callback = function() {}) {
        bc.get("wifi", ["update"], callback)
    },

    wifiGetSSID: function(callback) {
        bc.get("wifi", ["ssid"], callback);
    },

    wifiGetWAPs: function(callback) {
        bc.get("wifi", ["list"], function(data) {
            callback(data.split("\n"));
        });
    },

    wifiSetPassConnection: function(username, password, callback = function() {}) {
        bc.get("wifi", ["set", username, password], callback);
    },

    wifiSetOpenConnection: function(username, callback = function() {}) {
        bc.get("wifi", ["set", username], callback);
    },

    wifiDisconnect: function(callback = function() {}) {
        bc.get("wifi", ["off"], callback);
    }
};