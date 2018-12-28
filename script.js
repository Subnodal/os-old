$(function() {
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
});