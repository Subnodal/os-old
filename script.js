var inFullscreen = false;
var accounts = [
    {
        name: "James",
        image: "https://avatars2.githubusercontent.com/u/42580341?s=460&v=4"
    },
    {
        name: "Seb",
        image: "https://avatars0.githubusercontent.com/u/39373619?s=460&v=4"
    },
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
var selectedAccount = -1;
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

function isSignedIn() {
    return $("screen[name=desktop]").css("display") == "block";
}

function selectSignInAccount(index) {
    selectedAccount = index;

    $(".signInPersonalImage").removeClass("selected");
    $(".signInPersonalImage[data-account='" + index + "']").addClass("selected");

    if (sReader.reading) {sReader.speak(_("Account selected: %", accounts[selectedAccount].name));}
}

function signIn() {
    if (selectedAccount >= 0) {
        $(".myUsername").text(accounts[selectedAccount].name);
        $(".myAccountImage").attr({
            src: accounts[selectedAccount].image != undefined ? accounts[selectedAccount].image : "media/defaultAccount.png",
            onerror: "this.src = 'media/defaultAccount.png';"
        });

        setTimeout(function() {
            $(".signInPersonalImage").removeClass("selected");
            $("#signInNetworkUsername, #signInPassword").val("");
        }, 500);

        screens.fade("desktop");
    } else {
        alert(_("Please select your account."), _("Could not sign you in"));
    }
}

function signOut() {
    $(".appBar").slideUp(500);

    $("window").each(function() {
        closeWindow($(this), false);
    });

    setTimeout(function() {
        setTimeout(function() {
            $(".myUsername").text(_("User"));
            $(".myAccountImage").attr({
                src: "media/defaultAccount.png",
                onerror: ""
            });
            $(".appBar").slideDown();
            $(".appBarOpenApps").html("");
        }, 500);

        screens.fade("signIn");

        selectedAccount = -1;
    }, 500);
}

// Wi-Fi functins, currently temporary until we remove the tests
function connectToWiFi() {
    if ($("#WAPSSID").val() != "") {
        if ($("#WAPPassword").val() != "") {
            systemActions.wifiSetPassConnection($("#WAPSSID").val(), $("#WAPPassword").val());
        } else {
            systemActions.wifiSetOpenConnection($("#WAPSSID").val());
        }

        $("#WAPSSID").val("");
        $("#WAPPassword").val("");

        alert("Please wait while the Wi-Fi connects.", "Wi-Fi information submitted");
    } else {
        alert("Please provide an SSID.", "Incomplete information");
    }
}

function disconnectFromWiFi() {
    systemActions.wifiDisconnect();

    alert("Please wait while the Wi-Fi disconnects.", "Wi-Fi is disconnecting");
}

function refreshSSIDs() {
    systemActions.wifiGetSSID(function(data) {
        $(".currentWAP").text(data);
    });

    systemActions.wifiGetWAPs(function(data) {
        $(".availableWAPs").html("");

        for (var i = 0; i < data.length; i++) {
            $("<li>").text(data[i]).appendTo($(".availableWAPs"));
        }
    });
}

function goToWirelessSetupScreen() {
    if (getURLParameter("bootable") == "true") {
        screens.fade("wirelessSetup");
    } else {
        alert("Sorry, you can't change wireless settings in the web version of subOS.", "Could not go to wireless setup");
    }
}

$(function() {
    if ($("body").width() < 500) {
        window.location.href = "notSupported.html";
    }

    screens.show("signIn");

    setInterval(function() {
        var date = new Date();

        $(".infoTime").html(_("%", date));
        $(".infoTime").attr("data-readable", _("The time is %", date));

        var accountsBuild = "";

        if (updateAccount) {
            for (var i = 0; i < accounts.length; i++) {
                accountsBuild += `
                    <div class="signInPersonalItem">
                        <a
                            href="javascript:selectSignInAccount(` + i + `);"
                            class="hidden button"
                            data-readable="@Select %|` + accounts[i].name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + `"
                        >
                            <img
                                src="` + (accounts[i].image != undefined ? accounts[i].image.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : "media/defaultAccount.png") + `"
                                onerror="this.src = 'media/defaultAccount.png';"
                                data-readable="@Select %|` + accounts[i].name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + `"
                                class="signInPersonalImage" data-account=` + i + `
                            />
                        </a>
                        <div class="signInPersonalText noTranslate">` + accounts[i].name.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + `</div>
                    </div>
                `;
            }

            $(".signInPersonal").html(accountsBuild);

            if (accounts.length == 1) {
                selectSignInAccount(0);
            }

            updateAccount = false;
        }

        $("img").attr("draggable", "false");
    }, 10);

    $("main").css("padding-top", $(".infoBar").outerHeight() + "px");

    $(document.body).on("contextmenu", "*", function(e) {
        e.preventDefault();
    });

    $("#signInPassword").keyup(function(e) {
        if (e.keyCode == 13) {
            signIn();
        }
    });

    if (getURLParameter("bootable") == "true") {
        setInterval(refreshSSIDs, 5000);
    }
});