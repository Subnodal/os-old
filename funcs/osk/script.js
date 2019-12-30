var osk = {
    animating: false,
    selectedInput: null,
    selectedInputStart: 0,
    selectedInputEnd: 0,
    lang: lang.lang,
    layout: null,
    keyboardLayout: [],
    shifting: false,
    usingSpecialMode: null,
    throughFrame: null,
    wasUsed: false,
    isOpen: false,

    open: function(selectedInput = $("*:focus"), throughFrame = false) {
        if (!osk.animating) {
            osk.animating = true;
            
            if (sReader.reading && !osk.isOpen) {sReader.speak(_("On-screen keyboard opened"));}

            osk.isOpen = true;

            $("#frameInput").val("");
            osk.selectedInputStart = 0;
            osk.selectedInputEnd = 0;

            if (throughFrame) {
                osk.throughFrame = $(document.activeElement);
                osk.selectedInput = $("#frameInput");
            } else {
                osk.throughFrame = null;
                osk.selectedInput = selectedInput;
            }

            osk.toggleShift(false);
            osk.toggleSpecial(false);

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

            if (sReader.reading && osk.isOpen) {
                sReader.speak(_("On-screen keyboard closed"));
            }

            osk.isOpen = false;

            $("#osk").css("top", "100vh");
            $("#frameInput").val("");

            osk.selectedInput = null;
            osk.selectedInputStart = null;
            osk.selectedInputEnd = null;
            osk.throughFrame = null;

            setTimeout(function() {
                $("#osk").hide();

                osk.animating = false;
            }, 500);
        }
    },

    click: function(char, other) {
        var imeEvent = $.Event("keydown");
        imeEvent.target = osk.selectedInput[0];
        imeEvent.fromOSK = true;

        osk.wasUsed = true;

        if (sReader.reading) {sReader.playTone("enter");}

        if (char != "") {
            if (osk.selectedInputStart != osk.selectedInputEnd) {
                osk.selectedInput.val(osk.selectedInput.val().substring(0, osk.selectedInputStart) + osk.selectedInput.val().substring(osk.selectedInputEnd));

                osk.selectedInput.focus();

                document.activeElement.selectionStart = osk.selectedInputStart;
                document.activeElement.selectionEnd = osk.selectedInputStart;
            }

            osk.selectedInput.val(osk.selectedInput.val().substring(0, osk.selectedInputStart) + char + osk.selectedInput.val().substring(osk.selectedInputStart));

            osk.selectedInput.focus();
            document.activeElement.selectionStart = osk.selectedInputStart + 1;
            document.activeElement.selectionEnd = osk.selectedInputStart + 1;

            imeEvent.keyCode = char.toUpperCase().charCodeAt(0);
        } else if (other == "backspace") {
            if (osk.selectedInputStart != osk.selectedInputEnd) {
                osk.selectedInput.val(osk.selectedInput.val().substring(0, osk.selectedInputStart) + osk.selectedInput.val().substring(osk.selectedInputEnd));

                osk.selectedInput.focus();

                document.activeElement.selectionStart = osk.selectedInputStart;
                document.activeElement.selectionEnd = osk.selectedInputStart;
            } else if (osk.selectedInputStart > 0) {
                osk.selectedInput.val(osk.selectedInput.val().substring(0, osk.selectedInputStart - 1) + osk.selectedInput.val().substring(osk.selectedInputStart));

                osk.selectedInput.focus();

                document.activeElement.selectionStart = osk.selectedInputStart - 1;
                document.activeElement.selectionEnd = osk.selectedInputStart - 1;
            }

            imeEvent.keyCode = 8;
        }

        osk.selectedInputStart = document.activeElement.selectionStart;
        osk.selectedInputEnd = document.activeElement.selectionEnd;

        if (osk.throughFrame != null) {
            if (ime.inUse && char == " " && ime.candidates != []) {
                osk.selectedInput.val(osk.selectedInput.val().substring(0, osk.selectedInputStart - 1) + osk.selectedInput.val().substring(osk.selectedInputEnd));

                osk.selectedInput.focus();

                document.activeElement.selectionStart = osk.selectedInputStart;
                document.activeElement.selectionEnd = osk.selectedInputStart;
            }
            
            osk.throughFrame[0].contentWindow.postMessage({
                for: "subOSOSK",
                set: $("#frameInput").val()
            }, "*");

            osk.throughFrame[0].contentWindow.postMessage({
                for: "subOSOSK",
                key: imeEvent.keyCode
            }, "*");

            osk.throughFrame[0].contentWindow.postMessage({
                for: "subOSOSK",
                focus: true
            }, "*");
        } else {
            osk.selectedInput.focus();
        }

        if (osk.throughFrame == null) {
            if (char != " ") {
                ime.doEvent(imeEvent);
                ime.registerFinal(imeEvent);
            } else if (ime.inUse && ime.pinyinCharBuffer.length != 0 && ime.candidates.length != 0) {
                var didOSKSkip = false;

                if (document.activeElement.selectionStart >= $(osk.selectedInput).val().length) {
                    osk.selectedInput.val(osk.selectedInput.val().substring(0, osk.selectedInputStart - 1) + osk.selectedInput.val().substring(osk.selectedInputEnd));
                } else {
                    didOSKSkip = true;
                }
                
                imeEvent.fromOSK = false;
                ime.registerFinal(imeEvent, didOSKSkip);
            } else {
                ime.pinyinCharBuffer = [];
            }
        }

        if (osk.throughFrame) {osk.selectedInput.focus();}

        document.activeElement.selectionStart = osk.selectedInputStart;
        document.activeElement.selectionEnd = osk.selectedInputEnd;

        if (osk.throughFrame != null) {
            osk.throughFrame[0].contentWindow.postMessage({
                for: "subOSOSK",
                selectionStart: osk.selectedInputStart,
                selectionEnd: osk.selectedInputEnd
            }, "*");
        }
    },

    toggleShift: function(set = null) {
        if (set == null) {
            osk.shifting = !osk.shifting;
        } else {
            osk.shifting = set;
        }

        osk.setKeyboardLayout(osk.lang, osk.layout, osk.usingSpecialMode ? "special" : "normal", osk.shifting);

        if (osk.throughFrame != null) {
            osk.throughFrame[0].contentWindow.postMessage({
                for: "subOSOSK",
                focus: true
            }, "*");
        }

        osk.selectedInput.focus();
    },

    toggleSpecial: function(set = null) {
        if (set == null) {
            osk.usingSpecialMode = !osk.usingSpecialMode;
        } else {
            osk.usingSpecialMode = set;
        }

        osk.setKeyboardLayout(osk.lang, osk.layout, osk.usingSpecialMode ? "special" : "normal", osk.shifting);

        if (osk.throughFrame != null) {
            osk.throughFrame[0].contentWindow.postMessage({
                for: "subOSOSK",
                focus: true
            }, "*");
        }

        osk.selectedInput.focus();
    },

    setKeyboardLayout: function(locale, layout, type, upper = false) {
        osk.keyboardLayout = osk.keyboardLayouts[locale][layout][type];

        $("#osk").html("");

        for (var i = 0; i < osk.keyboardLayout.length; i++) {
            for (var j = 0; j < osk.keyboardLayout[i][upper ? "upper" : "lower"].length; j++) {
                if (typeof(osk.keyboardLayout[i][upper ? "upper" : "lower"][j]) == "string") {
                    $("<button></button>")
                        .text(osk.keyboardLayout[i][upper ? "upper" : "lower"][j])
                        .addClass("oskButton")
                        .addClass("noTranslate")
                        .click(function(event) {
                            osk.click($(event.target).text());

                            if (!osk.usingSpecialMode) {
                                osk.toggleShift(false);
                            }
                        })
                        .appendTo("#osk")
                    ;
                } else if (typeof(osk.keyboardLayout[i][upper ? "upper" : "lower"][j]) == "object") {
                    if (osk.keyboardLayout[i][upper ? "upper" : "lower"][j].space) {
                        $("<button></button>")
                            .addClass("oskButton")
                            .addClass("oskSpace")
                            .attr("data-readable", _("Space"))
                            .click(function() {
                                osk.click(" ");
                            })  
                            .appendTo("#osk")
                        ;
                    } else if (osk.keyboardLayout[i][upper ? "upper" : "lower"][j].backspace) {
                        $("<button><i>backspace</i></button>")
                            .addClass("oskButton")
                            .attr("data-readable", _("Backspace"))
                            .click(function() {
                                osk.click("", "backspace");
                            })
                            .appendTo("#osk")
                        ;
                    } else if (osk.keyboardLayout[i][upper ? "upper" : "lower"][j].enter) {
                        $("<button><i>keyboard_return</i></button>")
                            .addClass("oskButton")
                            .attr("data-readable", _("Enter"))
                            .click(function() {
                                osk.click("\n");
                            })
                            .appendTo("#osk")
                        ;
                    } else if (osk.keyboardLayout[i][upper ? "upper" : "lower"][j].shift) {
                        $("<button><i>arrow_upward</i></button>")
                            .addClass("oskButton")
                            .addClass("oskShift")
                            .addClass(osk.keyboardLayout[i][upper ? "upper" : "lower"][j].right ? "oskShiftRight" : "")
                            .css("text-align", osk.keyboardLayout[i][upper ? "upper" : "lower"][j].right ? "left" : "center")
                            .attr("data-readable", _("Shift"))
                            .click(function() {
                                osk.toggleShift();

                                if (sReader.reading) {
                                    setTimeout(function() {
                                        sReader.stop();
                                    }, 500);

                                    setTimeout(function() {
                                        if (osk.shifting) {
                                            sReader.speak(_("Shift is on"));
                                        } else {
                                            sReader.speak(_("Shift is off"));
                                        }
                                    }, 600);
                                }
                            })
                            .appendTo("#osk")
                        ;
                    } else if (osk.keyboardLayout[i][upper ? "upper" : "lower"][j].special) {
                        $("<button></button>")
                            .text("?123")
                            .addClass("oskButton")
                            .addClass("oskSpecial")
                            .attr("data-readable", _("Switch modes"))
                            .click(function() {
                                osk.toggleSpecial();
                            })
                            .appendTo("#osk")
                        ;
                    } else if (osk.keyboardLayout[i][upper ? "upper" : "lower"][j].exit) {
                        $("<button><i>keyboard_hide</i></button>")
                            .addClass("oskButton")
                            .addClass("oskExit")
                            .attr("data-readable", _("Exit on-screen keyboard"))
                            .click(function() {
                                osk.close();
                            })
                            .appendTo("#osk")
                        ;
                    } else if (osk.keyboardLayout[i][upper ? "upper" : "lower"][j].html) {
                        $("<button></button>")
                            .html(osk.keyboardLayout[i][upper ? "upper" : "lower"][j].html)
                            .attr("data-readable", osk.keyboardLayout[i][upper ? "upper" : "lower"][j].readable ? osk.keyboardLayout[i][upper ? "upper" : "lower"][j].readable : "")
                            .addClass("oskButton")
                            .appendTo("#osk")
                        ;
                    }
                }
            }

            $("<br>").appendTo("#osk");
        }

        if (osk.shifting) {
            $(".oskShift").addClass("on");
        } else {
            $(".oskShift").removeClass("on");
        }

        if (osk.usingSpecialMode) {
            $(".oskSpecial").addClass("on");
        } else {
            $(".oskSpecial").removeClass("on");
        }
    },

    init: function() {
        if (osk.keyboardLayouts[lang.lang] != undefined) {
            osk.lang = lang.lang;
            osk.layout = Object.keys(osk.keyboardLayouts[lang.lang])[0];
        } else {
            osk.lang = "en-GB";
            osk.layout = "QWERTY";
        }

        osk.setKeyboardLayout(osk.lang, osk.layout, "normal");

        $(document).on("click", "input", function(event) {
            if (tablet.inUse) {
                osk.open();
            }

            ime.pinyinCharBuffer = [];

            ime.hide();

            event.stopPropagation();
        });
        
        $(document).on("click", "*:not(input)", function(event) {
            if (tablet.inUse) {
                osk.close();
            }

            ime.pinyinCharBuffer = [];

            ime.hide();
        });

        $("#osk, #osk *").click(function(event) {
            event.stopPropagation();
        });

        setInterval(function() {
            if (document.activeElement.selectionStart != undefined) {
                osk.selectedInputStart = document.activeElement.selectionStart;
                osk.selectedInputEnd = document.activeElement.selectionEnd;
            }
        }, 10);
    }
};

$(function() {
    osk.init();

    addEventListener("message", function(event) {
        if (event.data.for == "subOSOSK") {
            if (event.data.open && tablet.inUse) {
                osk.open(undefined, true);
            } else if (event.data.close) {
                osk.close();
            } else if (event.data.set != undefined) {
                $("#frameInput").val(event.data.set);
            } else if (event.data.selectionStart != undefined && event.data.selectionEnd != undefined) {
                document.activeElement.selectionStart = event.data.selectionStart;
                document.activeElement.selectionEnd = event.data.selectionEnd;
            }
        }
    });
});