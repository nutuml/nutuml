import { Mindmap } from './mindmap/Mindmap';
import { Sequence } from './sequence/sequence';
const sequence = new Sequence();
sequence.keep = true;
const mindmap = new Mindmap();
let lastHtml = "";
function render(text) {
    let lang = detectLang(text);
    let result = undefined;
    switch (lang) {
        case Lang.SEQUENCE:
            return sequence.render(text);
        case Lang.MINDMAP:
            result = mindmap.render(text);
            break;
        default:
            return sequence.render(text);
    }
    if (!result) {
        return "render error.";
    }
    if (result === null || result === void 0 ? void 0 : result.error) {
        let html = "<div class='nutuml-error'>" + result.error + "</div>";
        if (sequence.keep) {
            return html + lastHtml;
        }
        else {
            return html;
        }
    }
    else {
        lastHtml = result.html;
        return result.html;
    }
}
function setKeep(keep) {
    sequence.keep = keep;
}
var Lang;
(function (Lang) {
    Lang[Lang["SEQUENCE"] = 0] = "SEQUENCE";
    Lang[Lang["MINDMAP"] = 1] = "MINDMAP";
})(Lang || (Lang = {}));
function detectLang(str) {
    let cur = 0;
    let word = "";
    while (cur < str.length && /\s/.test(str[cur])) { // skip space
        cur++;
        continue;
    }
    while (cur < str.length) {
        if (/\s/.test(str[cur])) {
            break;
        }
        word += str[cur++];
    }
    if (word.startsWith("#") || word.startsWith("@mindmap")) {
        return Lang.MINDMAP;
    }
    return Lang.SEQUENCE;
}
export default {
    render,
    setKeep
};
