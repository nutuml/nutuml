import MindContext from "./MindContext";
import analysis from "./MindLexical";
import parsing from "./MindParsing";
import calc from "./MindCalc";
import draw from "./MindDraw";
import RenderResult from "../common/RenderResult";

export class Mindmap{
    render(text:string):RenderResult{
        let context = new MindContext();
        context.svgHeight = 100;
        context.svgWidth = 100;
        analysis(text,context);
        parsing(context);
        if(context.error){
            return {
                error: context.error,
                html: ''
            };
        }
        calc(context);
        let html = draw(context);
        console.log(context);
        return {
            error: context.error,
            html
        };
    }
}