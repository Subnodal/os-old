var screens = {
    show: function(name) {
        $("screen").hide();
        $("screen[name=" + name + "]").show();

        if (sReader.reading) {
            if ($("screen[name=" + name + "]").attr("data-readable") == undefined) {
                sReader.speak("Screen navigation to " + $("screen[name=" + name + "]").attr("name") + ", press Tab for first object");
            } else {
                sReader.speak("Screen navigation to " + $("screen[name=" + name + "]").attr("data-readable") + ", press Tab for first object");
            }
        }
    },

    fade: function(name, time = 500) {
        $("screen").fadeOut(time);
        $("screen[name=" + name + "]").fadeIn(time);

        if (sReader.reading) {
            if ($("screen[name=" + name + "]").attr("data-readable") == undefined) {
                sReader.speak("Screen navigation to " + $("screen[name=" + name + "]").attr("name") + ", press Tab for first object");
            } else {
                sReader.speak("Screen navigation to " + $("screen[name=" + name + "]").attr("data-readable") + ", press Tab for first object");
            }
        }
    }
};