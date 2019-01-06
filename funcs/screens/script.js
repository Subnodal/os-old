var screens = {
    show: function(name) {
        $("screen").hide();
        $("screen[name=" + name + "]").show();

        if (sReader.reading) {
            if ($("screen[name=" + name + "]").attr("data-readable") == undefined) {
                sReader.speak(_("Screen navigation to %, press Tab for first object", $("screen[name=" + name + "]").attr("name")));
            } else {
                sReader.speak(_("Screen navigation to %, press Tab for first object", $("screen[name=" + name + "]").attr("data-readable")));
            }
        }
    },

    fade: function(name, time = 500) {
        $("screen").fadeOut(time);
        $("screen[name=" + name + "]").fadeIn(time);

        if (sReader.reading) {
            if ($("screen[name=" + name + "]").attr("data-readable") == undefined) {
                sReader.speak(_("Screen navigation to %, press Tab for first object", $("screen[name=" + name + "]").attr("name")));
            } else {
                sReader.speak(_("Screen navigation to %, press Tab for first object", $("screen[name=" + name + "]").attr("data-readable")));
            }
        }
    }
};