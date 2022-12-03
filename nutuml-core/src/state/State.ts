import StateContext from "./StateContext";
import analysis from "./StateLexical";
import parsing from "./StateParsing";
import calc from "./StateCalc";
import draw from "./StateDraw";
import RenderResult from "../common/RenderResult";


/**
 * 状态图
 * 1. 父节点在上面，子节点在下
 * 2. 力求达到 所有节点间 总距离最短。 优先考虑与子节点的距离最短
 * 3. 当状态成环时。允许子节点在上
 */
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
    END: '[*end]',
    HEAD_RADIUS : 15,
    RIGHT_DOWN: 'RIGHT_DOWN',
    LEFT_DOWN: 'LEFT_DOWN',

}