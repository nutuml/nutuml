export default class RenderResult { 
    error:string; 
    html:string;

    constructor(error:string,html:string) { 
        this.error = error;
        this.html = html;
   }
}
