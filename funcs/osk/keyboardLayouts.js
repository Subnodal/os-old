osk.keyboardLayouts = {
    "en-GB": {
        "QWERTY": {
            normal: [
                {
                    lower: "qwertyuiop".split("").concat([{backspace: true}]),
                    upper: "QWERTYUIOP".split("").concat([{backspace: true}]),
                },

                {
                    lower: "asdfghjkl".split("").concat([{enter: true}]),
                    upper: "ASDFGHJKL".split("").concat([{enter: true}]),
                },

                {
                    lower: [{shift: true}].concat("zxcvbnm".split("")).concat([{shift: true, right: true}]),
                    upper: [{shift: true}].concat("ZXCVBNM".split("")).concat([{shift: true, right: true}]),
                },

                {
                    lower: [{special: true}, {space: true}, {exit: true}],
                    upper: [{special: true}, {space: true}, {exit: true}],
                }
            ],

            special: [
                {
                    lower: "1234567890".split("").concat([{backspace: true}]),
                    upper: "¬¦•√π÷×©®™".split("").concat([{backspace: true}])
                },

                {
                    lower: "\"£%&*()-+".split("").concat([{enter: true}]),
                    upper: "|$€¢¥[]{}".split("").concat([{enter: true}])
                },

                {
                    lower: [{shift: true}].concat("/:;'=?!,.".split("")).concat([{shfit: true, right: true}]),
                    upper: [{shift: true}].concat("\\=@#<>~`^".split("")).concat([{shfit: true, right: true}])
                },

                {
                    lower: [{special: true}, {space: true}, {exit: true}],
                    upper: [{special: true}, {space: true}, {exit: true}],
                }
            ]
        }
    }
};