import utils from "../utils";
import { ROOT_TEXT_CONFIG, FIRST_TEXT_CONFIG, SECOND_TEXT_CONFIG } from "../config/constant";
const ROOT_PADDING = 50;
const NODE_PADDING = 25;
const PAGE_PADDING = 5;
export default function calc(context) {
    let root = context.node;
    if (context.nodePadding === undefined) {
        context.nodePadding = NODE_PADDING;
    }
    if (context.rootPadding === undefined) {
        context.rootPadding = ROOT_PADDING;
    }
    calcSize(root);
    calcXY(root, context);
}
function calcSize(node) {
    let textConfig = SECOND_TEXT_CONFIG;
    if (node.level == 1) {
        textConfig = ROOT_TEXT_CONFIG;
    }
    else if (node.level == 2) {
        textConfig = FIRST_TEXT_CONFIG;
    }
    node.textConfig = textConfig;
    let textMeasure = utils.calculateTextDimensions(node.title, textConfig);
    node.textWidth = textMeasure.width;
    node.textHeight = textMeasure.height;
    node.width = textMeasure.width + textConfig.horizonSpace;
    node.height = textMeasure.height + textConfig.verticalSpace;
    node.childrenWidth = 0;
    node.childrenHeight = 0;
    if (node.children != undefined) {
        let i = 0;
        while (i < node.children.length) {
            let child = node.children[i++];
            calcSize(child);
            if (node.childrenWidth < child.width) {
                node.childrenWidth = child.width;
            }
            if (isNaN(child.childrenHeight)) {
                node.childrenHeight += child.height;
            }
            else {
                node.childrenHeight += Math.max(child.height, child.childrenHeight);
            }
        }
    }
}
function calcXY(node, context) {
    doCalcXY(node, context);
    fixY(node, context);
}
function doCalcXY(node, context) {
    if (node.parent === undefined) {
        node.centerX = node.width / 2 + PAGE_PADDING;
        node.centerY = Math.max(node.childrenHeight, node.height) / 2;
        let w = node.centerX + node.width / 2 + PAGE_PADDING;
        context.svgWidth = Math.max(context.svgWidth, w);
        let h = node.centerY + node.height / 2 + PAGE_PADDING;
        context.svgHeight = Math.max(context.svgHeight, h);
    }
    if (node.children !== undefined) {
        let i = 0;
        let childY = node.centerY - (node.childrenHeight / 2);
        while (i < node.children.length) {
            let child = node.children[i++];
            child.centerX = node.centerX + node.width / 2 + child.width / 2;
            if (node.level == 1) {
                child.centerX += context.rootPadding;
            }
            else {
                child.centerX += context.nodePadding;
            }
            let w = child.centerX + child.width / 2 + PAGE_PADDING;
            context.svgWidth = Math.max(context.svgWidth, w);
            let y = child.height;
            if (!isNaN(child.childrenHeight)) {
                y = Math.max(child.height, child.childrenHeight);
            }
            child.centerY = childY + y / 2;
            let h = child.centerY + child.height / 2 + PAGE_PADDING;
            context.svgHeight = Math.max(context.svgHeight, h);
            childY += y;
            doCalcXY(child, context);
        }
    }
}
function fixY(node, context) {
    if (node.children !== undefined) {
        let i = 0;
        while (i < node.children.length) {
            let child = node.children[i++];
            fixY(child, context);
        }
        node.centerY = (node.children[0].centerY + node.children[node.children.length - 1].centerY) / 2;
    }
}
