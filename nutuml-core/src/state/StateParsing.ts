import StateContext from "./StateContext";
import StateEdge from "./StateEdge";
import StateNode from "./StateNode";
import StateToken from "./StateToken";
import {TokenType} from "./StateToken";
import { STATE } from "./State";

export default function parsing(context:StateContext):void { 
    let tokens = context.tokens;
    context.nodes = [];
    context.edges = [];

    if(tokens === undefined || tokens==null){
        return;
    }
    let len = tokens.length;
    let cur =0;

    if(len>0){
        if(tokens[0].value.toLowerCase() == "@state"){
            cur =1;
        }
    }
    while(cur<len){
        if(tokens[cur].type === TokenType.NEWLINE){
            cur++;
            continue;
        }
        //match [*] --> State1 

        if(cur+2<len && tokens[cur].type === TokenType.WORD && tokens[cur+1].type == TokenType.OPERATOR 
            && tokens[cur+2].type === TokenType.WORD){
            let fromName = parseFrom(tokens[cur].value);
            var from =  addNode(context,fromName,undefined)
            let toName = parseTo(tokens[cur+2].value)
            var to = addNode(context, toName, undefined);
            addEdge(context,from,to);
            cur= cur+3;
            continue;
        }
        if(cur+2<len && tokens[cur].type === TokenType.WORD && tokens[cur+1].type == TokenType.COLON 
            && tokens[cur+2].type === TokenType.STRING){
            let fromName = parseFrom(tokens[cur].value);
            addNode(context,fromName,tokens[cur+2].value)
            cur= cur+3;
            continue;
        }


        cur++;
    }
}
function parseFrom(name:string){
    if(STATE.HEAD===name){
        return STATE.START
    }
    return name;
}

function parseTo(name:string){
    if(STATE.HEAD===name){
        return STATE.END
    }
    return name;
}

function addEdge(context:StateContext, from:StateNode, to:StateNode){
    var edge = new StateEdge('');
    edge.from = from;
    edge.to = to;
    edge.from.addNexNodes(to);
    context.edges.push(edge);
}
function addNode(context:StateContext, name:string, desc:string):StateNode{
    for(var i=0;i<context.nodes.length;i++){
        var node = context.nodes[i];
        if(node.name === name){
            if(desc!==undefined){
                if(node.description===undefined){
                    node.description = desc;
                }else{
                    node.description += '\n' + desc;
                }
            }
            return node;
        }
    }
    var node = new StateNode(name,name);
    node.description = desc;
    context.nodes.push(node);
    return node;
}
function error(token:StateToken):string {
   return "syntax error. line " + token.line + " near " + token.value
}