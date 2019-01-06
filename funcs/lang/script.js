var lang = {
    defaultLang: "en-GB",
    lang: "en-GB",
    list: {},
    translog: [],
    translogErrors: [],

    translate: function(string, replacements = []) {
        if (!lang.translog.includes(string)) {
            lang.translog.push(string);
        }

        if (typeof(replacements) == "string") {
            replacements = [replacements];
        } else if (typeof(replacements) == "number") {
            replacements = [String(replacements)];
        }

        if (lang.lang != lang.defaultLang) {
            if (lang.list[lang.lang][string]) {
                if (typeof(lang.list[lang.lang][string]) == "object") {
                    if (String(replacements[0]) == "1") {
                        string = lang.list[lang.lang][string]["sing"];
                    } else {
                        string = lang.list[lang.lang][string]["pl"];
                    }
                } else {
                    string = lang.list[lang.lang][string];
                }
            } else {
                if (!lang.translogErrors.includes(string)) {
                    lang.translogErrors.push(string);
                }
            }
        }
        
        var iter = 0;

        while (string.includes("%") && iter < 1000) {
            string = string.replace("%", replacements[iter])

            iter++;
        }

        return string;
    },

    translogToJSObj: function() {
        var stringBuilder = `lang.list[""] = {`;

        for (var i = 0; i < lang.translog.length; i++) {
            stringBuilder += `\n    "` + lang.translogErrors[i].replace(/"/g, "\\\"").replace(/\\/g, "\\\\") + `": "",`
        }

        stringBuilder = stringBuilder.substring(0, stringBuilder.length - 1);
        stringBuilder += "\n};";

        return stringBuilder;
    },

    translogErrorsToJSSnippet: function() {
        var stringBuilder = "";

        for (var i = 0; i < lang.translogErrors.length; i++) {
            stringBuilder += `\n    "` + lang.translogErrors[i].replace(/"/g, "\\\"").replace(/\\/g, "\\\\") + `": "",`
        }

        stringBuilder = stringBuilder.substring(0, stringBuilder.length - 1);

        return stringBuilder;
    }
};

function _(string, replacements = []) {
    return lang.translate(string, replacements);
}

$(function() {
    setInterval(function() {
        $("*:not(script, style, meta, link, .noTranslate)").each(function() {
            if ($(this).text()[0] == "@") {
                if ($(this).text().substring(1).split("|").length == 2) {
                    $(this).text(lang.translate(
                        $(this).text().substring(1).split("|")[0],
                        $(this).text().substring(1).split("|")[1].split("\\")
                    ));
                } else {
                    $(this).text(lang.translate(
                        $(this).text().substring(1).split("|")[0]
                    ));
                }
            }

            var thisParent = this;

            $.each(this.attributes, function(index, element) {
                if ($(thisParent).attr(element.name)[0] == "@") {
                    if ($(thisParent).attr(element.name).substring(1).split("|").length == 2) {
                        $(thisParent).attr(element.name, lang.translate(
                            $(thisParent).attr(element.name).substring(1).split("|")[0],
                            $(thisParent).attr(element.name).substring(1).split("|")[1].split("\\")
                        ));
                    } else {
                        $(thisParent).attr(element.name, lang.translate(
                            $(thisParent).attr(element.name).substring(1).split("|")[0]
                        ));
                    }
                }
            });
        });
    }, 10);
});

function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

if (getURLParameter("lang") != null) {
    lang.lang = getURLParameter("lang");
}