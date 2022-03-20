import {
    select,create
} from 'd3';

import { TextConfig } from './config/constant';

const lineBreakRegex = /<br\s*\/?>/gi;

const drawSimpleText = function (elem:any, textData:TextObj) {
  // Remove and ignore br:s
  const nText = textData.text.replace(lineBreakRegex, ' ');

  const textElem = elem.append('text');
  textElem.attr('x', textData.x);
  textElem.attr('y', textData.y);
  textElem.style('text-anchor', textData.anchor);
  textElem.style('font-family', textData.fontFamily);
  textElem.style('font-size', textData.fontSize);
  textElem.style('font-weight', textData.fontWeight);
  textElem.attr('fill', textData.fill);
  if (typeof textData.class !== 'undefined') {
    textElem.attr('class', textData.class);
  }

  const span = textElem.append('tspan');
  span.attr('x', textData.x + textData.textMargin * 2);
  span.attr('fill', textData.fill);
  span.text(nText);

  return textElem;
};
class TextObj{
    x: number;
    y: number;
    fill: string;
    anchor: string;
    style: string;
    width: number;
    height: number;
    textMargin: number;
    rx: number;
    ry: number;
    valign: string;
    text:string;
    fontFamily:string;
    fontSize:string;
    fontWeight:string;
    class:string;
}
const getTextObj = function () {
    let textObj = new TextObj();
    textObj.x =0;
    textObj.y = 0;
    textObj.anchor = 'start';
    textObj.style = '#666';
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
const memoize = (fn:Function, resolver:Function): Function => {
  let cache = new Map();
  return (...args: any[]) => {
    let n = resolver ? resolver.apply(this, args) : args[0];
    if (n in cache) {
      return cache.get(n);
    } else {
      let result = fn(...args);
      cache.set(n, result);
      return result;
    }
  };
};

const calculateTextDimensions = memoize(
  function (text:string, config:TextConfig) {
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

    const body = select("body");
    // We don't want to leak DOM elements - if a removal operation isn't available
    // for any reason, do not continue.
    if (!body.remove) {
      return { width: 0, height: 0, lineHeight: 0 };
    }

    const g = body.append('svg');
    g.attr("width","500");
    g.attr("height","500")

    for (let fontFamily of fontFamilies) {
      let cheight = 0;
      let dim = { width: 0, height: 0, lineHeight: 0 };
      for (let line of lines) {
        const textObj = getTextObj();
        textObj.text = line;
        const textElem = drawSimpleText(g, textObj)
          .style('font-size', fontSize)
          .style('font-weight', fontWeight)
          .style('font-family', fontFamily);

        let bBox = (textElem._groups || textElem)[0][0].getBBox();
        dim.width = Math.round(Math.max(dim.width, bBox.width));
        cheight = Math.round(bBox.height);
        dim.height += cheight;
        dim.lineHeight = Math.round(Math.max(dim.lineHeight, cheight));
      }
      dims.push(dim);
    }

    g.remove();

    let index =
      isNaN(dims[1].height) ||
      isNaN(dims[1].width) ||
      isNaN(dims[1].lineHeight) 
        ? 0
        : 1;
    return dims[index];
  },
  (text:string, config:TextConfig) => `${text}-${config.fontSize}-${config.fontWeight}-${config.fontFamily}`
);     

export default {
    calculateTextDimensions
}