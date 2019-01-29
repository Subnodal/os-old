var systemActions = {
    shutdown: function() {
        alert(_("Please wait while the system shuts down."), _("Shutting down..."), []);

        bc.post("shutdown");
    },

    reboot: function() {
        alert(_("Please wait while the system reboots."), _("Rebooting..."), []);

        bc.post("reboot");
    }
};