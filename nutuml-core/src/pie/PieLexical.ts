import PieContext from "./PieContext";
import PieToken from "./PieToken";
import {TokenType} from "./PieToken";

const operators = [':'];

function isWordChar(c:string){
    if(c=='\n' || c==':'){
        return false;
    }
    return true;
}

export default function analysis(str:string,context:PieContext):PieToken[] { 
    const newLines = ['\n'];

    let cur = 0;
    /**
     * tokens存储词法分析的最终结果
     */
    let tokens:PieToken[] = [];
    var curLine =1;
    while(cur < str.length) {
        if(/\s/.test(str[cur])) { // skip space
            if(newLines.includes(str[cur])){
                tokens.push({
                    line:curLine,
                    type:TokenType.NEWLINE,
                    value:'\n',
                })
               curLine++;
            }
            cur++;
        } else if(isWordChar(str[cur])) { // 读单词
            let word = "" + str[cur++];
            // 测试下一位字符,如果不是字母直接进入下一次循环(此时cur已经右移)
            // 如果是则继续读字母,并将cur向右移动
            while(cur < str.length && isWordChar(str[cur])) {
                // cur < str.length防止越界
                word += str[cur++];
            }
            tokens.push({
                line:curLine,
                type:TokenType.WORD,
                value:word,
            })
        }else if(':'==str[cur]){
            tokens.push({
                line:curLine,
                type:TokenType.COLON,
                value:':',
            })

            let word = ""
            cur++;
            // 测试下一位字符,如果不是字母直接进入下一次循环(此时cur已经右移)
            // 如果是则继续读字母,并将cur向右移动
            while(cur < str.length && !newLines.includes(str[cur])) {
                // cur < str.length防止越界
                word += str[cur++];
            }
            tokens.push({
                line:curLine,
                type:TokenType.VALUE,
                value:word.trim(),
            })
        }else if(operators.indexOf(str[cur])!==-1) {
            let operator = "" + str[cur++];
            while(cur < str.length && operators.indexOf(str[cur])!==-1) {
                operator += str[cur++];
            }
            tokens.push({
                line: curLine,
                type: TokenType.OPERATOR,
                value: operator,
            }); // 存储运算符                        
        }
    }
    context.tokens = tokens;
   return tokens;
}
