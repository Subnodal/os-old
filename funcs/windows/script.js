var zIndexLevel = 0;

function closeWindow(window) {
    window.fadeOut();

    setTimeout(function() {
        window.remove();
    }, 500);
}

function newWindow(src, title = "Untitled App") {
    $(`
        <window>
            <div class="windowBar">
                ` + title.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;") + `
            </div>
            <div class="windowButtons">
                <button onclick="closeWindow($(this).parent().parent());" class="windowButton" data-readable="Minimise">_</button>
                <button onclick="$(this).parent().parent().children('.windowBar').dblclick();" class="windowButton" data-readable="Maximise">O</button>
                <button onclick="closeWindow($(this).parent().parent());" class="windowButton" data-readable="Close">X</button>
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
            zIndexLevel += 1;

            $(this).css("z-index", zIndexLevel);
            $(this).css("background-color", "var(--uiColour)");
            $(this).siblings(".window").css("background-color", "var(--uiDeselectedColour)");

            $(".infoBar, .appBar").css("z-index", zIndexLevel + 1);
        })
        .css({top: 100, left: 100})
        .hide()
        .fadeIn()
    ;

    $(".windowContent").click(function(event) {
        $(this).parent().parent().mousedown();
    });

    var parent = $(".windowContent:last");

    parent.contents().click(function(event) {
        parent.click();
    });

    parent.on("load", function() {
        parent[0].contentWindow.postMessage({
            for: "subOS",
            hello: true
        }, "*");
    });
}

$(function() {
    $("windows").mousedown(function() {
        $("window").css("background-color", "var(--uiDeselectedColour)");
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
        } else {
            $(this).css({
                width: "calc(100% - 80px)",
                "padding-left": "0",
                "padding-right": "0"
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
        }
    });
});

addEventListener("message", function(event) {
    if (event.data.for == "subOS" && event.data.helloResponse) {
        $("window:last").attr("response-key", event.data.helloResponse);
    } else if (event.data.for == "subOS" && event.data.bringToFront && event.data.responseKey) {
        $("window[response-key='" + event.data.responseKey + "']").mousedown();
    }
}, false);