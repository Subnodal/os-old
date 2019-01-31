var ime = {
    maps: {},
    shown: false,
    inUse: false,
    pinyinCharBuffer: [],
    candidates: [],

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

    registerChar: function(key) {
        if (key == 8) {
            ime.pinyinCharBuffer.pop();
        } else {
            var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            if (alphabet.indexOf(String.fromCharCode(key)) > -1 && String.fromCharCode(key).length == 1) {
                ime.pinyinCharBuffer.push(String.fromCharCode(key));
            }
        }
    },

    getCandidates: function(target) {
        if (ime.maps.pinyin[ime.pinyinCharBuffer.join("").toLowerCase()] == undefined && ime.pinyinCharBuffer.length > 2) {
            if (ime.candidates != undefined && ime.candidates[0] != undefined) {
                target.val(target.val().substring(0, document.activeElement.selectionStart - ime.pinyinCharBuffer.length + 1) + ime.candidates[0] + target.val().substring(document.activeElement.selectionStart));

                ime.candidates = [];
                ime.pinyinCharBuffer = [ime.pinyinCharBuffer.pop()];
            }
        } else {
            ime.candidates = ime.maps.pinyin[ime.pinyinCharBuffer.join("").toLowerCase()];
        }
    },

    doEvent: function(event) {
        ime.registerChar(event.keyCode);
        ime.getCandidates($(event.target));

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
    },

    init: function() {
        ime.hide();

        $(document).on("keydown", "input:not([type=password])", ime.doEvent);
        $(document).on("click", "input:not([type=password])", ime.doEvent);

        $(document).on("focus", "*:not(input)", ime.hide);
        $(document).on("click", "*:not(input)", ime.hide);
    }
};

$(function() {
    ime.init();
});