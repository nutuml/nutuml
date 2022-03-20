import MindNode from "./MindNode";
import MindToken from "./MindToken";

export default class MindContext {     
    error:string;
    tokens:MindToken[];
    node:MindNode;

    nodePadding:number;
    rootPadding:number;
    nodeStype:string;

    svgWidth:number;
    svgHeight:number;
}
