import {Mindmap} from './mindmap/Mindmap'
import utils from './utils'
import { Sequence } from './sequence/sequence'
import RenderResult from './common/RenderResult';
import { State } from './state/State';
import { Pie } from './pie/Pie';


const sequence = new Sequence();
sequence.keep = true;
const mindmap = new Mindmap();
const state = new State();
const pie = new Pie();

let lastHtml = "";

function render(text:string) {
    let lang = detectLang(text);
    let result:RenderResult = undefined;
    switch(lang){
        case Lang.SEQUENCE:
            return sequence.render(text);
        case Lang.MINDMAP:
            result = mindmap.render(text);
            break;
        case Lang.STATE:
            result = state.render(text);
            break;
        case Lang.PIE:
            result = pie.render(text);
            break;
        default:
            return sequence.render(text);
    }
    if(!result){
        return "render error.";
    }
    if(result?.error){
        let html =  "<div class='nutuml-error'>" + result.error + "</div>";
        if(sequence.keep){
            return html + lastHtml;
        }else{
            return html;
        }
    }else{
        lastHtml = result.html;
        return result.html;
    }
}
function setKeep(keep:boolean){
    sequence.keep = keep;
}
enum Lang{
    SEQUENCE,
    MINDMAP,
    STATE,
    PIE
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
    if(word.startsWith("@state")){
        return Lang.STATE;
    }else if(word.startsWith("@pie")){
        return Lang.PIE;
    }
    return Lang.SEQUENCE;
}
export default{
    render,
    setKeep
}