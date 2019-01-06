var zIndexLevel = 0;
var minimisedWindows = [];

function minimiseWindow(selWindow) {
    minimisedWindows.push(selWindow.attr("response-key"));

    var normalTop = selWindow.css("top");

    selWindow.animate({
        "top": $(window).outerHeight() + "px"
    }, {duration: 500});

    setTimeout(function() {
        selWindow.hide();
        selWindow.css("top", normalTop);
    }, 600);

    $(".appBarOpenAppButton").children(".appBarOpenAppIcon").removeClass("selected");

    if (sReader.reading) {sReader.speak(_("Minimised"));}
}

function restoreWindow(selWindow) {
    minimisedWindows.pop(minimisedWindows.findIndex(function(data) {
        return data == selWindow.attr("response-key");
    }));

    var normalTop = selWindow.css("top");

    selWindow.css("top", $(window).outerHeight() + "px");
    selWindow.show();

    selWindow.animate({
        "top": normalTop
    }, {duration: 500});

    $(".appBarOpenAppButton[response-key-link='" + selWindow.attr("response-key") + "']").children(".appBarOpenAppIcon").addClass("selected");
    $(".appBarOpenAppButton:not([response-key-link='" + selWindow.attr("response-key") + "'])").children(".appBarOpenAppIcon").removeClass("selected");

    if (sReader.reading) {sReader.speak(_("Restored"));}
}

function closeWindow(selWindow, doAppBarAnimation = true) {
    selWindow.fadeOut();

    if (doAppBarAnimation) {
        $(".appBar").slideUp(200);
    }

    setTimeout(function() {
        $(".appBarOpenAppButton[response-key-link='" + selWindow.attr("response-key") + "']").remove();

        if (doAppBarAnimation) {
            $(".appBar").slideDown(200);
        }
    }, 200);

    setTimeout(function() {
        selWindow.remove();
    }, 500);

    if (sReader.reading) {sReader.speak(_("Closed"));}
}

function newWindow(src, title = "Untitled App", icon = "media/defaultAccount.png") {
    $(`
        <window>
            <div class="windowBar noTranslate">
                ` + title.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;") + `
            </div>
            <div class="windowButtons">
                <button onclick="minimiseWindow($(this).parent().parent());" class="windowButton" data-readable="@Minimise %|` + title.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + `"><i>keyboard_arrow_down</i></button>
                <button onclick="$(this).parent().parent().children('.windowBar').dblclick();" class="windowButton" data-readable="@Maximise %|` + title.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + `"><i>fullscreen</i></button>
                <button onclick="closeWindow($(this).parent().parent());" class="windowButton" data-readable="@Close %|` + title.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + `"><i>close</i></button>
            </div>
            <div class="windowBody">
                <iframe class="windowContent" src="` + src.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + `"><iframe>
            </div>
        </window>
    `)
        .appendTo("windows")
        .draggable({
            cancel: ".windowBody",
            containment: "window",
            start: function() {
                $(".windowBody").css("pointer-events", "none");
                $(".windowBody").children(".windowContent").css("pointer-events", "none");
            },
            stop: function(event) {
                $(".windowBody").css("pointer-events", "auto");
                $(".windowBody").children(".windowContent").css("pointer-events", "auto");

                if ($(event.target).offset().top <= $(".infoBar").outerHeight()) {
                    $(event.target).children(".windowBar").dblclick();
                }
            }
        })
        .resizable({
            handles: "n, e, s, w, ne, nw, se, sw",
            alsoResize: $(this).children(".windowBody, .windowContent"),
            start: function() {
                $(".windowBody").css("pointer-events", "none");
                $(".windowBody").children(".windowContent").css("pointer-events", "none");
            },
            stop: function() {
                $(".windowBody").css("pointer-events", "auto");
                $(".windowBody").children(".windowContent").css("pointer-events", "auto");
            }
        })
        .mousedown(function() {
            menus.hideAll();

            zIndexLevel += 1;

            $(this).css("z-index", zIndexLevel);
            $(this).css("background-color", "var(--uiColour)");
            $(this).siblings("window").css("background-color", "var(--uiDeselectedColour)");

            $(".infoBar, .appBar, menu, #alertBackground, #alertBox, #sReader, #sReaderBlackout").css("z-index", zIndexLevel + 1);

            $(".appBarOpenAppButton[response-key-link='" + $(this).attr("response-key") + "']").children(".appBarOpenAppIcon").addClass("selected");
            $(".appBarOpenAppButton:not([response-key-link='" + $(this).attr("response-key") + "'])").children(".appBarOpenAppIcon").removeClass("selected");
        })
        .css({top: 100, left: 100})
        .hide()
        .fadeIn()
    ;

    zIndexLevel += 1;

    $("window:last").css("z-index", zIndexLevel);
    $("window:last").css("background-color", "var(--uiColour)");
    $("window:last").siblings("window").css("background-color", "var(--uiDeselectedColour)");

    $(".infoBar, .appBar, menu, #alertBackground, #alertBox, #sReader, #sReaderBlackout").css("z-index", zIndexLevel + 1);

    $(".windowContent").click(function(event) {
        $(this).parent().parent().mousedown();
    });

    var parent = $(".windowContent:last");

    parent.contents().click(function(event) {
        parent.click();
    });

    $(".appBarOpenAppButton").children(".appBarOpenAppIcon").removeClass("selected");

    $(`
        <a class="appBarOpenAppButton hidden readableButton"><img src="` + icon.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") + `" class="appBarOpenAppIcon selected" data-readable="Unavailable App" /></a>
    `)
        .appendTo(".appBarOpenApps")
        .hide()
        .fadeIn()
    ;

    parent.on("load", function() {
        parent[0].contentWindow.postMessage({
            for: "subOS",
            hello: true
        }, "*");
    });

    $("window:last").find(".windowButton").get(2).focus();

    if (sReader.reading) {sReader.speak(_("New window % opened, press Tab for first object, press Enter to close now", title));}
}

