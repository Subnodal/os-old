osk.keyboardLayouts = {
    "en-GB": {
        "QWERTY": {
            normal: [
                {
                    lower: "qwertyuiop".split("").concat([{backspace: true}]),
                    upper: "QWERTYUIOP".split("").concat([{backspace: true}])
                },

                {
                    lower: "asdfghjkl".split("").concat([{enter: true}]),
                    upper: "ASDFGHJKL".split("").concat([{enter: true}])
                },

                {
                    lower: [{shift: true}].concat("zxcvbnm".split("")).concat([{shift: true, right: true}]),
                    upper: [{shift: true}].concat("ZXCVBNM".split("")).concat([{shift: true, right: true}])
                },

                {
                    lower: [{special: true}, {space: true}, {exit: true}],
                    upper: [{special: true}, {space: true}, {exit: true}]
                }
            ]
        }
    }
};