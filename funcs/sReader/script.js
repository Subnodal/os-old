var sReader;

$(function() {
    function getClosestWord(str, pos) {
        str = String(str);
        pos = Number(pos) >>> 0;

        var left = str.slice(0, pos + 1).search(/\S+$/);
        var right = str.slice(pos).search(/\s/);

        if (right < 0) {
            return str.slice(left);
        }
        return str.slice(left, right + pos);
    }

    sReader = {
        reading: false,
        blackout: false,

        speak: function(text, slow = false, spell = false, code = false) {
            window.speechSynthesis.cancel();

            setTimeout(function() {
                if (!code) {
                    text = text.replace(/(<i>.*?<\/i>)/g, "")
                }

                if (spell) {
                    var listing = text.trim().split(" ")[text.trim().split(" ").length - 1].split("");

                    for (var i = 0; i < listing.length; i++) {
                        if (listing[i] == listing[i].toLowerCase()) {
                            listing[i] = listing[i].toUpperCase();
                        } else {
                            listing[i] = "Capital " + listing[i].toUpperCase();
                        }
                    }

                    var message = new SpeechSynthesisUtterance(listing.join(" ")
                        .replace(/\s\s\s/g, " space ")
                        .replace(/!/g, " exclamation mark")
                        .replace(/\?/g, " question mark ")
                        .replace(/\./g, " dot ")
                        .replace(/"/g, " quote ")
                        .replace(/'/g, " single quote ")
                        .replace(/,/g, " comma ")
                        .replace(/\//g, " slash ")
                        .replace(/\\/g, " backslash ")
                        .replace(/\|/g, " pipe ")
                        .replace(/:/g, " colon ")
                        .replace(/;/g, " semicolon ")
                        .replace(/\(/g, " opening parenthesis ")
                        .replace(/\)/g, " closing parenthesis ")
                        .replace(/\[/g, " opening square bracket ")
                        .replace(/\]/g, " closing square bracket ")
                        .replace(/\{/g, " opening brace bracket ")
                        .replace(/\}/g, " closing brace bracket ")
                        .replace(/\</g, " less than ")
                        .replace(/\>/g, " greater than ")
                        .replace(/-/g, " dash ")
                    );
                } else {
                    var message = new SpeechSynthesisUtterance(text.replace(/subReader/g, " sub reader ").replace(/subOS/g, " sub OS "));
                }

                if (!slow) {message.rate = 3;}
                
                window.speechSynthesis.speak(message);
                $("#sReaderContent").text(text);
            }, 250);
        },

        cssState: function(state) {
            if (state) {
                $("#sReaderStyle").html(`
                    *:focus {
                        outline: 5px solid red;
                    }
                `);

                $("h1:not([data-no-sreader]), h2:not([data-no-sreader]), h3:not([data-no-sreader]), h4:not([data-no-sreader]), h5:not([data-no-sreader]), h6:not([data-no-sreader]), p:not([data-no-sreader]), .readableText, .readableButton, .menuItem").attr("tabindex", "0");
            } else {
                $("#sReaderStyle").html("");

                $("h1:not([data-no-sreader]), h2:not([data-no-sreader]), h3:not([data-no-sreader]), h4:not([data-no-sreader]), h5:not([data-no-sreader]), h6:not([data-no-sreader]), p:not([data-no-sreader]), .readableText, .readableButton, .menuItem").removeAttr("tabindex");
            }
        },

        init: function() {
            $("*").unbind();

            if (sReader.reading) {
                $("#sReader").css("display", "unset");
                sReader.cssState(true);
            } else {
                $("#sReader").css("display", "none");
                sReader.cssState(false);
            }

            $("#sReaderContent").text("");

            $("button:not([data-no-sreader])").focus(function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {sReader.speak(event.target.innerHTML + ": Button");}
                    }
                });
            });

            $("p:not([data-no-sreader])").focus(function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {sReader.speak("Paragraph: " + event.target.innerHTML);}
                    }
                });
            });

            for (var i = 1; i <= 6; i++) {
                var levels = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];
                var iPass = i;

                $("h" + i + ":not([data-no-sreader])").focus(function(event) {
                    $(window).one("keyup", function(e) {
                        var code = (e.keyCode ? e.keyCode : e.which);
                        if (code == 9) {
                            if (sReader.reading) {sReader.speak(levels[Number($(event.target).get(0).tagName[1]) - 1] + "-level heading: " + event.target.innerHTML);}
                        }
                    });
                });
            }

            $("p:not([data-no-sreader])").mouseover(function(event) {
                if (sReader.reading) {sReader.speak("Paragraph: " + event.target.innerHTML);}
            });

            for (var i = 1; i <= 6; i++) {
                var levels = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];
                var iPass = i;

                $("h" + i + ":not([data-no-sreader])").mouseover(function(event) {
                    if (sReader.reading) {sReader.speak(levels[Number($(event.target).get(0).tagName[1]) - 1] + "-level heading: " + event.target.innerHTML);}
                });
            }

            $(".readableButton").focus(function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {sReader.speak($(document.activeElement).attr("data-readable") + ": Button");}
                    }
                });
            });

            $(".readableButton").mouseover(function(event) {
                if (sReader.reading) {sReader.speak($(this).attr("data-readable") + ": Button");}
            });

            $(".readableText").focus(function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {sReader.speak($(document.activeElement).attr("data-readable"));}
                    }
                });
            });

            $(".readableText").mouseover(function(event) {
                if (sReader.reading) {sReader.speak($(this).attr("data-readable"));}
            });

            $(".menuItem").focus(function(event) {
                if (sReader.reading) {
                    if ($(document.activeElement).attr("data-readable") == undefined) {
                        sReader.speak($(document.activeElement).text() + ": Menu Item");
                    } else {
                        sReader.speak($(document.activeElement).attr("data-readable") + ": Menu Item");
                    }
                }
            });

            $(".menuItem").mouseover(function(event) {
                if (sReader.reading) {
                    if ($(this).attr("data-readable") == undefined) {
                        sReader.speak($(this).text() + ": Menu Item");
                    } else {
                        sReader.speak($(this).attr("data-readable") + ": Menu Item");
                    }
                }
            });

            $("button").mouseover(function(event) {
                if (sReader.reading) {
                    if ($(this).attr("data-readable") == undefined) {
                        sReader.speak(event.target.innerHTML + ": Button");
                    } else {
                        sReader.speak($(this).attr("data-readable") + ": Button");
                    }
                }
            });

            $("button, a").keypress(function(event) {
                if (sReader.reading) {
                    event.preventDefault();

                    if (event.which == 13) {
                        sReader.speak("Enter: object pressed");

                        setTimeout(function() {
                            $(document.activeElement).click();
                        }, 1000);
                    }
                }
            });

            $("input").focusin(function(event) {
                if ($(this).attr("data-readable") == undefined) {
                    if ($(this).attr("id") != undefined && $("label[for=" + $(this).attr("id") + "]").length > 0) {
                        if (sReader.reading) {sReader.speak("Editing " + $("label[for=" + $(this).attr("id") + "]:first").text() + ": Text Input");}
                    } else {
                        if ($(this).attr("placeholder") != undefined) {
                            if (sReader.reading) {sReader.speak("Editing " + $(this).attr("placeholder") + ": Text Input");}
                        } else {
                            if (sReader.reading) {sReader.speak("Editing: Text Input");}
                        }
                    }
                } else {
                    if (sReader.reading) {sReader.speak("Editing " + $(this).attr("data-readable") + ": Text Input");}
                }
            });

            $("input").focusout(function(event) {
                if ($(this).attr("data-readable") == undefined) {
                    if (sReader.reading) {sReader.speak("Editing stopped");}
                } else {
                    if (sReader.reading) {sReader.speak("Editing stopped");}
                }
            });

            $("input").mouseover(function(event) {
                if ($(this).attr("data-readable") == undefined) {
                    if ($(this).attr("id") != undefined && $("label[for=" + $(this).attr("id") + "]").length > 0) {
                        if (sReader.reading) {sReader.speak($("label[for=" + $(this).attr("id") + "]:first").text() + ": Text Input, press to edit");}
                    } else {
                        if ($(this).attr("placeholder") != undefined) {
                            if (sReader.reading) {sReader.speak($(this).attr("placeholder") + ": Text Input, press to edit");}
                        } else {
                            if (sReader.reading) {sReader.speak("Text Input, press to edit");}
                        }
                    }
                } else {
                    if (sReader.reading) {sReader.speak($(this).attr("data-readable") + ": Text Input, press to edit");}
                }
            });

            $("input").keypress(function(event) {
                if (sReader.reading) {
                    if (event.which == 8) {
                        sReader.speak("Backspace");
                    } else if (event.which == 9) {
                        sReader.speak("Tab");
                    } else if (event.which == 13) {
                        sReader.speak("Enter");
                    } else if (event.which == 32) {
                        sReader.speak("Space. " + $(document.activeElement).val().split(" ")[$(document.activeElement).val().split(" ").length - 1]);
                    } else {
                        var character = String.fromCharCode(event.which);

                        if (character == character.toLowerCase()) {
                            sReader.speak(character.toUpperCase());
                        } else {
                            sReader.speak("Capital " + character);
                        }
                    }
                }
            });

            $("input").keydown(function(event) {
                if (sReader.reading) {
                    if (event.which == 8) {
                        sReader.speak("Backspace. " + getClosestWord($(document.activeElement).val().substring(0, $(document.activeElement).val().length - 1), $(document.activeElement).val().length));
                    } else if (event.which == 46) {
                        sReader.speak("Delete");
                    }
                }
            });
        },

        reRead: function(slow = false, spell = false) {
            if (document.activeElement != document.body) {
                if ($(document.activeElement).text() == "") {
                    if ($(document.activeElement).val() == "") {
                        sReader.speak("Empty", slow, spell);
                    } else {
                        sReader.speak($(document.activeElement).val(), slow, spell);
                    }
                } else {
                    sReader.speak($(document.activeElement).text(), slow, spell);
                }
            }
        },

        editWord: function() {
            sReader.speak(getClosestWord($(document.activeElement).val(), $(document.activeElement).caret()));
        },

        changeState: function(state) {
            sReader.reading = state;

            if (state) {
                $("#sReader").css("display", "unset");
                sReader.cssState(true);
                sReader.speak("subReader is on");
            } else {
                $("#sReader").css("display", "none");
                sReader.cssState(false);
                sReader.changeBlackout(false, true);
                sReader.speak("subReader is off");

                $("#sReaderContent").text("");
            }
        },

        switchState: function() {
            if (sReader.reading) {
                sReader.changeState(false);
            } else {
                sReader.changeState(true);
            }
        },

        changeBlackout: function(state, silent = false) {
            sReader.blackout = state;

            if (state) {
                $("#sReaderBlackout").css("display", "unset");
                if (!silent) {sReader.speak("Blackout is on");}
            } else {
                $("#sReaderBlackout").css("display", "none");
                if (!silent) {sReader.speak("Blackout is off");}
            }
        },

        switchBlackout: function() {
            if (sReader.blackout) {
                sReader.changeBlackout(false);
            } else {
                sReader.changeBlackout(true);
            }
        }
    }

    sReader.init();

    document.body.onkeydown = function(e) {
        if (e.keyCode == 123) {
            e.preventDefault();
        }

        if (e.keyCode == 123 && e.ctrlKey) {
            sReader.switchState();
        } else if (e.keyCode == 123 && e.altKey) {
            if (sReader.reading) {
                sReader.switchBlackout();
            }
        } else if (e.keyCode == 83 && e.altKey) {
            if (sReader.reading) {
                sReader.reRead(true, true);
            }
        } else if (e.ctrlKey && e.altKey) {
            if (sReader.reading) {
                if (e.shiftKey) {
                    sReader.reRead(true);
                } else {
                    sReader.reRead();
                }
            }
        }
    };

    $("input").keydown(function(e) {
        if (e.keyCode == 37 || e.keyCode == 39) {
            if (sReader.reading) {
                sReader.editWord();
            }
        }
    });
});