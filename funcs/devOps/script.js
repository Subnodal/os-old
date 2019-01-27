var devOps = {
    shutdown: function() {
        alert(_("Please wait while the system shuts down."), _("Shutting down..."), []);

        bc.post("shutdown");
    },

    reboot: function() {
        alert(_("Please wait while the system reboots."), _("Rebooting..."), []);

        bc.post("reboot");
    },

    updateFromGit: function() {
        alert(_("subOS is updating via Git. It will restart when the update has finished."), _("Updating..."), []);

        bc.post("devops", ["updateFromGit"]);
    }
};