import PieItem from "./PieItem";
import PieToken from "./PieToken";

export default class PieContext {
    error:string;
    title:string;
    tokens:PieToken[];
    items:PieItem[];

    svgWidth:number;
    svgHeight:number;

    cx:number;
    cy:number;
    r:number;

    constructor() {
        this.tokens = [];
        this.items = [];
   }

}
