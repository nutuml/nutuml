import MindContext from "./MindContext";
import MindToken from "./MindToken";
import {TokenType} from "./MindToken";

export default function analysis(str:string,context:MindContext):MindToken[] { 
    const newLines = ['\n'];
    const levelChars = ['#'];


    let cur = 0;
    /**
     * tokens存储词法分析的最终结果
     */
    let tokens = [];
    var curLine =1;
    while(cur < str.length) {       
        if(/\s/.test(str[cur])) { // skip space
            if(newLines.includes(str[cur])){
               curLine++;
            }
            cur++;
        } else if(levelChars.includes(str[cur])) {            
            let word = "" + str[cur++];           
            while(cur < str.length && levelChars.includes(str[cur])) {
                // cur < str.length防止越界
                word += str[cur++];
            }
            
            tokens.push(new MindToken(curLine, word, TokenType.LEVEL));
            let value = "";
            while(cur < str.length && !newLines.includes(str[cur])) {
                // cur < str.length防止越界
                value += str[cur++];
            }
            tokens.push(new MindToken(curLine, value.trim(), TokenType.VALUE));

        }
    }
    context.tokens = tokens;
   return tokens;
}