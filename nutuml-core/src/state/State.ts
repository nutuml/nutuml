import StateContext from "./StateContext";
import analysis from "./StateLexical";
import parsing from "./StateParsing";
import calc from "./StateCalc";
import draw from "./StateDraw";
import RenderResult from "../common/RenderResult";

export class State{
    render(text:string):RenderResult{
        let context = new StateContext();
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
        console.log('context',context)
        return {
            error: context.error,
            html
        };
    }
}

export const STATE = {
    HEAD:'[*]',
    START: '[*start]',
    END: '[*end]'
}