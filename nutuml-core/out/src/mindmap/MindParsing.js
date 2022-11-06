import MindNode from "./MindNode";
import { TokenType } from "./MindToken";
export default function parsing(context) {
    let tokens = context.tokens;
    if (tokens === undefined || tokens == null) {
        return null;
    }
    let len = tokens.length;
    let cur = 0;
    let root = null;
    let lastNode = null;
    while (cur < len) {
        let curItem = tokens[cur++];
        if (curItem.type != TokenType.LEVEL) {
            context.error = error(curItem);
            return;
        }
        if (cur >= len) {
            context.error = error(curItem);
            return;
        }
        let valItem = tokens[cur++];
        if (valItem.type != TokenType.VALUE) {
            context.error = error(curItem);
            return;
        }
        let node = new MindNode(curItem.value.length, valItem.value);
        if (node.level == 1) {
            if (root == null) {
                root = node;
            }
            else {
                context.error = "multiple root element is not supported.";
                return;
            }
        }
        else {
            if (node.level - 1 == lastNode.level) {
                // 上一节点是父节点
                lastNode.addChild(node);
                node.parent = lastNode;
            }
            else if (node.level == lastNode.level) {
                //兄弟节点
                lastNode.parent.addChild(node);
                node.parent = lastNode.parent;
            }
            else if (node.level < lastNode.level) {
                // 上一节点是其它的子节点
                if (node.level == 2) {
                    root.addChild(node);
                    node.parent = root;
                }
                else {
                    let tmp = lastNode.parent;
                    while (tmp.level > node.level) {
                        tmp = tmp.parent;
                    }
                    tmp.parent.addChild(node);
                    node.parent = tmp.parent;
                }
            }
            else {
                context.error = error(valItem);
                return;
            }
        }
        lastNode = node;
    }
    context.node = root;
}
function error(token) {
    return "syntax error. line " + token.line + " near " + token.value;
}
