var menus = {
    cancel: false,
    openedMenu: null,

    show: function(menu, x, y, floatRight = false, floatBottom = false) {
        if (menus.openedMenu == menu) {
            menus.hideAll();
        } else {
            menus.cancel = true;
            menus.openedMenu = menu;

            setTimeout(function() {
                $(menu).css(floatRight ? "right" : "left", x);
                $(menu).css(floatBottom ? "bottom" : "top", y);

                $(menu).fadeIn();

                if (sReader.reading) {sReader.speak("Menu opened");}

                $(menu).children().get(0).focus();

                menus.cancel = false;
            }, 100);
        }
    },

    hideAll: function() {
        $("menu").fadeOut(500);

        if (!menus.cancel) {
            setTimeout(function() {
                menus.openedMenu = null;

                $("menu").css({
                    "left": "unset",
                    "right": "unset",
                    "top": "unset",
                    "bottom": "unset"
                });

                if (sReader.reading) {sReader.speak("Menu closed");}
            }, 500);
        }
    }
};

$(document).click(function(event) {
    if ((!$(event.target).is("menu") && !$(event.target).parents().is("menu")) || $(event.target).is(".menuItem:not(.disallowClose)")) {
        menus.hideAll();
    }
});