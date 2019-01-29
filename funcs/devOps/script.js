var devOps = {
    updateFromGit: function() {
        alert(_("subOS is updating via Git. It will restart when the update has finished."), _("Updating..."), []);

        bc.post("devops", ["updateFromGit"]);
    }
};