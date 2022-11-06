import { TextConfig } from "../config/constant";
import StateNode from "./StateNode";

export default class StateEdge { 
    //标题
    title:string;
    from:StateNode;
    to:StateNode;
    
    // 中心点坐标
    centerX:number;
    centerY:number;

    textConfig: TextConfig;
 
    constructor(title:string) { 
         this.title = title;
    }
    
}