export default class PieItem { 
    value:number; 
    title:string;

    x:number;
    y:number;

    percent:number;

    constructor(value:number,title:string) { 
        this.value = value;
        this.title = title;
   }
}
