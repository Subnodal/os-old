var ime = {
    maps: {},
    shown: false,
    inUse: false,
    pinyinCharBuffer: [],
    candidates: [],
    punctuationKeys: {
        "190,false": "。",    // .
        "188,false": "，",    // ,
        "49,true": "！",      // !
        "191,true": "？",     // ?
        "57,true": "（",      // (
        "58,true": "）",      // )
        "219,true": "｛",     // {
        "221,true": "｝",     // }
        "219,false": "【",    // [
        "221,false": "】",    // ]
        "188,true": "《",     // <
        "190,true": "》",     // >
        "186,true": "：",     // :
        "186,false": "；",    // ;
        "50,true": "“",      // "
        "192,false": "‘"     // '
    },

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

    useCandidate: function(candidate, fromOSK = false) {
        if (candidate != undefined) {
            var oldPosition = document.activeElement.selectionStart;

            if (fromOSK) {document.activeElement.selectionStart--;}
            
            var suffix = $(document.activeElement).val().substring(document.activeElement.selectionStart);

            $(document.activeElement).val($(document.activeElement).val().substring(0, document.activeElement.selectionStart - ime.pinyinCharBuffer.length + 1) + candidate + suffix);

            document.activeElement.selectionStart = oldPosition - ime.pinyinCharBuffer.length + 2;
            document.activeElement.selectionEnd = oldPosition - ime.pinyinCharBuffer.length + 2;

            ime.candidates = [];
            ime.pinyinCharBuffer = [ime.pinyinCharBuffer.pop()];
        }
    },

    getCandidates: function(target, fromOSK = false) {
        if (ime.maps.pinyin[ime.pinyinCharBuffer.join("").toLowerCase()] == undefined && ime.pinyinCharBuffer.length > 2) {
            if (ime.candidates != undefined && ime.candidates[0] != undefined) {
                ime.useCandidate(ime.candidates[0], fromOSK);
            }
        } else {
            ime.candidates = ime.maps.pinyin[ime.pinyinCharBuffer.join("").toLowerCase()];
        }
    },

    doEvent: function(event) {
        if (ime.inUse) {
            ime.registerChar(event.keyCode, event);
            ime.getCandidates($(event.target), event.fromOSK == true);

            if (ime.candidates == undefined) {
                ime.candidates = [];
            }

            if (ime.pinyinCharBuffer.length > 0 && ime.candidates.length > 0) {
                $("#ime").text(ime.candidates.join(" "));

                ime.show();
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

    registerFinal: function(event) {
        if (ime.inUse) {
            if ((event.keyCode == 32 || [event.keyCode, event.shiftKey].toString() in ime.punctuationKeys) && ime.pinyinCharBuffer.length != 0) {
                var oldPosition = document.activeElement.selectionStart;
                var oldLength = $(event.target).val().length;
                
                $(event.target).val($(event.target).val().substring(0, document.activeElement.selectionStart - (event.fromOSK == true ? 0 : 1) - (document.activeElement.selectionStart >= $(event.target).val().length ? 0 : 1)) + $(event.target).val().substring(document.activeElement.selectionStart - (document.activeElement.selectionStart >= $(event.target).val().length ? 0 : 1)));

                if (oldPosition < oldLength) {
                    document.activeElement.selectionStart = oldPosition - 1;
                    document.activeElement.selectionEnd = oldPosition - 1;
                } else {
                    document.activeElement.selectionStart = oldPosition;
                    document.activeElement.selectionEnd = oldPosition;
                }

                ime.useCandidate(ime.candidates[0], event.fromOSK == true);
                ime.hide();

                ime.pinyinCharBuffer = [];

                event.preventDefault();

                if ([event.keyCode, event.shiftKey].toString() in ime.punctuationKeys) {
                    var oldPosition = document.activeElement.selectionStart;
                    var suffix = $(document.activeElement).val().substring(document.activeElement.selectionStart);

                    $(document.activeElement).val($(document.activeElement).val().substring(0, document.activeElement.selectionStart) + ime.punctuationKeys[[event.keyCode, event.shiftKey].toString()] + suffix);

                    document.activeElement.selectionStart = oldPosition + 1;
                    document.activeElement.selectionEnd = oldPosition + 1;
                }
            } else if ([event.keyCode, event.shiftKey].toString() in ime.punctuationKeys) {
                event.preventDefault();

                if ([event.keyCode, event.shiftKey].toString() in ime.punctuationKeys) {
                    var oldPosition = document.activeElement.selectionStart;
                    var suffix = $(document.activeElement).val().substring(document.activeElement.selectionStart);

                    $(document.activeElement).val($(document.activeElement).val().substring(0, document.activeElement.selectionStart) + ime.punctuationKeys[[event.keyCode, event.shiftKey].toString()] + suffix);

                    document.activeElement.selectionStart = oldPosition + 1;
                    document.activeElement.selectionEnd = oldPosition + 1;
                }
            }
        }
    },

    init: function() {
        ime.hide();

        $(document).on("keydown", "input:not([type=password])", ime.doEvent);
        $(document).on("click", "input:not([type=password])", ime.doEvent);

        $(document).on("keydown", "input:not([type=password])", ime.registerFinal);

        $(document).on("focus", "*:not(input)", ime.hide);
        $(document).on("click", "*:not(input)", ime.hide);
    }
};

$(function() {
    ime.init();
});