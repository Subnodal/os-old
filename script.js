var inFullscreen = false;

$(function() {
    if ($("body").width() < 500) {
        window.location.href = "notSupported.html";
    }

    screens.show("signIn");

    setInterval(function() {
        var date = new Date();

        if (date.getMinutes() < 10) {
            $(".infoTime").html(date.getHours() + ":0" + date.getMinutes());
            $(".infoTime").attr("data-readable", "The time is " + date.getHours() + ":0" + date.getMinutes());
        } else {
            $(".infoTime").html(date.getHours() + ":" + date.getMinutes());
            $(".infoTime").attr("data-readable", "The time is " + date.getHours() + ":" + date.getMinutes());
        }
    }, 10);

    $("main").css("height", "calc(100vh - " + $(".infoBar").height() + "px)");
});

function toggleFullscreen() {
    if (!inFullscreen) {
        try {
            document.body.requestFullscreen();
        } catch (e) {}

        try {
            document.body.webkitRequestFullScreen();
        } catch (e) {}

        try {
            document.body.mozRequestFullScreen();
        } catch (e) {}

        try {
            document.body.msRequestFullScreen();
        } catch (e) {}

        inFullscreen = true;
    } else {
        try {
            document.exitFullscreen();
        } catch (e) {}

        try {
            document.webkitCancelFullScreen();
        } catch (e) {}

        try {
            document.mozCancelFullScreen();
        } catch (e) {}

        try {
            document.msExitFullScreen();
        } catch (e) {}

        inFullscreen = false;
    }
}