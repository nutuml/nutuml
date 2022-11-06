import MindContext from "./MindContext";
import analysis from "./MindLexical";
import parsing from "./MindParsing";
import calc from "./MindCalc";
import draw from "./MindDraw";
export class Mindmap {
    render(text) {
        let context = new MindContext();
        context.svgHeight = 100;
        context.svgWidth = 100;
        analysis(text, context);
        parsing(context);
        if (context.error) {
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
