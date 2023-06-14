import PieContext from "./PieContext";
import PieItem from "./PieItem";

const colors = ["#0D0B47","#3127E4","#71f511","#e34334","#fef927","#de33c0"]

export default function draw(context:PieContext):string { 
    let html = `<svg xmlns="http://www.w3.org/2000/svg" width="${context.svgWidth}" height="${context.svgHeight}" version="1.1">`;
    let items = context.items;
    if(!items){
        return;
    }
    html += circle(context);
    let lastX = context.cx + context.r;
    let lastY = context.cy;
    for(var i=0;i<items.length;i++){
        let item = items[i];
        let off = i % colors.length
        if(off==0 && i=== (items.length -1)){
            off = 1;
        }
        html += drawArc(off,item,context,lastX,lastY);
        lastX = item.x;
        lastY = item.y;
    }
    
    html += "</svg>"
    return html;
}
function circle(context: PieContext) {
    //  <circle cx="100" cy="50" r="40" stroke="black" stroke-width="2" fill="red"/>

    let c = `<circle cx="${context.cx}" cy="${context.cy}" r="${context.r}" stroke="black" stroke-width="1" fill="red"/>`;


    return '';
}

function drawArc(off: number, item: PieItem, context: PieContext,lastX:number, lastY:number) {
    let color = colors[off];
    var largeArcFlag = 0;
    if(item.percent>0.5){
        largeArcFlag = 1;
    }
    let arc = `<path  d="M${context.cx} ${context.cy} L${lastX} ${lastY} A ${context.r},${context.r} 0 ${largeArcFlag} 0 ${item.x},${item.y}  Z" style="fill:${color}" />\n`;
    return arc;
}

