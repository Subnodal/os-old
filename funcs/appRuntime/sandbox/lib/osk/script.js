var osk = {
    selectedInput: null,
    isOpen: false,

    open: function(selectedInput = $("*:focus")) {
        osk.selectedInput = selectedInput;

        parent.postMessage({
            for: "subOSOSK",
            open: true
        }, "*");
    },

    close: function() {
        osk.selectedInput = null;

        parent.postMessage({
            for: "subOSOSK",
            close: true
        }, "*");
    },

    init: function() {
        $(document).on("click", "input", function(event) {
            osk.open();

            event.stopPropagation();
        });

        $(document).on("click", "*:not(input)", function(event) {
            osk.close();
        });

        setInterval(function() {
            if (document.activeElement.selectionStart != undefined && $(document.activeElement).is("input")) {
                parent.postMessage({
                    for: "subOSOSK",
                    selectionStart: document.activeElement.selectionStart,
                    selectionEnd: document.activeElement.selectionEnd
                }, "*");

                parent.postMessage({
                    for: "subOSOSK",
                    set: $(document.activeElement).val()
                }, "*");
            }
        }, 10);
    }
};

$(function() {
    osk.init();

    addEventListener("message", function(event) {
        if (event.data.for == "subOSOSK") {
            if (event.data.open) {
                osk.isOpen = true;
            } else if (event.data.close) {
                osk.isOpen = false;
            } else if (event.data.set != undefined) {
                osk.selectedInput
                    .val(event.data.set)
                    .focus()
                ;
            } else if (event.data.focus) {
                osk.selectedInput.focus();
            } else if (event.data.selectionStart != undefined && event.data.selectionEnd != undefined) {
                document.activeElement.selectionStart = event.data.selectionStart;
                document.activeElement.selectionEnd = event.data.selectionEnd;
            }
        }
    });
});