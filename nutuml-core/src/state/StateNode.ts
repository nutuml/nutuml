import { TextConfig } from "../config/constant";

export default class StateNode { 
    //名称（唯一标识）
    name:string;
    //标题
    title:string;

    description:string;
    //子节点
    parent?:StateNode;

    nextNodes?:StateNode[];

    // 宽度，高度
    width?:number;
    height?:number;

    textWidth?:number;
    textHeight?:number;

    // 中心点坐标
    centerX?:number;
    centerY?:number;
    // 边数
    edges: number;

    // 格子坐标
    gridX:number;
    gridY:number;

    textConfig?: TextConfig;
 
    constructor(name:string, title:string) { 
        this.name = name;
        this.title = title;
    }

    addNexNodes(node:StateNode):void{
        if(this.nextNodes===undefined){
            this.nextNodes = [];
            this.nextNodes.push(node);
        }
        for(let i=0;i<this.nextNodes.length;i++){
            let n = this.nextNodes[i];
            if(n.name === node.name){
                return;
            }
        }
        this.nextNodes.push(node);
    }
}