var sReader;

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

var speechDialects = {
    "de-DE": "german",
    "en-AU": "english",
    "en-GB": "english",
    "en-US": "english",
    "es-ES": "spanish",
    "fr-FR": "french",
    "hi-IN": "hindi",
    "zh-CN": "chinese"
};

$(function() {
    var doTabIndex = false;

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
                            listing[i] = _("Capital %", listing[i].toUpperCase());
                        }
                    }

                    var message = new SpeechSynthesisUtterance(listing.join(" ")
                        .replace(/\s\s\s/g, _(" space "))
                        .replace(/!/g, _(" exclamation mark "))
                        .replace(/\?/g, _(" question mark "))
                        .replace(/\./g, _(" dot "))
                        .replace(/"/g, _(" quote "))
                        .replace(/'/g, _(" single quote "))
                        .replace(/,/g, _(" comma "))
                        .replace(/\//g, _(" slash "))
                        .replace(/\\/g, _(" backslash "))
                        .replace(/\|/g, _(" pipe "))
                        .replace(/:/g, _(" colon "))
                        .replace(/;/g, _(" semicolon "))
                        .replace(/\(/g, _(" opening parenthesis "))
                        .replace(/\)/g, _(" closing parenthesis "))
                        .replace(/\[/g, _(" opening square bracket "))
                        .replace(/\]/g, _(" closing square bracket "))
                        .replace(/\{/g, _(" opening brace bracket "))
                        .replace(/\}/g, _(" closing brace bracket "))
                        .replace(/\</g, _(" less than "))
                        .replace(/\>/g, _(" greater than "))
                        .replace(/-/g, _(" dash "))
                    );
                } else {
                    var message = new SpeechSynthesisUtterance(text.replace(/subReader/g, " sub reader ").replace(/subOS/g, " sub OS "));
                }

                if (getURLParameter("bootable") == "true") {
                    message.lang = speechDialects[lang.lang];
                } else {
                    message.lang = lang.lang;
                }

                if (!slow) {message.rate = 3;}
                
                window.speechSynthesis.speak(message);
                $("#sReaderContent").text(text);
            }, 250);
        },

        init: function() {
            var message = new SpeechSynthesisUtterance("");

            // Used to fix bug on bootable machines
            message.lang = "french";

            window.speechSynthesis.speak(message);
        },

        cssState: function(state) {
            if (state) {
                $("#sReaderStyle").html(`
                    *:focus {
                        outline: 5px solid red;
                    }
                `);

                doTabIndex = true;
            } else {
                $("#sReaderStyle").html("");

                doTabIndex = false;
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

            $(document).on("focus", "button:not([data-no-sreader]):not(.menuItem), a.button", function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {
                            if ($(event.target).attr("data-readable") == undefined) {
                                sReader.speak($(event.target).text() + _(": Button"));
                            } else {
                                sReader.speak($(event.target).attr("data-readable") + _(": Button"));
                            }
                        }
                    }
                });
            });

            $(document).on("focus", "a:not(.button, .readableButton)", function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {
                            if ($(event.target).attr("data-readable") == undefined) {
                                sReader.speak($(event.target).text() + _(": Link"));
                            } else {
                                sReader.speak($(event.target).attr("data-readable") + _(": Link"));
                            }
                        }
                    }
                });
            });

            $(document).on("focus", "p:not([data-no-sreader])", function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {
                            if ($(event.target).attr("data-readable") == undefined) {
                                sReader.speak(_("Paragraph: ") + $(event.target).text());
                            } else {
                                sReader.speak(_("Paragraph: ") + $(event.target).attr("data-readable"));
                            }
                        }
                    }
                });
            });

            for (var i = 1; i <= 6; i++) {
                var levels = [_("First"), _("Second"), _("Third"), _("Fourth"), _("Fifth"), _("Sixth")];
                var iPass = i;

                $(document).on("focus", "h" + i + ":not([data-no-sreader])", function(event) {
                    $(window).one("keyup", function(e) {
                        var code = (e.keyCode ? e.keyCode : e.which);
                        if (code == 9) {
                            if (sReader.reading) {
                                if ($(event.target).attr("data-readable") == undefined) {
                                    sReader.speak(_("%-level heading: ", levels[Number($(event.target).get(0).tagName[1]) - 1]) + $(event.target).text());
                                } else {
                                    sReader.speak(_("%-level heading: ", levels[Number($(event.target).get(0).tagName[1]) - 1]) + $(event.target).attr("data-readable"));
                                }
                            }
                        }
                    });
                });
            }

            $(document).on("mouseover", "p:not([data-no-sreader])", function(event) {
                if (sReader.reading) {
                    if ($(event.target).attr("data-readable") == undefined) {
                        sReader.speak(_("Paragraph: ") + $(event.target).text());
                    } else {
                        sReader.speak(_("Paragraph: ") + $(event.target).attr("data-readable"));
                    }
                }
            });

            for (var i = 1; i <= 6; i++) {
                var levels = [_("First"), _("Second"), _("Third"), _("Fourth"), _("Fifth"), _("Sixth")];
                var iPass = i;

                $(document).on("mouseover", "h" + i + ":not([data-no-sreader])", function(event) {
                    if (sReader.reading) {_("%-level heading: ", sReader.speak(levels[Number($(event.target).get(0).tagName[1]) - 1]) + event.target.innerHTML);}
                });
            }

            $(document).on("focus", ".readableButton", function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {sReader.speak($(document.activeElement).attr("data-readable") + _(": Button"));}
                    }
                });
            });

            $(document).on("mouseover", ".readableButton", function(event) {
                if (sReader.reading) {sReader.speak($(this).attr("data-readable") + _(": Button"));}
            });

            $(document).on("focus", ".readableText", function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {sReader.speak($(document.activeElement).attr("data-readable"));}
                    }
                });
            });

            $(document).on("mouseover", ".readableText", function(event) {
                if (sReader.reading) {sReader.speak($(this).attr("data-readable"));}
            });

            $(document).on("focus", ".menuItem", function(event) {
                if (sReader.reading) {
                    if ($(document.activeElement).attr("data-readable") == undefined) {
                        sReader.speak($(document.activeElement).text() + _(": Menu Item"));
                    } else {
                        sReader.speak($(document.activeElement).attr("data-readable") + _(": Menu Item"));
                    }
                }
            });

            $(document).on("mouseover", ".menuItem", function(event) {
                if (sReader.reading) {
                    if ($(this).attr("data-readable") == undefined) {
                        sReader.speak($(this).text() + _(": Menu Item"));
                    } else {
                        sReader.speak($(this).attr("data-readable") + _(": Menu Item"));
                    }
                }
            });

            $(document).on("focus", ".menuArea", function(event) {
                if (sReader.reading) {
                    if ($(document.activeElement).attr("data-readable") == undefined) {
                        sReader.speak($(document.activeElement).text() + _(": Menu Information"));
                    } else {
                        sReader.speak($(document.activeElement).attr("data-readable") + _(": Menu Information"));
                    }
                }
            });

            $(document).on("mouseover", ".menuItem", function(event) {
                if (sReader.reading) {
                    if ($(this).attr("data-readable") == undefined) {
                        sReader.speak($(this).text() + _(": Menu Information"));
                    } else {
                        sReader.speak($(this).attr("data-readable") + _(": Menu Information"));
                    }
                }
            });

            $(document).on("mouseover", "button:not([data-no-sreader]):not(.menuItem), a.button", function(event) {
                if (sReader.reading) {
                    if ($(this).attr("data-readable") == undefined) {
                        sReader.speak(event.target.innerHTML + _(": Button"));
                    } else {
                        sReader.speak($(this).attr("data-readable") + _(": Button"));
                    }
                }
            });

            $(document).on("keypress", "button, a", function(event) {
                if (sReader.reading) {
                    event.preventDefault();

                    if (event.which == 13) {
                        sReader.speak(_("Enter: object pressed"));

                        setTimeout(function() {
                            $(document.activeElement).click();
                        }, 1000);
                    }
                }
            });
            
            $(document).on("click", "a", function(event) {
                if (sReader.reading) {sReader.speak(_("Enter: object pressed"));}
            });

            $(document).on("focusin", "input", function(event) {
                if ($(this).attr("data-readable") == undefined) {
                    if ($(this).attr("id") != undefined && $("label[for=" + $(this).attr("id") + "]").length > 0) {
                        if (sReader.reading) {sReader.speak(_("Editing %: Text Input", $("label[for=" + $(this).attr("id") + "]:first").text()));}
                    } else {
                        if ($(this).attr("placeholder") != undefined) {
                            if (sReader.reading) {sReader.speak(_("Editing %: Text Input", $(this).attr("placeholder")));}
                        } else {
                            if (sReader.reading) {sReader.speak("Editing: Text Input");}
                        }
                    }
                } else {
                    if (sReader.reading) {sReader.speak(_("Editing %: Text Input", $(this).attr("data-readable")));}
                }
            });

            $(document).on("focusout", "input", function(event) {
                if ($(this).attr("data-readable") == undefined) {
                    if (sReader.reading) {sReader.speak(_("Editing stopped"));}
                } else {
                    if (sReader.reading) {sReader.speak(_("Editing stopped"));}
                }
            });

            $(document).on("mouseover", "input", function(event) {
                if ($(this).attr("data-readable") == undefined) {
                    if ($(this).attr("id") != undefined && $("label[for=" + $(this).attr("id") + "]").length > 0) {
                        if (sReader.reading) {sReader.speak($("label[for=" + $(this).attr("id") + "]:first").text() + ": Text Input, press to edit");}
                    } else {
                        if ($(this).attr("placeholder") != undefined) {
                            if (sReader.reading) {sReader.speak($(this).attr("placeholder") + _(": Text Input, press to edit"));}
                        } else {
                            if (sReader.reading) {sReader.speak(_("Text Input, press to edit"));}
                        }
                    }
                } else {
                    if (sReader.reading) {sReader.speak($(this).attr("data-readable") + _(": Text Input, press to edit"));}
                }
            });

            $(document).on("keypress", "input", function(event) {
                if (sReader.reading) {
                    if (event.which == 8) {
                        sReader.speak(_("Backspace"));
                    } else if (event.which == 9) {
                        sReader.speak(_("Tab"));
                    } else if (event.which == 13) {
                        sReader.speak(_("Enter"));
                    } else if (event.which == 32) {
                        sReader.speak(_("Space. ") + getClosestWord($(document.activeElement).val(), document.activeElement.selectionStart - 1));
                    } else {
                        var character = String.fromCharCode(event.which);

                        if (character == character.toLowerCase()) {
                            sReader.speak(character.toUpperCase());
                        } else {
                            sReader.speak(_("Capital %", character));
                        }
                    }
                }
            });

            $(document).on("keydown", "input", function(event) {
                if (sReader.reading) {
                    if (event.which == 8) {
                        sReader.speak(_("Backspace. ") + getClosestWord($(document.activeElement).val(), document.activeElement.selectionStart - 1).slice(0, -2));
                    } else if (event.which == 46) {
                        sReader.speak(_("Delete"));
                    }
                }
            });
        },

        reRead: function(slow = false, spell = false) {
            if (document.activeElement != document.body) {
                if ($(document.activeElement).text() == "") {
                    if ($(document.activeElement).val() == "") {
                        sReader.speak(_("Empty"), slow, spell);
                    } else {
                        sReader.speak($(document.activeElement).val(), slow, spell);
                    }
                } else {
                    sReader.speak($(document.activeElement).text(), slow, spell);
                }
            }
        },

        editWord: function(offset) {
            if (document.activeElement.selectionStart + offset < 0) {
                sReader.speak(_("Start of input"));
            } else if (document.activeElement.selectionStart + offset + 2 > $(document.activeElement).val().length) {
                sReader.speak(getClosestWord($(document.activeElement).val(), document.activeElement.selectionStart + offset) + _(" (end of word and input)"));
            } else {
                if (getClosestWord($(document.activeElement).val(), document.activeElement.selectionStart + offset + 1) == "") {
                    sReader.speak(getClosestWord($(document.activeElement).val(), document.activeElement.selectionStart + offset) + _(" (end of word)"));
                } else {
                    sReader.speak(getClosestWord($(document.activeElement).val(), document.activeElement.selectionStart + offset));
                }
            }
        },

        changeState: function(state) {
            sReader.reading = state;

            if (state) {
                $("#sReader").css("display", "unset");
                sReader.cssState(true);
                sReader.init();
                sReader.speak(_("subReader is on"));
            } else {
                $("#sReader").css("display", "none");
                sReader.cssState(false);
                sReader.changeBlackout(false, true);
                sReader.speak(_("subReader is off"));

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
                if (!silent) {sReader.speak(_("Blackout is on"));}
            } else {
                $("#sReaderBlackout").css("display", "none");
                if (!silent) {sReader.speak(_("Blackout is off"));}
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

    $(document.body).keydown(function(e) {
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
        } else if (e.keyCode == 81 && e.altKey) {
            if (sReader.reading) {
                window.speechSynthesis.cancel();
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
    });

    $(document).on("keypress", "input", function(e) {
        if (e.keyCode == 37) {
            if (sReader.reading) {
                sReader.editWord(-2);
            }
        } else if (e.keyCode == 39) {
            if (sReader.reading) {
                sReader.editWord(0);
            }
        }
    });

    setInterval(function() {
        if (doTabIndex) {
        $("h1:not([data-no-sreader]), h2:not([data-no-sreader]), h3:not([data-no-sreader]), h4:not([data-no-sreader]), h5:not([data-no-sreader]), h6:not([data-no-sreader]), p:not([data-no-sreader]), .readableText, .readableButton, .menuItem, .menuArea").attr("tabindex", "0");
        } else {
            $("h1:not([data-no-sreader]), h2:not([data-no-sreader]), h3:not([data-no-sreader]), h4:not([data-no-sreader]), h5:not([data-no-sreader]), h6:not([data-no-sreader]), p:not([data-no-sreader]), .readableText, .readableButton, .menuItem, .menuArea").removeAttr("tabindex");
        }
    }, 10);
});