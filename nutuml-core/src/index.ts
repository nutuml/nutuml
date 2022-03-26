import {Mindmap} from './mindmap/Mindmap'
import utils from './utils'
import { Sequence } from './sequence'

const sequence = new Sequence();
const mindmap = new Mindmap();

function render(text:string) {
    let lang = detectLang(text);
    switch(lang){
        case Lang.SEQUENCE:
            return sequence.render(text);
        case Lang.MINDMAP:
            return mindmap.render(text);
        default:
            return sequence.render(text);
    }
}
enum Lang{
    SEQUENCE,
    MINDMAP
}
function detectLang(str:string):Lang{
    let cur = 0;
    let word = "";
    while(cur<str.length && /\s/.test(str[cur])) { // skip space
        cur++;
        continue;
    }
    while(cur < str.length) {
        if(/\s/.test(str[cur])) {
            break;
        }
        word += str[cur++]
    }
    if(word.startsWith("#") || word.startsWith("@mindmap")){
        return Lang.MINDMAP;
    }
    return Lang.SEQUENCE;
}
export default{
    render
}