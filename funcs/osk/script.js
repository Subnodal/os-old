var osk = {
    animating: false,
    selectedInput: null,
    selectedInputStart: 0,

    keyboardLayout: [],

    open: function(selectedInput = $("*:focus")) {
        if (!osk.animating) {
            osk.animating = true;

            if (sReader.reading) {
                sReader.speak("On-screen keyboard opened");
            }

            $("#osk").show();

            osk.selectedInput = selectedInput;

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

            osk.selectedInput = null;
            osk.selectedInputStart = null;

            setTimeout(function() {
                $("#osk").hide();

                osk.animating = false;
            }, 500);
        }
    },

    click: function(char, other) {
        if (char != "") {
            osk.selectedInput.val(osk.selectedInput.val().substring(0, osk.selectedInputStart) + char + osk.selectedInput.val().substring(osk.selectedInputStart));

            osk.selectedInput.focus();
            document.activeElement.selectionStart = osk.selectedInputStart + 1;
            document.activeElement.selectionEnd = osk.selectedInputStart + 1;
        } else if (other == "backspace") {
            if (osk.selectedInputStart > 0) {
                osk.selectedInput.val(osk.selectedInput.val().substring(0, osk.selectedInputStart - 1) + osk.selectedInput.val().substring(osk.selectedInputStart));

                osk.selectedInput.focus();
                document.activeElement.selectionStart = osk.selectedInputStart - 1;
                document.activeElement.selectionEnd = osk.selectedInputStart - 1;
            }
        }
    },

    toggleShift: function() {},

    switchModes: function() {},

    setKeyboardLayout: function(locale, layout, type, upper = false) {
        osk.keyboardLayout = osk.keyboardLayouts[locale][layout][type];

        for (var i = 0; i < osk.keyboardLayout.length; i++) {
            for (var j = 0; j < osk.keyboardLayout[i][upper ? "upper" : "lower"].length; j++) {
                if (typeof(osk.keyboardLayout[i][upper ? "upper" : "lower"][j]) == "string") {
                    var upperPassOn = upper;
                    var iPassOn = i;
                    var jPassOn = j;

                    $("<button></button>")
                        .text(osk.keyboardLayout[i][upper ? "upper" : "lower"][j])
                        .addClass("oskButton")
                        .click(function(event) {
                            osk.click($(event.target).text());
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
                            })
                            .appendTo("#osk")
                        ;
                    } else if (osk.keyboardLayout[i][upper ? "upper" : "lower"][j].special) {
                        $("<button></button>")
                            .text("?123")
                            .addClass("oskButton")
                            .attr("data-readable", _("Switch modes"))
                            .click(function() {
                                osk.switchModes();
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
    },

    init: function() {
        osk.setKeyboardLayout("en-GB", "QWERTY", "normal");

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

        setInterval(function() {
            if (document.activeElement.selectionStart != undefined) {
                osk.selectedInputStart = document.activeElement.selectionStart;
            }
        }, 10);
    }
};

$(function() {
    osk.init();
});