var inFullscreen = false;
var accounts = [
    {
        name: "James",
        image: "https://avatars2.githubusercontent.com/u/42580341?s=460&v=4"
    },
    {
        name: "Seb",
        image: "https://avatars0.githubusercontent.com/u/39373619?s=460&v=4"
    }
    ,
    {
        name: "Herbie"
    },
    {
        name: "Caspar"
    },
    {
        name: "Guest"
    }
];
var selectedAccount = 0;
var updateAccount = true;

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

function selectSignInAccount(index) {
    selectedAccount = index;

    $(".signInPersonalPicture").removeClass("selected");
    $(".signInPersonalPicture[data-account='" + index + "']").addClass("selected");

    if (sReader.reading) {sReader.speak("Account selected: " + accounts[selectedAccount].name);}
}

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

        var accountsBuild = "";

        if (updateAccount) {
            for (var i = 0; i < accounts.length; i++) {
                accountsBuild += `
                    <div class="signInPersonalItem">
                        <a
                            href="javascript:selectSignInAccount(` + i + `);"
                            class="hidden button"
                            data-readable="Select ` + accounts[i].name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + `"
                        >
                            <img
                                src="` + (accounts[i].image != undefined ? accounts[i].image.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : "media/defaultAccount.png") + `"
                                onerror="this.src = 'media/defaultAccount.png';"
                                class="signInPersonalPicture" data-account=` + i + `
                            />
                        </a>
                        <div class="signInPersonalText">` + accounts[i].name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + `</div>
                    </div>
                `;
            }

            $(".signInPersonal").html(accountsBuild);

            if (accounts.length == 1) {
                selectSignInAccount(0);
            }

            updateAccount = false;
        }
    }, 10);

    $("main").css("padding-top", $(".infoBar").outerHeight() + "px");
});