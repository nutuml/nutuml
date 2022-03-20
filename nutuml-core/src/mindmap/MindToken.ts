export default class MindToken { 
    line:number; 
    value:string;
    type:TokenType;

    constructor(line:number,value:string,type:TokenType) { 
        this.line = line;
        this.value = value;
        this.type = type;
   }
    
}

export enum TokenType {
    LEVEL = 1,
    VALUE,
}