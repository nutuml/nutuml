export default class StateToken { 
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
    WORD = 1,
    COLON,
    STRING,
    OPERATOR,
    NEWLINE,
}