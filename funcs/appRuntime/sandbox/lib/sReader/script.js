var _sReaderLangInterface;

$(function() {
    sReader.reading = true;

    _sReaderLangInterface = function() {
        parent.postMessage({
            for: "subOSSReader",
            langInterface: [...arguments]
        }, "*");
    };

    sReader.speak = function() {
        parent.postMessage({
            for: "subOSSReader",
            speak: [...arguments]
        }, "*");
    };

    sReader.speak = function() {
        parent.postMessage({
            for: "subOSSReader",
            speak: [...arguments]
        }, "*");
    };

    sReader.speakOSKKey = function() {
        parent.postMessage({
            for: "subOSSReader",
            speakOSKKey: [...arguments]
        }, "*");
    };

    sReader.stop = function() {
        parent.postMessage({
            for: "subOSSReader",
            stop: [...arguments]
        }, "*");
    };

    sReader.playTone = function() {
        parent.postMessage({
            for: "subOSSReader",
            playTone: [...arguments]
        }, "*");
    };

    addEventListener("message", function(event) {
        if (event.data.for == "subOSSReader") {
            if (event.data.cssState != undefined) {
                sReader.cssState(event.data.cssState);
            }
        }
    });
});