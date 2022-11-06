import StateEdge from "./StateEdge";
import StateNode from "./StateNode";
import StateToken from "./StateToken";

export default class StateContext {
    error:string;
    tokens:StateToken[];
    nodes:StateNode[];
    edges:StateEdge[];

    startNode: StateNode;

    headNodes: StateNode[];
    tailNodes: StateNode[];

    svgWidth:number;
    svgHeight:number;

    constructor() { 
        this.tokens = [];
        this.nodes = [];
        this.edges = [];
        this.headNodes = [];
        this.tailNodes = [];
   }

    addHead(node:StateNode){
        if(this.headNodes===undefined){
            this.headNodes = [];
            this.headNodes.push(node);
        }
        for(var i in this.headNodes){
            let n = this.headNodes[i];
            if(n.name === node.name){
                return;
            }
        }
        this.headNodes.push(node);
    }

    addTail(node:StateNode){
        if(this.tailNodes===undefined){
            this.tailNodes = [];
            this.tailNodes.push(node);
        }
        for(var i in this.tailNodes){
            let n = this.tailNodes[i];
            if(n.name === node.name){
                return;
            }
        }
        this.tailNodes.push(node);
    }
}
