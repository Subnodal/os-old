var screens = {
    show: function(name) {
        $("screen").hide();
        $("screen[name=" + name + "]").show();
    },

    fade: function(name, time = 500) {
        $("screen").fadeOut(time);
        $("screen[name=" + name + "]").fadeIn(time);
    }
};