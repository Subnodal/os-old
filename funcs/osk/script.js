var osk = {
    animating: false,

    open: function() {
        if (!osk.animating) {
            osk.animating = true;

            if (sReader.reading) {
                sReader.speak("On-screen keyboard opened");
            }

            $("#osk").show();

            setTimeout(function() {
                $("#osk").css("top", "60vh");
            }, 20);

            setTimeout(function() {
                osk.animating = false;
            }, 520);
        }
    },

    close: function() {
        if (!osk.animating) {
            osk.animating = true;

            if (sReader.reading) {
                sReader.speak("On-screen keyboard closed");
            }

            $("#osk").css("top", "100vh");

            setTimeout(function() {
                $("#osk").hide();

                osk.animating = false;
            }, 500);
        }
    },

    init: function() {
        $(document).on("click", "input", function(event) {
            if (tablet.inUse) {
                osk.open();
            }

            event.stopPropagation();
        });
        
        $(document).on("click", "*:not(input)", function(event) {
            if (tablet.inUse) {
                osk.close();
            }
        });

        $("#osk").click(function(event) {
            event.stopPropagation();
        });

        $("#osk").children().click(function(event) {
            event.stopPropagation();
        });
    }
};

$(function() {
    osk.init();
});