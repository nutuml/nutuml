import MindContext from "./MindContext";
import MindNode from "./MindNode";

const FRAME_PADDING = 10;

export default function draw(context:MindContext):string { 

    let html = `<svg xmlns="http://www.w3.org/2000/svg" width="${context.svgWidth}" height="${context.svgHeight}" version="1.1">`;
    let node = context.node;
    drawOneNode(node);
        //<rect x="50" y="20" width="150" height="150" />
    html += "</svg>"
    return html;
    function drawOneNode(node:MindNode){
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
        if(node.children!=undefined){
            let i=0;
            while(i<node.children.length){
                let child = node.children[i];
                // <path d="M 100 350 q 0 -150 300 -200" stroke="blue"  stroke-width="1" fill="none" />
                let line = '<path '
                let fromX = node.centerX;
                let xLen = child.centerX - child.width/2  - node.centerX;

                if(node.level>1){
                    fromX = node.centerX + node.width/2;
                    xLen = xLen - node.width/2;
                }
                if(node.level==1){
                    
                    fromX = calcRootFromX(fromX,i,node.children.length,node.textWidth/2)
                    xLen -= (fromX-node.centerX)
                    line += 'd=" M ' + fromX + ' ' + node.centerY 
                        + ' q 0 ' + (child.centerY-node.centerY) + ' ' + xLen + ' ' + (child.centerY-node.centerY) + '"';
                    line += ' stroke-width="2"';
                }else{
                    line += 'd="' + getSimplePath(fromX,node.centerY, child.centerX-child.width/2,child.centerY) + '"';
                    line += ' stroke-width="1"';
                }
                line += ' stroke="#333" fill="none" />\n'
                html += line;
                drawOneNode(child);
                i++;
            }
        }
        html += rect + "\n";
        html += text;

    }
    function calcRootFromX(fromX:number,off:number,len:number,totalSpan:number){
        let mid = Math.ceil(len/2)
        let maxSpan =4;
        let offSpan =  Math.abs( off+1 - mid )
        
        if(offSpan>maxSpan){
            offSpan = maxSpan;
        }
        //console.log("mid=" + mid + ", off=" + off + ", offSpan=" + offSpan)
        return fromX + totalSpan * (maxSpan-offSpan)/maxSpan;
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
}