function doWindowTask(key) {
    var doHighlight = true;

    if (minimisedWindows.findIndex(function(data) {
        return data == $("window[response-key='" + key + "']").attr("response-key");
    }) >= 0) {
        restoreWindow($("window[response-key='" + key + "']"));
    } else {
        if (Number($("window[response-key='" + key + "']").css("z-index")) == zIndexLevel) {
            minimiseWindow($("window[response-key='" + key + "']"));

            doHighlight = false;
        }
    }

    zIndexLevel += 1;

    $("window[response-key='" + key + "']").css("z-index", zIndexLevel);
    $("window[response-key='" + key + "']").css("background-color", "var(--uiColour)");
    $("window[response-key='" + key + "']").siblings("window").css("background-color", "var(--uiDeselectedColour)");

    $(".infoBar, .appBar, menu, #alertBackground, #alertBox, #sReader, #sReaderBlackout").css("z-index", zIndexLevel + 1);

    if (doHighlight) {
        $(".appBarOpenAppButton[response-key-link='" + key + "']").children(".appBarOpenAppIcon").addClass("selected");
        $(".appBarOpenAppButton:not([response-key-link='" + key + "'])").children(".appBarOpenAppIcon").removeClass("selected");
    }
}

$(function() {
    $("windows").mousedown(function(event) {
        if (event.target == this) {
            $("window").css("background-color", "var(--uiDeselectedColour)");
        }
    });

    $(document.body).on("dblclick", ".windowBar", function() {
        if ($(this).parent().width() == $(window).width()) {
            $(this).css({
                width: "calc(100% - 90px)",
                "padding-left": "5px",
                "padding-right": "5px"
            });
            $(this).parent().css({
                padding: "5px",
                "border-radius": "5px"
            });
            $(this).parent().animate({"width": "400px"}, {duration: 500, queue: false});
            $(this).parent().animate({"height": "300px"}, {duration: 500, queue: false});
            $(this).parent().animate({top: 100, left: 100}, {duration: 500, queue: false});
            $(this).parent().draggable("enable");
            $(this).parent().resizable("enable");

            if (sReader.reading) {sReader.speak(_("Restored"));}

            $($(this).parent().find("i")[1]).text("fullscreen");
        } else {
            $(this).css({
                width: "calc(100% - 90px)",
                "padding-left": "5px",
                "padding-right": "5px"
            });
            $(this).parent().animate({"width": $(window).width() + "px"}, {duration: 500, queue: false});
            $(this).parent().animate({"height": ($(window).height() - $(".infoBar").outerHeight() - $(".appBar").outerHeight() - 5) + "px"}, {duration: 500, queue: false});
            $(this).parent().animate({top: $(".infoBar").outerHeight(), left: 0}, {duration: 500, queue: false});
            $(this).parent().animate({padding: "5px 0 0 0"}, {duration: 500, queue: false});
            $(this).parent().draggable("disable");
            $(this).parent().resizable("disable");

            var thisPassOn = this;

            setTimeout(function() {
                $(thisPassOn).parent().css({
                    "border-radius": "0"
                });
            }, 500);

            if (sReader.reading) {sReader.speak(_("Maximised"));}

            $($(this).parent().find("i")[1]).text("fullscreen_exit");
        }
    });

    $(document.body).keydown(function(e) {
        if (e.keyCode == 73 && e.altKey) {
            $("window").each(function() {
                if ($(this).css("z-index") == zIndexLevel) {
                    $(this).find(".windowButton").get(0).click();
                }
            });
        } else if (e.keyCode == 79 && e.altKey) {
            $("window").each(function() {
                if ($(this).css("z-index") == zIndexLevel) {
                    $(this).find(".windowButton").get(1).click();
                }
            });
        } else if (e.keyCode == 80 && e.altKey) {
            $("window").each(function() {
                if ($(this).css("z-index") == zIndexLevel) {
                    $(this).find(".windowButton").get(2).click();
                }
            });
        }
    });
});

addEventListener("message", function(event) {
    if (event.data.for == "subOS" && event.data.helloResponse) {
        $("window:last").attr("response-key", event.data.helloResponse);
        $("a.appBarOpenAppButton:last").attr("response-key-link", event.data.helloResponse);
        $("a.appBarOpenAppButton:last").attr("href", "javascript:doWindowTask('" + event.data.helloResponse + "');");
        $("a.appBarOpenAppButton:last").attr("data-readable", "@Restore or minimise %|" + $("window[response-key='" + event.data.helloResponse + "']").children(".windowBar").text().trim())
    } else if (event.data.for == "subOS" && event.data.bringToFront && event.data.responseKey) {
        $("window[response-key='" + event.data.responseKey + "']").mousedown();
    } else if (event.data.for == "subOS" && event.data.pressWindowButton != undefined && event.data.responseKey) {
        $("window[response-key='" + event.data.responseKey + "']").find(".windowButton").get(event.data.pressWindowButton).click();
    }
}, false);