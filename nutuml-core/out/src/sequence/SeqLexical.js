const separators = [':'];
const newLines = ['\r', '\n'];
const reservedWords = ['hide', 'autonumber', 'as', 'participant', 'actor', 'boundary',
    'control', 'entity', 'database', 'collections', 'title', 'header', 'footer',
    'alt', 'else', 'opt', 'loop', 'par', 'break', 'critical', 'group', 'end', 'note',
    'left', 'right', 'of', 'over', 'ref', 'activate', 'deactivate', 'destroy', 'box', 'skinparam'];
const oneLineWords = ['title', 'header', 'footer', 'alt', 'else', 'opt', 'loop', 'par', 'break', 'critical', 'group'];
const multiLineWords = ['title', 'note', 'ref'];
const operators = ['-', '>', '<', '->', '-->', '<-', '<--'];
const TYPE_RESERVED = 1;
const TYPE_WORD = 2;
const TYPE_MESSAGE = 3;
const TYPE_OPERATOR = 4;
const TYPE_SEPARATORS = 5;
const TYPE_STRING = 6;
const TYPE_SEPARATE_LINE = 7;
const TYPE_COMMA = 8;
const TYPE_DELAY = 9;
const TYPE_SPACE = 10;
function isWordChar(c) {
    var result = /[a-z0-9]/i.test(c);
    if (result) {
        return result;
    }
    if (c == '#' || c == '[' || c == ']') {
        return true;
    }
    return c.charCodeAt(0) > 255;
}
export function analysis(str) {
    /**
     * current用于标识当前字符位置,
     * str[cur]即为当前字符
     */
    let cur = 0;
    /**
     * tokens存储词法分析的最终结果
     */
    let tokens = [];
    var multiLineFlag = false;
    var multiLine = false;
    var curLine = 1;
    while (cur < str.length) {
        if (newLines.indexOf(str[cur]) !== -1 && multiLineFlag == true) {
            multiLine = true;
            curLine++;
            multiLineFlag = false;
            cur++;
        }
        if (multiLine) {
            // handle multiline message until of 'end' at begin of line
            var message = "";
            var lineStart = true;
            var multiStart = curLine;
            while (cur < str.length) {
                if (lineStart) {
                    if (isWordChar(str[cur])) { // 读单词
                        let word = "" + str[cur++];
                        // 测试下一位字符,如果不是字母直接进入下一次循环(此时cur已经右移)
                        // 如果是则继续读字母,并将cur向右移动
                        while (cur < str.length && isWordChar(str[cur])) {
                            // cur < str.length防止越界
                            word += str[cur++];
                        }
                        if ("end" == word) {
                            multiLine = false;
                            tokens.push({
                                type: TYPE_MESSAGE,
                                value: message.trim(),
                                line: multiStart
                            });
                            tokens.push({
                                type: TYPE_RESERVED,
                                value: word,
                                line: curLine
                            });
                            break;
                        }
                        else {
                            message += word;
                            lineStart = false;
                        }
                    }
                    else {
                        message += str[cur++];
                    }
                }
                else {
                    if (newLines.indexOf(str[cur]) !== -1) {
                        lineStart = true;
                        curLine++;
                    }
                    message += str[cur++];
                }
            }
            multiLine = false;
        }
        if (/\s/.test(str[cur])) { // 跳过空格
            if (str[cur] == '\n') {
                curLine++;
            }
            cur++;
        }
        else if (isWordChar(str[cur])) { // 读单词
            let word = "" + str[cur++];
            // 测试下一位字符,如果不是字母直接进入下一次循环(此时cur已经右移)
            // 如果是则继续读字母,并将cur向右移动
            while (cur < str.length && isWordChar(str[cur])) {
                // cur < str.length防止越界
                word += str[cur++];
            }
            if (reservedWords.indexOf(word) !== -1) {
                tokens.push({
                    type: TYPE_RESERVED,
                    value: word,
                    line: curLine
                }); // 存储保留字(关键字)
                if (multiLineWords.indexOf(word) !== -1) {
                    if (tokens.length < 2 || tokens[tokens.length - 2].value != "end") {
                        multiLineFlag = true;
                    }
                }
                if (oneLineWords.indexOf(word) !== -1) {
                    while (cur < str.length && /\s/.test(str[cur]) && newLines.indexOf(str[cur]) == -1) {
                        cur++;
                    }
                    var tempWord = "";
                    while (cur < str.length && newLines.indexOf(str[cur]) == -1) {
                        tempWord += str[cur++];
                        multiLineFlag = false;
                    }
                    tokens.push({
                        type: TYPE_MESSAGE,
                        value: tempWord,
                        line: curLine
                    });
                }
            }
            else {
                tokens.push({
                    type: TYPE_WORD,
                    value: word,
                    line: curLine
                }); // 存储普通单词                            
            }
        }
        else if (separators.indexOf(str[cur]) !== -1) {
            multiLineFlag = false;
            tokens.push({
                type: TYPE_SEPARATORS,
                value: str[cur++],
                line: curLine
            }); // 存储分隔符并将cur向右移动
            let word = "";
            while (cur < str.length && " " == str[cur]) {
                cur++;
            }
            // 测试下一位字符,如果是换行进入下一次循环
            // 如果不是则继续读字符,并将cur向右移动
            while (cur < str.length && newLines.indexOf(str[cur]) == -1) {
                word += str[cur++];
            }
            word = word.replace(/\\n/g, "\n");
            tokens.push({
                type: TYPE_MESSAGE,
                value: word,
                line: curLine
            });
        }
        else if (',' == str[cur]) {
            tokens.push({
                type: TYPE_COMMA,
                value: str[cur++],
                line: curLine
            }); // 存储分隔符并将cur向右移动
        }
        else if ('.' == str[cur]) {
            var message = "";
            if (cur + 2 < str.length && '.' == str[cur + 1] && '.' == str[cur + 2]) {
                cur = cur + 3;
                while (cur < str.length) {
                    if ('.' == str[cur] && cur + 2 < str.length && '.' == str[cur + 1] && '.' == str[cur + 2]) {
                        cur = cur + 3;
                        break;
                    }
                    if ('\n' == str[cur]) {
                        break;
                    }
                    message += str[cur++];
                }
            }
            else {
                return "syntax error";
            }
            tokens.push({
                type: TYPE_DELAY,
                value: message,
                line: curLine
            }); // 存储分隔符并将cur向右移动
        }
        else if ('|' == str[cur]) {
            var message = "";
            if (cur + 2 < str.length && '|' == str[cur + 1] && '|' == str[cur + 2]) {
                //  match |||
                cur = cur + 3;
            }
            else if (cur + 1 < str.length && '|' == str[cur + 1]) {
                cur += 2;
                while (cur < str.length) {
                    if ('|' == str[cur] && cur + 1 < str.length && '|' == str[cur + 1]) {
                        cur = cur + 2;
                        break;
                    }
                    if ('\n' == str[cur]) {
                        break;
                    }
                    message += str[cur++];
                }
            }
            else {
                return "syntax error";
            }
            tokens.push({
                type: TYPE_SPACE,
                value: message,
                line: curLine
            }); // 存储分隔符并将cur向右移动
        }
        else if (operators.indexOf(str[cur]) !== -1) {
            let operator = "" + str[cur++];
            while (cur < str.length && operators.indexOf(str[cur]) !== -1) {
                operator += str[cur++];
            }
            tokens.push({
                type: TYPE_OPERATOR,
                value: operator,
                line: curLine
            }); // 存储运算符                        
        }
        else if ('"' == str[cur]) {
            let operator = "";
            cur++;
            while (cur < str.length) {
                var c = str[cur++];
                if ('"' == c)
                    break;
                operator += c;
            }
            operator = operator.replace("\\n", "\n");
            tokens.push({
                type: TYPE_STRING,
                value: operator,
                line: curLine
            });
        }
        else if ('=' == str[cur]) {
            cur++;
            if ('=' == str[cur]) {
                var message = "";
                cur++;
                while (cur < str.length) {
                    var c = str[cur++];
                    if ('=' == c && cur < str.length && str[cur] == '=') {
                        cur++;
                        break;
                    }
                    message += c;
                }
                tokens.push({
                    type: TYPE_SEPARATE_LINE,
                    value: message,
                    line: curLine
                });
            }
            else {
                return "syntax error";
            }
        }
        else {
            return "syntax error:" + str[cur];
        }
    }
    return tokens;
}
