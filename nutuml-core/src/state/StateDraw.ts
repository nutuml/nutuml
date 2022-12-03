import { STATE } from "./State";
import StateContext from "./StateContext";
import StateEdge from "./StateEdge";
import StateNode from "./StateNode";

const FRAME_PADDING = 10;

export default function draw(context:StateContext):string { 
    let html = `<svg xmlns="http://www.w3.org/2000/svg" width="${context.svgWidth}" height="${context.svgHeight}" version="1.1">`;
    let nodes = context.nodes;
    if(!nodes){
        return;
    }
    let edges = context.edges;
    for(let i=0;i<edges.length;i++){
        let edge = edges[i];
        html += drawEdge(edge);
    }
    for(let i=0;i<nodes.length;i++){
        let node = nodes[i];
        if(node.name === STATE.START){
            html += drawStart(node);
        }else if(node.name === STATE.END){
            html += drawEnd(node);
        }else{
            html += drawOneNode(node);
        }
    }
    html += "</svg>"
    return html;
}
function drawEdge(edge:StateEdge){
    let arrow = '';
    if(edge.from.centerY < edge.to.centerY && edge.from.centerX === edge.to.centerX){
        // 从上 往下
        let arrowX = edge.from.centerX;
        let arrowY = edge.to.centerY - edge.to.height/2;
        arrow = drawArrow(arrowX, arrowY,90);
    }else if(edge.from.centerY === edge.to.centerY && edge.from.centerX < edge.to.centerX){
        // 从左 往右
        let arrowX = edge.to.centerX - edge.to.width/2;
        let arrowY = edge.to.centerY;
        arrow = drawArrow(arrowX, arrowY,0);
    }else{
        if(edge.direction === STATE.RIGHT_DOWN){
            //右下
            arrow = drawArrow(edge.toX, edge.toY,90);
        }else if(edge.direction === STATE.LEFT_DOWN){
            // 左下
            arrow = drawArrow(edge.toX, edge.toY,180);
        }
    }
    let e = bse(edge.fromX,edge.fromY,edge.toX,edge.toY)
    return arrow + e
}
function drawStart(node:StateNode){
    let circle = '<circle cx="' + node.centerX + '" cy="' + node.centerY + '" r="'+ STATE.HEAD_RADIUS +'" stroke="black" stroke-width="2" fill="black"/>\n'
    return circle;
}

function drawEnd(node:StateNode){
    let circle = '<circle cx="' + node.centerX + '" cy="' + node.centerY + '" r="'+ STATE.HEAD_RADIUS +'" stroke="black" stroke-width="1" fill="white" />\n'
     circle += '<circle cx="' + node.centerX + '" cy="' + node.centerY + '" r="10" stroke="black" stroke-width="0" fill="black"/>\n'

    return circle;
}
/**
 * 画箭头
 * @param x 顶点x 
 * @param y 顶点y
 * @param rotate 角度
 * @returns 
 */
function drawArrow(x:number,y:number,rotate:number){
    var xDelta =-12;
    var xDelta2 =-7;
    var yDelta =-5;
    
    
    let arrow = `<path d="M${x} ${y} L${x + xDelta} ${y + yDelta} L${x + xDelta2} ${y}
         L${x + xDelta} ${y - yDelta}  Z" style="fill: black;" transform="rotate(${rotate},${x},${y})" />\n`;

    return arrow;

}
function drawOneNode(node:StateNode){
    let rectX = node.centerX - node.width/2;
    let rectY = node.centerY - (node.height)/2;
    let rectWidth = node.width;
    let rectHeight = node.height;
    let rect = "<rect ";
    rect += 'x="' + rectX + '" ';
    rect += 'y="' + rectY + '" ';
    rect += ' rx="5" ry="5" ';
    rect += 'width="' + rectWidth + '" ';
    rect += 'height="' + rectHeight + '" ';
    rect += 'style="fill:' + node.textConfig.backgroundColor  + ';fill-opacity:1;stroke-width:1;stroke:rgb(0,0,0)" ';
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

function bse(x,y,toX,toY){
    let xSpan = toX - x;
    let ySpan = toY - y;
    let q = '';
    if(xSpan>0 && ySpan>0){
        q =   xSpan + ' ' + '0'
    }else if(xSpan<0 && ySpan>0){
        q =  0 + ' ' + ySpan
    }else {
        q =   xSpan + ' ' + '0'
    }
    let line = '<path ';
    line += 'd=" M ' + x + ' ' + y 
                        + ' q ' + q + ' ' + (toX-x) + ' ' + (toY-y) + '"';
                    line += ' stroke-width="1"';
    line += ' stroke-width="1"';
    line += ' stroke="#333" fill="none" />\n'
    return line;
}