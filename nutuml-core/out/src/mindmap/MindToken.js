export default class MindToken {
    constructor(line, value, type) {
        this.line = line;
        this.value = value;
        this.type = type;
    }
}
export var TokenType;
(function (TokenType) {
    TokenType[TokenType["LEVEL"] = 1] = "LEVEL";
    TokenType[TokenType["VALUE"] = 2] = "VALUE";
})(TokenType || (TokenType = {}));
