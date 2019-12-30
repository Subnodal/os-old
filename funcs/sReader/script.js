var sReader = {};

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

sReader._lang = lang;

$(function() {
    var doTabIndex = false;
    var focusableControls = "* button, * a, * input";
    var lastExploredElement = document.body;
    var sReaderLang = {...sReader._lang};

    _ = function(string, replacements = []) {
        return sReaderLang.translate(string, replacements);
    }

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
        skipNextButton: false,

        speak: function(text, slow = false, spell = false, code = false) {
            if (getURLParameter("bootable") == "true") {
                // Use built-in speech instead
                bc.post("speakstop");
            } else {
                // Just use the speechSynthesis API
                window.speechSynthesis.cancel();
            }

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

                message.lang = lang.lang;

                if (!slow) {message.rate = 3;}
                
                if (getURLParameter("bootable") == "true") {
                    // Use built-in speech instead
                    bc.post("speak", [message.text, message.rate, message.lang]);
                } else {
                    // Just use the speechSynthesis API
                    window.speechSynthesis.speak(message);
                }
                
                $("#sReaderContent").text(text);
            }, 250);
        },

        speakOSKKey: function(key) {
            if (key == "") {
                sReader.speak(_("Space"));
            } else {
                sReader.speak(key
                    .toUpperCase()
                    .replace(/\s/g, _("Space"))
                    .replace(/!/g, _("Exclamation mark"))
                    .replace(/\?/g, _("Question mark"))
                    .replace(/\./g, _("Dot"))
                    .replace(/"/g, _("Quote"))
                    .replace(/'/g, _("Single quote"))
                    .replace(/,/g, _("Comma"))
                    .replace(/\//g, _("Slash"))
                    .replace(/\\/g, _("Backslash"))
                    .replace(/\|/g, _("Pipe"))
                    .replace(/:/g, _("Colon"))
                    .replace(/;/g, _("Semicolon"))
                    .replace(/\(/g, _("Opening parenthesis"))
                    .replace(/\)/g, _("Closing parenthesis"))
                    .replace(/\[/g, _("Opening square bracket"))
                    .replace(/\]/g, _("Closing square bracket"))
                    .replace(/\{/g, _("Opening brace bracket"))
                    .replace(/\}/g, _("Closing brace bracket"))
                    .replace(/\</g, _("Less than"))
                    .replace(/\>/g, _("Greater than"))
                    .replace(/-/g, _("Dash"))
                );
            }
        },

        stop: function() {
            if (getURLParameter("bootable") == "true") {
                // Use built-in speech instead
                bc.post("speakstop");
            } else {
                // Just use the speechSynthesis API
                window.speechSynthesis.cancel();
            }
        },

        playTone: function(name, pan = 0) {
            var panner = new Pizzicato.Effects.StereoPanner({
                pan: pan
            });

            var tone = new Pizzicato.Sound(sReader.tones[name], function() {
                tone.addEffect(panner);
                tone.play();
            });
        },

        playPanTone: function(name, element) {
            sReader.playTone(name, ((element.offset().left / $(window).width()) * 2) - 1);
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

            $("window").find("iframe").each(function() {
                $(this)[0].contentWindow.postMessage({
                    for: "subOSSReader",
                    cssState: state
                }, "*");
            });
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

            $(document).on("focusin", "button:not([data-no-sreader]):not(.menuItem), a.button", function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {
                            if (!$(event.target).hasClass("oskButton")) {
                                sReader.playPanTone("button", $(event.target));
                                
                                if ($(event.target).attr("data-readable") == undefined) {
                                    sReader.speak($(event.target).text() + _(": Button"));
                                } else {
                                    sReader.speak($(event.target).attr("data-readable") + _(": Button"));
                                }
                            } else {
                                if ($(event.target).attr("data-readable") == undefined) {
                                    sReader.speakOSKKey($(event.target).text());
                                } else {
                                    sReader.speak($(event.target).attr("data-readable"));
                                }
                            }
                        }
                    }
                });
            });

            $(document).on("focusin", "a:not(.button, .readableButton)", function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {
                            sReader.playPanTone("button", $(event.target));
                            
                            if ($(event.target).attr("data-readable") == undefined) {
                                sReader.speak($(event.target).text() + _(": Link"));
                            } else {
                                sReader.speak($(event.target).attr("data-readable") + _(": Link"));
                            }
                        }
                    }
                });
            });

            $(document).on("focusin", "p:not([data-no-sreader])", function(event) {
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

                $(document).on("focusin", "h" + i + ":not([data-no-sreader])", function(event) {
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
                    if (sReader.reading) {sReader.speak(_("%-level heading: ", levels[Number($(event.target).get(0).tagName[1]) - 1]) + event.target.innerHTML);}
                });
            }

            $(document).on("focusin", ".readableButton", function(event) {
                $(window).one("keyup", function(e) {
                    var code = (e.keyCode ? e.keyCode : e.which);
                    if (code == 9) {
                        if (sReader.reading) {
                            sReader.playPanTone("button", $(document.activeElement));

                            sReader.speak($(document.activeElement).attr("data-readable") + _(": Button"));
                        }
                    }
                });
            });

            $(document).on("mouseover", ".readableButton", function(event) {
                if (sReader.reading) {
                    sReader.playPanTone("button", $(this));

                    sReader.speak($(this).attr("data-readable") + _(": Button"));
                }
            });

            $(document).on("focusin", ".readableText", function(event) {
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

            $(document).on("focusin", ".menuItem", function(event) {
                if (sReader.reading) {
                    sReader.playPanTone("button", $(document.activeElement));

                    if ($(document.activeElement).attr("data-readable") == undefined) {
                        sReader.speak($(document.activeElement).text() + _(": Menu Item"));
                    } else {
                        sReader.speak($(document.activeElement).attr("data-readable") + _(": Menu Item"));
                    }
                }
            });

            $(document).on("mouseover", ".menuItem", function(event) {
                if (sReader.reading) {
                    sReader.playPanTone("button", $(this));

                    if ($(this).attr("data-readable") == undefined) {
                        sReader.speak($(this).text() + _(": Menu Item"));
                    } else {
                        sReader.speak($(this).attr("data-readable") + _(": Menu Item"));
                    }
                }
            });

            $(document).on("focusin", ".menuArea", function(event) {
                if (sReader.reading) {
                    if ($(document.activeElement).attr("data-readable") == undefined) {
                        sReader.speak($(document.activeElement).text() + _(": Menu Information"));
                    } else {
                        sReader.speak($(document.activeElement).attr("data-readable") + _(": Menu Information"));
                    }
                }
            });

            $(document).on("mouseover", ".menuArea", function(event) {
                if (sReader.reading) {
                    if ($(this).attr("data-readable") == undefined) {
                        sReader.speak($(this).text() + _(": Menu Information"));
                    } else {
                        sReader.speak($(this).attr("data-readable") + _(": Menu Information"));
                    }
                }
            });

            $(document).on("mouseover", "button:not([data-no-sreader]):not(.menuItem), a.button", function(event) {
                if ($(event.target).is("button") || $(event.target).is("a.button") || $(event.target).attr("data-readable") != undefined) {
                    if (sReader.reading) {                    
                        if (!$(event.target).hasClass("oskButton")) {
                            sReader.playPanTone("button", $(event.target));
                            
                            if ($(event.target).attr("data-readable") == undefined) {
                                sReader.speak($(event.target).text() + _(": Button"));
                            } else {
                                sReader.speak($(event.target).attr("data-readable") + _(": Button"));
                            }
                        } else {
                            if ($(event.target).attr("data-readable") == undefined) {
                                sReader.speakOSKKey($(event.target).text());
                            } else {
                                sReader.speak($(event.target).attr("data-readable"));
                            }
                        }
                    }
                }
            });

            $(document).on("touchmove", "*", function(event) {
                var currentExploredElement = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);

                if (currentExploredElement != lastExploredElement) {
                    sReader.stop();

                    $(document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY)).trigger("mouseover");

                    lastExploredElement = currentExploredElement;
                }
            });

            $(document).on("keypress", "button, a", function(event) {
                if (sReader.reading) {
                    event.preventDefault();

                    if (event.which == 13) {
                        sReader.playTone("enter");

                        sReader.speak(_("Enter: object pressed"));

                        setTimeout(function() {
                            sReader.skipNextButton = true;
                            
                            $(document.activeElement).click();

                            event.stopPropagation();
                        }, 1000);
                    }
                }
            });
            
            $(document).on("click", "button, a", function(event) {
                if (!sReader.skipNextButton) {
                    if (sReader.reading) {
                        sReader.playTone("enter");

                        sReader.speak(_("Enter: object pressed"));
                    }
                } else {
                    sReader.skipNextButton = false;
                }
            });

            $(document).on("focusin", "input", function(event) {
                if (!osk.wasUsed) {
                    if (sReader.reading) {sReader.playPanTone("input", $(event.target));}

                    if ($(this).attr("data-readable") == undefined) {
                        if ($(this).attr("id") != undefined && $("label[for=" + $(this).attr("id") + "]").length > 0) {
                            if (sReader.reading) {sReader.speak(_("Editing %: Text Input", $("label[for=" + $(this).attr("id") + "]:first").text()));}
                        } else {
                            if ($(this).attr("placeholder") != undefined) {
                                if (sReader.reading) {sReader.speak(_("Editing %: Text Input", $(this).attr("placeholder")));}
                            } else {
                                if (sReader.reading) {sReader.speak(_("Editing: Text Input"));}
                            }
                        }
                    } else {
                        if (sReader.reading) {sReader.speak(_("Editing %: Text Input", $(this).attr("data-readable")));}
                    }
                } else {
                    setTimeout(function() {
                        osk.wasUsed = false;
                    });
                }
            });

            $(document).on("focusout", "input", function(event) {
                setTimeout(function() {
                    if (!$(document.activeElement).hasClass("oskButton") && !$(document.activeElement).is("input")) {
                        if (sReader.reading) {sReader.speak(_("Editing stopped"));}
                    }
                });
            });

            $(document).on("mouseover", "input", function(event) {
                if (sReader.reading) {sReader.playPanTone("input", $(event.target));}

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
                        sReader.speak(_("Backspace. ") + getClosestWord($(document.activeElement).val(), document.activeElement.selectionStart - 1).slice(0, -1));
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
                        sReader.speak(_("Empty"));
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
                sReader.playTone("on");

                sReader.speak(_("subReader is on"));
            } else {
                $("#sReader").css("display", "none");
                sReader.cssState(false);
                sReader.changeBlackout(false, true);
                sReader.playTone("off");

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

    if (!window.location.href.split("?")[0].endsWith("/sandbox/index.html")) {
        sReader.init();
    }

    $(document.body).keydown(function(e) {
        if (e.keyCode == 123) {
            e.preventDefault();
        }

        if (e.keyCode == 123 && e.ctrlKey) {
            if (window.location.href.split("?")[0].endsWith("/sandbox/index.html")) {
                parent.postMessage({
                    for: "subOSSReader",
                    switchState: true
                }, "*");
            } else {
                sReader.switchState();
            }
        } else if (e.keyCode == 123 && e.altKey) {
            if (sReader.reading) {
                if (window.location.href.split("?")[0].endsWith("/sandbox/index.html")) {
                    parent.postMessage({
                        for: "subOSSReader",
                        switchBlackout: true
                    }, "*");
                } else {
                    sReader.switchBlackout();
                }
            }
        } else if (e.keyCode == 188 && e.altKey && !e.shiftKey) {
            if (sReader.reading) {
                var thisTabIndex = -1;

                for (var i = 0; i < $(":tabbable").length; i++) {
                    if ($(":tabbable")[i] == document.activeElement) {
                        thisTabIndex = i;
                    }
                }

                if (thisTabIndex - 1 >= 0) {
                    $($(":tabbable")[thisTabIndex - 1]).focus().trigger("focusin");
                } else {
                    $($(":tabbable")[$(":tabbable").length - 1]).focus().trigger("focusin");
                }

                $(document.activeElement).not("input").trigger("mouseover");
            }
        } else if (e.keyCode == 190 && e.altKey && !e.shiftKey) {
            if (sReader.reading) {
                var thisTabIndex = -1;

                for (var i = 0; i < $(":tabbable").length; i++) {
                    if ($(":tabbable")[i] == document.activeElement) {
                        thisTabIndex = i;
                    }
                }
                
                if (thisTabIndex + 1 < $(":tabbable").length) {
                    $($(":tabbable")[thisTabIndex + 1]).focus().trigger("focusin");
                } else {
                    $($(":tabbable")[0]).focus().trigger("focusin");
                }

                $(document.activeElement).not("input").trigger("mouseover");
            }
        } else if (e.keyCode == 188 && e.altKey && e.shiftKey) {
            if (sReader.reading) {
                var thisTabIndex = -1;

                for (var i = 0; i < $(focusableControls).length; i++) {
                    if ($(focusableControls)[i] == document.activeElement) {
                        thisTabIndex = i;
                    }
                }

                if (thisTabIndex - 1 >= 0) {
                    $($(focusableControls)[thisTabIndex - 1]).focus().trigger("focusin");
                } else {
                    $($(focusableControls)[$(focusableControls).length - 1]).focus().trigger("focusin");
                }

                $(document.activeElement).not("input").trigger("mouseover");
            }
        } else if (e.keyCode == 190 && e.altKey && e.shiftKey) {
            if (sReader.reading) {
                var thisTabIndex = -1;

                for (var i = 0; i < $(focusableControls).length; i++) {
                    if ($(focusableControls)[i] == document.activeElement) {
                        thisTabIndex = i;
                    }
                }
                
                if (thisTabIndex + 1 < $(focusableControls).length) {
                    $($(focusableControls)[thisTabIndex + 1]).focus().trigger("focusin");
                } else {
                    $($(focusableControls)[0]).focus().trigger("focusin");
                }

                $(document.activeElement).not("input").trigger("mouseover");
            }
        } else if (e.keyCode == 83 && e.altKey) {
            if (sReader.reading) {
                sReader.reRead(true, true);
            }
        } else if (e.keyCode == 81 && e.altKey) {
            if (sReader.reading) {
                if (getURLParameter("bootable") == "true") {
                    // Use built-in speech instead
                    bc.post("speakstop");
                } else {
                    // Just use the speechSynthesis API
                    window.speechSynthesis.cancel();
                }
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

    addEventListener("message", function(event) {
        if (event.data.for == "subOSSReader") {
            if (sReader.reading) {
                if (event.data.langInterface != undefined) {
                    lang.list = event.data.langInterface;

                    _ = function(string, replacements = []) {
                        return lang.translate(string, replacements);
                    };

                    sReader.init();
                } else if (event.data.speak != undefined) {
                    sReader.speak(...event.data.speak);
                } else if (event.data.speakOSKKey != undefined) {
                    sReader.speakOSKKey(...event.data.speakOSKKey);
                } else if (event.data.stop != undefined) {
                    sReader.stop(...event.data.stop);
                } else if (event.data.playTone != undefined) {
                    sReader.playTone(...event.data.playTone);
                } else if (event.data.switchState != undefined) {
                    sReader.switchState();
                } else if (event.data.switchBlackout != undefined) {
                    sReader.switchBlackout();
                }
            }
        }
    });
});