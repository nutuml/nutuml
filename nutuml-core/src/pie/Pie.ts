import RenderResult from "../common/RenderResult";
import PieContext from "./PieContext";
import analysis from "./PieLexical";
import parsing from "./PieParsing";
import calc from "./PieCalc";
import draw from "./PieDraw";
/**
 * 状态图
 * 1. 父节点在上面，子节点在下
 * 2. 力求达到 所有节点间 总距离最短。 优先考虑与子节点的距离最短
 * 3. 当状态成环时。允许子节点在上
 */
 export class Pie{
    render(text:string):RenderResult{
        let context = new PieContext();
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