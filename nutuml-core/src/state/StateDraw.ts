import StateContext from "./StateContext";
import StateNode from "./StateNode";

const FRAME_PADDING = 10;

export default function draw(context:StateContext):string { 
    let html = `<svg xmlns="http://www.w3.org/2000/svg" width="${context.svgWidth}" height="${context.svgHeight}" version="1.1">`;
    let nodes = context.nodes;
    if(!nodes){
        return;
    }
    for(let i=0;i<nodes.length;i++){
        let node = nodes[i];
        html += drawOneNode(node);
    }
    
    html += "</svg>"
    return html;
}
function drawOneNode(node:StateNode){
    let rectX = node.centerX - node.width/2;
    let rectY = node.centerY - (node.height - FRAME_PADDING)/2;
    let rectWidth = node.width;
    let rectHeight = (node.height - FRAME_PADDING);
    let rect = "<rect ";
    rect += 'x="' + rectX + '" ';
    rect += 'y="' + rectY + '" ';
    rect += ' rx="5" ry="5" ';
    rect += 'width="' + rectWidth + '" ';
    rect += 'height="' + rectHeight + '" ';
    rect += 'style="fill:' + node.textConfig.backgroundColor  + ';fill-opacity:1" ';
    rect += "/>"
   

    //<text x="0" y="15" fill="red">I love SVG</text>
    let text = "<text "
    text += 'x="' + (node.centerX - node.textWidth/2) + '" ';
    text += 'y="' + (rectY + rectHeight/2 + node.textHeight/3 ) + '" ';
    let textConfig = node.textConfig;
    text += 'style="font-size:' + textConfig.fontSize + 
         ';font-weight:'+ textConfig.fontWeight + ';font-family:' + textConfig.fontFamily + '"'
    text += 'fill="' + node.textConfig.textColor + '">' 
    text += node.title
    text += '</text>\n';
    
    return rect + "\n" + text;
}
/**
 *  simple path from x,y to toX,toY ,something like { 
 * @param x 
 * @param y 
 * @param toX 
 * @param toY 
 * @returns 
 */
function getSimplePath(x:number,y:number,toX:number,toY:number):string{
    //M10 50 L22 50 L22 80 q 0 10 12 10 L 34 90
    let midX = (x + toX)/2;
    let r = 10;
    if(y==toY){
        // line only
        return `M${x} ${y} L${toX} ${toY}`
    }
    if(Math.abs(y-toY)<=r){
        return `M${x} ${y} L${midX} ${y} L${midX} ${toY} L${toX} ${toY}`
    }

    if(y>toY){
        let qr = 0- r;
        let qy = toY+r;
        return `M${x} ${y} L${midX} ${y} L${midX} ${qy} q 0 ${qr} ${r} ${qr} L${toX} ${toY}`;
    }else{
        let qy = toY -r;
        return `M${x} ${y} L${midX} ${y} L${midX} ${qy} q 0 ${r} ${r} ${r} L${toX} ${toY}`;
    }
}
