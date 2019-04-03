var mouse = {
    cursor: {
        wait: function(use = true) {
            if (use) {
                $("#mouseCursor").fadeIn();
            } else {
                $("#mouseCursor").fadeOut();
            }
        },

        currentAngle: 0
    }
};

$(function() {
    $(document).on("mouseup mousedown click mousemove", "*", function(event) {
        $("#mouseCursor").css({
            top: event.pageY - 10,
            left: event.pageX + 10
        });
    });

    setInterval(function() {
        mouse.cursor.currentAngle += 3;

        if (mouse.cursor.currentAngle >= 360) {
            mouse.cursor.currentAngle = 0;
        }

        $("#mouseCursor").css("transform", "rotate(" + mouse.cursor.currentAngle + "deg)");
    }, 10);
});