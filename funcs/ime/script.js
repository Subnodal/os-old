var ime = {
    maps: {},
    shown: false,
    inUse: false,
    pinyinCharBuffer: [],
    candidates: [],
    punctuationSwaps: {".": "。", ",": "，", "!": "！", "?": "？", "(": "（", ")": "）", "{": "｛", "}": "｝", "[": "【", "]": "】", "<": "《", ">": "》", ":": "：", ";": "；", "\"": "“", "'": "‘", ",": "、"},

    show: function() {
        if (ime.inUse) {
            $("#ime").show();

            if (sReader.reading && !ime.shown) {sReader.speak("Pinyin editor shown");}

            ime.shown = true;
        }
    },

    hide: function() {
        $("#ime").hide();
        
        if (sReader.reading && ime.shown && ime.inUse) {sReader.speak("Pinyin editor hidden");}

        ime.shown = false;
    },

    registerChar: function(key, event) {
        if (key == 8) {
            ime.pinyinCharBuffer.pop();
        } else {
            var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            if (alphabet.indexOf(String.fromCharCode(key)) > -1 && String.fromCharCode(key).length == 1) {
                ime.pinyinCharBuffer.push(String.fromCharCode(key));
            }
        }
    },

    useCandidate: function(candidate) {
        var oldPosition = document.activeElement.selectionStart;
        
        var suffix = $(document.activeElement).val().substring(document.activeElement.selectionStart);

        $(document.activeElement).val($(document.activeElement).val().substring(0, document.activeElement.selectionStart - ime.pinyinCharBuffer.length + 1) + candidate + suffix);

        document.activeElement.selectionStart = oldPosition - ime.pinyinCharBuffer.length + 2;
        document.activeElement.selectionEnd = oldPosition - ime.pinyinCharBuffer.length + 2;

        ime.candidates = [];
        ime.pinyinCharBuffer = [ime.pinyinCharBuffer.pop()];
    },

    getCandidates: function(target) {
        if (ime.maps.pinyin[ime.pinyinCharBuffer.join("").toLowerCase()] == undefined && ime.pinyinCharBuffer.length > 2) {
            if (ime.candidates != undefined && ime.candidates[0] != undefined) {
                ime.useCandidate(ime.candidates[0]);
            }
        } else {
            ime.candidates = ime.maps.pinyin[ime.pinyinCharBuffer.join("").toLowerCase()];
        }
    },

    doEvent: function(event) {
        if (ime.inUse) {
            ime.registerChar(event.keyCode, event);
            ime.getCandidates($(event.target));

            if (ime.candidates == undefined) {
                ime.candidates = [];
            }

            if (ime.pinyinCharBuffer.length > 0 && ime.candidates.length > 0) {
                $("#ime").text(ime.candidates.join(" "));

                ime.show();

                if (sReader.reading) {}
            } else {
                ime.hide();
            }

            $("#ime").css({
                top: (
                    event.target.scrollTop ?
                    getCaretCoordinates(event.target, event.target.selectionEnd).top - (event.target.scrollTop * 2) :
                    getCaretCoordinates(event.target, event.target.selectionEnd).top
                ) + $(event.target).offset().top + Number($(event.target).css("font-size").substring(0, $(event.target).css("font-size").length - 2)),
                left: (
                    event.target.scrollLeft ?
                    getCaretCoordinates(event.target, event.target.selectionEnd).left - (event.target.scrollLeft * 2) :
                    getCaretCoordinates(event.target, event.target.selectionEnd).left
                ) + $(event.target).offset().left
            });
        }
    },

    init: function() {
        ime.hide();

        $(document).on("keydown", "input:not([type=password])", ime.doEvent);
        $(document).on("click", "input:not([type=password])", ime.doEvent);

        $(document).on("focus", "*:not(input)", ime.hide);
        $(document).on("click", "*:not(input)", ime.hide);

        setInterval(function() {
            if (ime.inUse && $(document.activeElement).is("input:not([type=password])")) {
                for (var i = 0; i < Object.keys(ime.punctuationSwaps).length; i++) {
                    if (new RegExp("\\" + Object.keys(ime.punctuationSwaps)[i], "g").test($(document.activeElement).val())) {
                        var oldPosition = document.activeElement.selectionStart;

                        $(document.activeElement).val($(document.activeElement).val().replace(new RegExp("\\" + Object.keys(ime.punctuationSwaps)[i], "g"), ime.punctuationSwaps[Object.keys(ime.punctuationSwaps)[i]]));

                        document.activeElement.selectionStart = oldPosition;
                        document.activeElement.selectionEnd = oldPosition;
                    }
                }
            }
        });
    }
};

$(function() {
    ime.init();
});