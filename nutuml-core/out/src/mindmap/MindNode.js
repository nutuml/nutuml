export default class MindNode {
    constructor(level, title) {
        this.level = level;
        this.title = title;
    }
    addChild(node) {
        if (this.children === undefined) {
            this.children = [];
        }
        this.children.push(node);
    }
}
