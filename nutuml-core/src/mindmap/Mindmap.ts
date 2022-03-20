import MindContext from "./MindContext";
import analysis from "./MindLexical";
import parsing from "./MindParsing";
import calc from "./MindCalc";
import draw from "./MindDraw";

export function render(text:string):string{
    let context = new MindContext();
    context.svgHeight = 100;
    context.svgWidth = 100;
    analysis(text,context);
    parsing(context);
    calc(context);
    let html = draw(context);
    console.log(context);
    return html;
}
