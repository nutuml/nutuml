import { TextConfig } from "../config/constant";
import StateNode from "./StateNode";

export default class StateEdge { 
    //标题
    title:string;
    from:StateNode;
    to:StateNode;
    
    // 中心点坐标
    fromX:number;
    fromY:number;
    toX:number;
    toY:number;

    direction: string;

    textConfig: TextConfig;
 
    constructor(title:string) { 
         this.title = title;
    }
    
}