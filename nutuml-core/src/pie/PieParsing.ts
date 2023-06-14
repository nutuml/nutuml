import PieContext from "./PieContext";
import PieItem from "./PieItem";
import PieToken from "./PieToken";
import {TokenType} from "./PieToken";

export default function parsing(context:PieContext):void { 
    let tokens = context.tokens;

    if(tokens === undefined || tokens==null){
        return;
    }
    let len = tokens.length;
    let cur =0;

    if(len>0){
        if(tokens[0].value.toLowerCase() == "@pie"){
            cur =1;
        }
    }
    while(cur<len){
        if(tokens[cur].type === TokenType.NEWLINE){
            cur++;
            continue;
        }

        if(cur+2<len && tokens[cur].type === TokenType.WORD && tokens[cur+1].type == TokenType.COLON 
            && tokens[cur+2].type === TokenType.VALUE){
            let item = new PieItem(parseFloat(tokens[cur+2].value),tokens[cur].value);
            context.items.push(item);

            cur= cur+3;
            continue;
        }
        if(cur+1<len && tokens[cur].type === TokenType.WORD && tokens[cur+1].type == TokenType.NEWLINE){
            let line = tokens[cur].value;
            if(line.startsWith("title")){
                context.title = line.substring("title".length).trim();
            }
            cur= cur+2;
            continue;
        }

        cur++;
    }
}