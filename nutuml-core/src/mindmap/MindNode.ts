import { TextConfig } from "../config/constant";

export default class MindNode { 
    //级别，根节点为一级
    level:number; 
    //标题
    title:string;
    //子节点
    children:MindNode[];    
    parent:MindNode;

    // 宽度，高度
    width:number;
    height:number;

    textWidth:number;
    textHeight:number;

    childrenWidth:number;
    childrenHeight:number;
    
    // 中心点坐标
    centerX:number;
    centerY:number;

    textConfig: TextConfig;
 
    constructor(level:number,title:string) { 
         this.level = level;
         this.title = title;
    }
    addChild(node:MindNode){
        if(this.children===undefined){
            this.children = [];
        }
        this.children.push(node);
    }
}