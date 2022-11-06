const lineBreakRegex = /<br\s*\/?>/gi;
const textId = "nut-tmp-text-666";
const drawSimpleText = function (svg, textData) {
    // Remove and ignore br:s
    const nText = textData.text.replace(lineBreakRegex, ' ');
    let text = "<text id='" + textId + "'";
    text += 'x="' + textData.x + '" ';
    text += 'y="' + textData.y + '" ';
    text += 'style="font-size:' + textData.config.fontSize +
        'px;font-weight:' + textData.config.fontWeight + ';font-family:' + textData.config.fontFamily + '"';
    text += 'fill="' + textData.config.textColor + '">';
    text += nText;
    text += '</text>\n';
    svg.innerHTML = text;
};
class TextObj {
}
const getTextObj = function () {
    let textObj = new TextObj();
    textObj.x = 0;
    textObj.y = 0;
    textObj.fill = '#666';
    textObj.width = 100;
    textObj.height = 100;
    textObj.textMargin = 0;
    textObj.rx = 0;
    textObj.ry = 0;
    return textObj;
};
/**
 * Caches results of functions based on input
 *
 * @param {Function} fn Function to run
 * @param {Function} resolver Function that resolves to an ID given arguments the `fn` takes
 * @returns {Function} An optimized caching function
 */
const memoize = (fn, resolver) => {
    let cache = new Map();
    return (...args) => {
        let n = resolver ? resolver.apply(this, args) : args[0];
        if (n in cache) {
            return cache.get(n);
        }
        else {
            let result = fn(...args);
            cache.set(n, result);
            return result;
        }
    };
};
const calculateTextDimensions = memoize(function (text, config) {
    config = Object.assign({ fontSize: 14, fontWeight: 400, fontFamily: 'Arial' }, config);
    const { fontSize, fontFamily, fontWeight } = config;
    if (!text) {
        return { width: 0, height: 0 };
    }
    // We can't really know if the user supplied font family will render on the user agent;
    // thus, we'll take the max width between the user supplied font family, and a default
    // of sans-serif.
    const fontFamilies = ['sans-serif', fontFamily];
    const lines = text.split(lineBreakRegex);
    let dims = [];
    const body = document.getElementsByTagName("body")[0];
    let svg = document.createElement("svg");
    body.appendChild(svg);
    for (let fontFamily of fontFamilies) {
        let cheight = 0;
        let dim = { width: 0, height: 0, lineHeight: 0 };
        for (let line of lines) {
            const textObj = getTextObj();
            textObj.text = line;
            textObj.config = config;
            drawSimpleText(svg, textObj);
            let textElem = document.getElementById(textId);
            let bBox = textElem.getBoundingClientRect();
            dim.width = Math.round(Math.max(dim.width, bBox.width));
            cheight = Math.round(bBox.height);
            dim.height += cheight;
            dim.lineHeight = Math.round(Math.max(dim.lineHeight, cheight));
        }
        dims.push(dim);
    }
    svg.remove();
    let index = isNaN(dims[1].height) ||
        isNaN(dims[1].width) ||
        isNaN(dims[1].lineHeight)
        ? 0
        : 1;
    return dims[index];
}, (text, config) => `${text}-${config.fontSize}-${config.fontWeight}-${config.fontFamily}`);
export default {
    calculateTextDimensions
};
