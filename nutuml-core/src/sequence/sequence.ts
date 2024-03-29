import { analysis } from "./SeqLexical";

class Participant{
    name:string;
    title:string;
    type:string;
    x?:number;
    width?:number;
    y?:number;
    isBottom?:boolean;
    lineX?:number;
}
interface ActiveItem{
    type:string;
    participant:string,
    color:string,
}
interface Box{
    x?:number;
    start:string;
    title:string,
    color:string,
    end?:string,
    y?:number;
    width?:number;
    height?:number;
}
interface NoteItem{
    direction: string;
    message: string;
    color?: string;
    participant?: string;
    participantTo?:string;
}
interface Line{
    from:string,
    to: string,
    message: string,
    operator: string,
    number:number,
    type: number,
    typeName: string,
    active:ActiveItem[],
    noteItem?:NoteItem;
    x?:number;
    y?:number;
    toX?:number;
}
interface SequenceObj{
    participant : Participant[],
    box : Box[],
    lines : Line[],
    activeLines : Line[],
    innerHeight:number,
    width:number,
    height:number,
    title: string, 
    header: string,
    footer: string,
    headerHeight: number,
    boxHeight: number,
    titleHeight: number,
    footerHeight: number,
    autonumber:boolean,
    maxMessageSize:number,
    hideFootbox:boolean,
    error?:any;
    tranlateX?:number;
}
const fontSize = 14;
const font = fontSize + "px Arial";
const linePadding =5;
const paddingWidth = 10;
const paddingHeight = 5;
const pagePadding = 10;
const participantPadding = 10;

const lineHeight = fontSize + linePadding;
const shadowColor = "#9A6A7A";
const boxColor = "#EEEEEE";
const fillStyle = "#FEFECE";
const fillStyleWhite = "#ffffff";
const textFillStyle = "#333";
const strokeStyle = "#A80036";
const NOTE_FILL_STYLE="#F6FF70"
const NOTE_STROKE_STYLE="#BA0028"

const toSelfHeight = 13;
const FILL_RED = "#ff0000";
const GROUP_TEXT_SIZE = 12;
const GROUP_PADDING = 8;

const GROUP_TEXT_FONE = 'bold '+ GROUP_TEXT_SIZE+ 'px Courier'

const TITLE_SIZE = 28;
const TITLE_FONT = TITLE_SIZE + "px Arial";

const TYPE_RESERVED = 1;
const TYPE_WORD = 2;
const TYPE_MESSAGE = 3;
const TYPE_OPERATOR = 4;
const TYPE_SEPARATORS = 5;
const TYPE_STRING = 6;
const TYPE_SEPARATE_LINE = 7;
const TYPE_COMMA = 8;
const TYPE_DELAY = 9;
const TYPE_SPACE =10;

const ALT_HEIGHT = 10;
const END_HEIGHT = 10;

const TAB_LEFT_PADDING = 13;
const TAB_RIGHT_PADDING = 15;
const TAB_MIN_TEXT_WIDTH = 40;
const TAB_HEIGHT = 14;

const REF_MIN_WIDTH = 100;
const REF_HEIGHT = 36;

const LINE_SEQUENCE = 1;
const LINE_SEPRATE = 2;
const LINE_ALT = 3;
const LINE_ELSE =4;
const LINE_GROUP = 5;
const LINE_END = 6;
const LINE_ONLY_NOTE =7;
const LINE_REF =8;
const LINE_DELAY =9;
const LINE_SPACE =10;
const REF_PADDING = 20;

const GROUP_LINE_LEFT_PADDING = 30;
const GROUP_GROUP_LEFT_PADDING = 10;
const GROUP_LINE_RIGHT_PADDING = 20;
const GROUP_GROUP_RIGHT_PADDING = 20;
const NOTE_PADDING_TOP = 15;
const NOTE_PADDING_LEFT = 10;
const NOTE_PADDING_BOTTOM = 5;
const NOTE_PADDING_RIGHT = 15;
const NOTE_MARGIN = 10;

const ACTIVE_WIDTH = 10;

//, 'collections'
const iParticipant = ['actor', 'boundary', 'control', 'entity', 'database'];

const participantWords = ['participant', 'actor', 'boundary', 'control', 'entity', 'database', 'collections'];

const activeWords = ['activate','deactivate','destroy'];
const groupWords = ['opt','loop','par','break','critical','group']
const fromOperators = ['->', '-->'];
const dashOperators = ['<--', '-->'];


export class Sequence{
    iPar = new Map();
    context:CanvasRenderingContext2D;
    img:HTMLImageElement;
    message:HTMLDivElement;
    el:HTMLDivElement;
    canvas:HTMLCanvasElement;
    tokens:Array<any>;
    debug:boolean;
    keep:boolean;
    constructor() { 
        this.iPar.set("actor",{ width: 34, height: 54 });
        this.iPar.set("boundary",{ width: 42, height: 26 });
        this.iPar.set("control",{ width: 26, height: 32 });
        this.iPar.set("entity",{ width: 24, height: 26 });
        this.iPar.set("database",{ width: 38, height: 50 });
        
        var canvas = document.createElement("canvas");
        this.context = canvas.getContext("2d");
        this.el = document.createElement("div");
        var img = document.createElement("img");
        var message = document.createElement("div");
        message.style.setProperty("background-color","#fcf8e3");
        this.el.appendChild(message)
        this.el.appendChild(img);
        this.img = img;
        this.message = message;
        this.canvas = canvas;
        this.tokens = [];
        this.debug = false;
        this.keep = false;
    }

    _measureText(ctx:any,title:string,fontHeight:number){
        fontHeight = fontHeight || fontSize;
        var obj = { width: 0, height: 0};
        var arr = title.split("\n");
        arr.forEach(function(item){
            obj.width = Math.max(obj.width,ctx.measureText(item).width)
        })
        obj.height = arr.length * (fontHeight+paddingHeight) + paddingHeight;
        return obj;
    }
    _groupRectangle(ctx:any,item:any){
        var frameY = item.cornerY + GROUP_PADDING;
        var frameHeight = item.height - GROUP_PADDING;

        // fill for ref
        if(item.type == LINE_REF){
            ctx.save()
            ctx.beginPath()
            ctx.fillStyle = "#fff"
            ctx.fillRect(item.x, frameY, item.width, frameHeight);
            ctx.fill()
            ctx.restore()
        }
        // draw left, top
        ctx.save()
        ctx.beginPath()
        ctx.lineWidth=2;

        ctx.moveTo(item.toX, frameY);
        ctx.lineTo(item.x, frameY);
        ctx.lineTo(item.x, item.toY);
        ctx.stroke();
        ctx.restore()

        // draw right, bottom
        ctx.save()
        ctx.beginPath()
        ctx.lineWidth=2;
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=2;
        ctx.shadowOffsetY=2;
        ctx.shadowColor= shadowColor;

        ctx.moveTo(item.toX, frameY);
        ctx.lineTo(item.toX, item.toY);
        ctx.lineTo(item.x, item.toY);
        ctx.stroke();
        ctx.restore()
        ctx.beginPath()
        
        var typeName = item.typeName;
        if(typeName=="group" && item.message!=""){
            typeName = item.message;
            item.message = "";
        }
        // DRAW TAB
        ctx.font= GROUP_TEXT_FONE
        var tabMeasure = this._measureText(ctx,typeName,GROUP_TEXT_SIZE);
        var tabWidth = Math.max(tabMeasure.width,TAB_MIN_TEXT_WIDTH);
        tabWidth = tabWidth + TAB_LEFT_PADDING + TAB_RIGHT_PADDING;
        var tabHeight = tabMeasure.height;
        var fillX = item.x +1;
        var fillY = frameY+1;
        //fill 
        ctx.save()
        ctx.beginPath()
        ctx.fillStyle = "#fff"
        ctx.moveTo(fillX, fillY)
        ctx.lineTo(fillX+tabWidth,fillY)
        ctx.lineTo(fillX+tabWidth,fillY+tabHeight/2)
        ctx.lineTo(fillX+tabWidth-tabHeight/2,fillY+tabHeight)
        ctx.lineTo(fillX,fillY+tabHeight)
        ctx.closePath()
        ctx.fill();
        ctx.restore()
        //line
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(item.x, frameY)
        ctx.lineTo(item.x+tabWidth,frameY)
        ctx.lineTo(item.x+tabWidth,frameY+tabHeight/2)
        ctx.lineTo(item.x+tabWidth-tabHeight/2,frameY+tabHeight)
        ctx.lineTo(item.x,frameY+tabHeight)
        ctx.stroke();
        ctx.beginPath();
        ctx.restore()
        if((item.type ==LINE_ALT || item.type==LINE_GROUP) &&  item.message!=""){
            var msg =  "[" + item.message  + "]"
            this._drawGroupText(ctx,item.x +tabWidth +paddingWidth,frameY-2,msg,true)
        }
        if(item.type == LINE_REF){
            ctx.font= font;
            var txtObj = this._measureText(ctx,item.message,fontSize);
            var txtX = item.x + (item.width-txtObj.width)/2;
            console.log("item.x=",item.x,",txtX=",txtX,"item.width=",item.width,"txtwidth=",txtObj.width)
            var txtY = fillY + tabHeight + linePadding
            this._drawText(ctx,txtX,txtY,item.message,false);
        }
        this._drawGroupText(ctx,item.x +paddingWidth,frameY-2,typeName,true)

    }
    _drawCollections(ctx:any,item:any){
        var height = item.height - 4;
        var width = item.width -4;
        ctx.save()
        ctx.beginPath()
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=4;
        ctx.shadowOffsetY=4;
        ctx.shadowColor= shadowColor;

        ctx.fillStyle= fillStyle;

        ctx.fillRect(item.x+4, item.y, width,  height);
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowBlur=1;

        ctx.fillRect(item.x+4, item.y, width, height);

        ctx.strokeStyle= strokeStyle;
        ctx.strokeRect(item.x+4, item.y, width, height);
        ctx.stroke();
        ctx.fill();

        ctx.beginPath()
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=4;
        ctx.shadowOffsetY=4;
        ctx.fillRect(item.x, item.y+4, width,  height);
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowBlur=1;

        ctx.fillRect(item.x, item.y+4, width, height);

        ctx.strokeStyle= strokeStyle;
        ctx.strokeRect(item.x, item.y+4, width, height);
        ctx.stroke();
        ctx.fill();
        ctx.restore();

        this._drawText(ctx,item.x+paddingWidth,item.y+4,item.title,true)
        
    }
    _activeRectangle(ctx:any,item:any){
        ctx.save()
        ctx.beginPath()
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=4;
        ctx.shadowOffsetY=4;
        ctx.shadowColor= shadowColor;

        var x = item.x-ACTIVE_WIDTH/2;
        var y =  item.topY;
        var w = ACTIVE_WIDTH;
        var h = item.bottomY - item.topY;

        ctx.fillStyle= "#ffffff";
        ctx.fillRect(x,y,w,h);
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowBlur=1;

        ctx.fillRect(x,y,w,h);

        ctx.strokeStyle= strokeStyle;
        ctx.strokeRect(x,y,w,h);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
    _rectangle(ctx:any,item:any){
        ctx.save()
        ctx.beginPath()
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=4;
        ctx.shadowOffsetY=4;
        ctx.shadowColor= shadowColor;

        ctx.fillStyle= fillStyle;
        ctx.fillRect(item.x, item.y, item.width, item.height);
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowBlur=1;

        ctx.fillRect(item.x, item.y, item.width, item.height);

        ctx.strokeStyle= strokeStyle;
        ctx.strokeRect(item.x, item.y, item.width, item.height);
        ctx.stroke();
        ctx.fill();
        ctx.restore();

        this._drawText(ctx,item.x+paddingWidth,item.y,item.title,true)
        
    }
    _noteRectangle(ctx:any,item:any){
        var y = item.cornerY + NOTE_PADDING_TOP;
        var height = item.noteHeight - NOTE_PADDING_TOP - NOTE_PADDING_BOTTOM;

       var color = item.noteItem.color || NOTE_FILL_STYLE;

        // draw left, top
        ctx.save()
        ctx.beginPath()
        ctx.lineWidth=1;
        ctx.fillStyle=  color;
        ctx.strokeStyle=NOTE_STROKE_STYLE;

        ctx.moveTo(item.noteX, y+height); // left bottom
        ctx.lineTo(item.noteX, y); // left
        ctx.lineTo(item.noteX+ item.noteWidth -10, y); //top
        ctx.lineTo(item.noteX+ item.noteWidth,y+10); 
        ctx.lineTo(item.noteX+ item.noteWidth,y+height); //right
        ctx.closePath();
        ctx.stroke();
        ctx.fill()
        ctx.restore()

        ctx.save()
        ctx.beginPath()
        ctx.lineWidth=1;
        ctx.strokeStyle=NOTE_STROKE_STYLE;
        ctx.moveTo(item.noteX+ item.noteWidth -10 , y); //top
        ctx.lineTo(item.noteX+ item.noteWidth -10 ,y+10); 
        ctx.lineTo(item.noteX+ item.noteWidth,y+10); //right
        ctx.closePath();
        ctx.stroke();
        ctx.restore()

        // draw right, bottom
        ctx.save()
        ctx.beginPath()
        ctx.lineWidth=1;
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=2;
        ctx.shadowOffsetY=2;
        ctx.shadowColor= shadowColor;
        ctx.strokeStyle=NOTE_STROKE_STYLE;

        ctx.moveTo(item.noteX+item.noteWidth, y+10);
        ctx.lineTo(item.noteX+item.noteWidth, y+height);
        ctx.lineTo(item.noteX, y+height);
        ctx.stroke();
        ctx.restore()
        ctx.beginPath()

        this._drawText(ctx,item.noteX+NOTE_PADDING_LEFT,y,item.noteItem.message,false)
        
    }
    _oneParticipantSize(ctx:any,item:any){
        var pw = paddingWidth;
        var ph = paddingHeight;
        var obj = this._measureText(ctx,item.title,fontSize);
        item.width = obj.width + pw*2;
        item.height = obj.height;
        if("collections"==item.type){
            item.width +=4;
            item.height +=4;
        }
        if(iParticipant.indexOf(item.type)!==-1){
            item.width = obj.width;
            item.height += this.iPar.get(item.type).height;
            if(item.width<this.iPar.get(item.type).width){
                item.width = this.iPar.get(item.type).width;
            }
        }
    }
    _calcObjSize(ctx:any,obj:any){
        if(obj.title.length>0){
            var mObj = this._measureText(ctx,obj.title,TITLE_SIZE);
            obj.titleHeight = mObj.height;
        }
        if(obj.header.length>0){
            var hObj = this._measureText(ctx,obj.header,fontSize);
            obj.headerHeight = hObj.height;
        }
        if(obj.footer.length>0){
            var fObj = this._measureText(ctx,obj.footer,fontSize);
            obj.footerHeight = fObj.height;
        }
        if(obj.box.length>0){
            for(var i=0;i<obj.box.length;i++){
               var boxItem = obj.box[i];
               if(boxItem.title !=null && boxItem.title.length>0){ 
                   var tObj = this._measureText(ctx,boxItem.title,fontSize);
                   obj.boxHeight = Math.max(obj.boxHeight, tObj.height);
               }
            }

        }
    }
    _calcParticipantSize(ctx:any,participant:any){
        ctx.font = font;
        var len = participant.length;
        for (var i = 0; i < len; i++) {
            var item = participant[i];
            this._oneParticipantSize(ctx,item);
        }
    }
     _calcLineSize(ctx:any,secObj:any){
        ctx.font = font;
        var lines = secObj.lines;
        var len = lines.length;
        var pw = paddingWidth;

        for (var i = 0; i < len; i++) {
            var item = lines[i];
            var obj = this._measureText(ctx,item.message,fontSize);
            item.width = obj.width + pw*2;
            if(secObj.autonumber){
                var numObj = this._measureText(ctx,"99 ",fontSize);
                item.width += numObj.width;
            }
            if(item.type==LINE_ALT || item.type==LINE_GROUP){
                item.height = obj.height + linePadding;
            }else if(item.type == LINE_REF){
                item.height = obj.height + linePadding + REF_HEIGHT;
                item.width = Math.max(item.width,REF_MIN_WIDTH);
            }else if(item.type == LINE_END){
                item.height = END_HEIGHT;
            }else if(item.type == LINE_SPACE){
                var h = parseInt(item.message);
                if(h>0){
                    item.height=h;
                }else{
                    item.height = obj.height;
                }
            }else if(item.type == LINE_DELAY){
                if(""==item.message.trim()){
                    item.height = 25;
                }else{
                    item.height = 40;
                }
            }else{
                item.height = obj.height + linePadding;
            }
            if(item.from == item.to && item.type == LINE_SEQUENCE){
                item.height += toSelfHeight;
            }
            item.lineHeight = item.height;
            if(item.noteItem !=undefined){
                var noteObj = this._measureText(ctx,item.noteItem.message,fontSize);
                item.noteWidth = noteObj.width + NOTE_PADDING_LEFT + NOTE_PADDING_RIGHT;
                item.noteHeight = noteObj.height + NOTE_PADDING_TOP + NOTE_PADDING_BOTTOM;
                item.height = Math.max(item.lineHeight,item.noteHeight);
            }
        }
    }
    _calcCrossSpan(obj:any,i:number,arr:any){
        if(i<2)return 0;
        var preItem = obj.participant[i-1];
        var crossSpan =0;
        var item = obj.participant[i]
        for(var j=0;j<i-1;j++){
            var crossItem = obj.participant[j];
            var val = crossItem.name + "_" + item.name;
            var val2 = item.name + "_" + crossItem.name;
            var span = 0;
            if(arr[val] !== undefined){
                span = Math.max(span,arr[val])
            }
            if(arr[val2] !== undefined){
                span = Math.max(span,arr[val2])
            }
            span = span - (preItem.x-crossItem.x)
            crossSpan = Math.max(crossSpan,span) 
        }
        return crossSpan
    }
    _calcParticipantXY(obj:any){
        obj.innerHeight = 0;
        var len = obj.participant.length;
        var arr:any = [];
        var minWidth = 100;
        obj.maxParticipantHeight = 0;
        for(var j=0;j<obj.lines.length;j++){
            var item = obj.lines[j];
            var t = item.from + "_" + item.to;
            if(arr[t] === undefined || arr[t]<item.width){
                arr[t] = item.width;
            }
            if(arr[t]<minWidth){
                arr[t]=minWidth;
            }
            obj.innerHeight += item.height
        }
        for(var i=0;i<len;i++){
            obj.maxParticipantHeight = Math.max(obj.participant[i].height,obj.maxParticipantHeight);
        }
        var picPadding = pagePadding + obj.titleHeight + obj.headerHeight + obj.boxHeight;
        for(var i=0;i<len;i++){
            var item = obj.participant[i];
            if(i==0){
                item.x = pagePadding;
                item.y = picPadding + obj.maxParticipantHeight - item.height;
                item.lineX = item.x + item.width/2;
                item.lineY = item.y + item.height;
                continue
            }
            var preItem = obj.participant[i-1];
            var val = preItem.name + "_" + item.name;
            var val2 = item.name + "_" + preItem.name;
            var minPar = preItem.width  + participantPadding;
            var span = Math.max( minWidth,minPar);
            
            if(arr[val] !== undefined){
                span = Math.max(span,arr[val])
            }
            if(arr[val2] !== undefined){
                span = Math.max(span,arr[val2])
            }
            var crossSpan = this._calcCrossSpan(obj,i,arr);
            span = Math.max(span,crossSpan);
            item.x = preItem.x + span;
            
            item.y = picPadding + obj.maxParticipantHeight - item.height;
            item.lineX = item.x + item.width/2;
            item.lineY = item.y + item.height;
        }
        obj.height = Math.ceil(obj.titleHeight + obj.footerHeight + obj.headerHeight + obj.boxHeight 
            + lineHeight + obj.innerHeight + obj.maxParticipantHeight*2 + pagePadding*2);
        if(obj.box.length>0){
            obj.height += pagePadding;
        }
        var lastWidth = obj.participant[len-1].width;
        var lastLineWidth = arr[obj.participant[len-1].name + "_" + obj.participant[len-1].name];
        if(lastLineWidth && lastLineWidth>lastWidth/2){
            lastWidth = lastWidth/2 + lastLineWidth;
        }
        obj.width = Math.ceil(obj.participant[len-1].x + lastWidth + pagePadding) ; 
    }
    _calcLinesXY(obj:any){
        var hisArr = [];
        var curY = pagePadding + obj.headerHeight + obj.boxHeight + obj.titleHeight + obj.maxParticipantHeight;
        var curGroupItem, lastGroupItem;
        var minX = 0;
        var maxX = 0;
        for(var j=0;j<obj.lines.length;j++){
            var item = obj.lines[j];
            item.cornerY = curY;
            item.lineY = item.cornerY + (item.height-item.lineHeight)/2;
            curY +=item.height;
            item.y = curY;
            item.toY = curY;

            if(item.type==LINE_ALT || item.type ==LINE_GROUP){
                if(hisArr.length==0){
                    lastGroupItem = undefined
                }
                hisArr.push(item);
                curGroupItem = item;
            }else if(item.type==LINE_END){
                curGroupItem = hisArr.pop();
                if(curGroupItem!=undefined){
                    curGroupItem.toY = curY;
                    if(lastGroupItem!==undefined){
                        if(curGroupItem.x==undefined){
                            curGroupItem.x = lastGroupItem.x - GROUP_GROUP_LEFT_PADDING;
                        }else{
                            curGroupItem.x = Math.min(curGroupItem.x,lastGroupItem.x-GROUP_GROUP_LEFT_PADDING);
                        }
                        if(curGroupItem.toX==undefined){
                            curGroupItem.toX = lastGroupItem.toX + GROUP_GROUP_RIGHT_PADDING
                        }else{
                            curGroupItem.toX = Math.max(curGroupItem.toX,lastGroupItem.toX + GROUP_GROUP_RIGHT_PADDING);
                        }
                        minX = Math.min(minX,curGroupItem.x);
                        maxX = Math.max(maxX,curGroupItem.toX);
                    }
                    
                }
                lastGroupItem = curGroupItem;
                if(hisArr.length>0){
                    curGroupItem = hisArr[hisArr.length-1];
                }
            }else if(item.type == LINE_ELSE){
                item.refItem = curGroupItem;
            }else if(item.type == LINE_ONLY_NOTE){
                item.noteX = this._calcOnlyNote(item,obj);
                minX = Math.min(minX,item.noteX);
                maxX = Math.max(maxX,item.noteX+item.noteWidth+pagePadding);
            }else if(item.type == LINE_REF){
                item.x = this._calcRefX(item,obj);
                item.toX = item.x + item.width;
                item.toY = item.cornerY + item.height;

                minX = Math.min(minX,item.x);
                maxX = Math.max(maxX,item.toX+pagePadding);
            }
            if(item.type !==LINE_SEQUENCE){
                continue;
            }
            var fromParticipant, toParticipant;
            for(var k=0;k<obj.participant.length;k++){
                if(obj.participant[k].name == item.from){
                    fromParticipant = obj.participant[k];
                }
                if(obj.participant[k].name == item.to){
                    toParticipant = obj.participant[k];
                }
            }
            item.x = fromParticipant.lineX
            item.toX = toParticipant.lineX
            //note x
            if(item.noteItem!=undefined){
                if("left"==item.noteItem.direction){
                    item.noteX = Math.min(item.x,item.toX) - item.noteWidth - NOTE_MARGIN;
                    minX = Math.min(minX,item.noteX);
                }else if("right"==item.noteItem.direction){
                    item.noteX = Math.max(item.x,item.toX) + NOTE_MARGIN;
                    maxX = Math.max(maxX,item.noteX+item.noteWidth+pagePadding);
                }
            }

            if(curGroupItem!=undefined){
                var minVal = Math.min(item.x,item.toX);
                var maxVal = Math.max(item.x,item.toX);
                if(curGroupItem.x==undefined){
                    curGroupItem.x = minVal - GROUP_LINE_LEFT_PADDING
                }else{
                    curGroupItem.x = Math.min(minVal - GROUP_LINE_LEFT_PADDING,curGroupItem.x)
                }
                if(curGroupItem.toX == undefined){
                    curGroupItem.toX = maxVal + GROUP_LINE_RIGHT_PADDING
                }else{
                    curGroupItem.toX = Math.max(maxVal + GROUP_LINE_RIGHT_PADDING,curGroupItem.toX)
                }
            }
        }
        if(maxX+pagePadding>obj.width){
            obj.width = maxX+pagePadding
        }
        if(minX<0){
            obj.tranlateX = Math.ceil(Math.abs(minX));
            obj.width += obj.tranlateX
        }
    }
    _calcRefX(item:any,obj:any){
        var fromParticipant, toParticipant;
        for(var k=0;k<obj.participant.length;k++){
            if(obj.participant[k].name == item.from){
                fromParticipant = obj.participant[k];
            }
            if(obj.participant[k].name == item.to){
                toParticipant = obj.participant[k];
            }
        }
        if(fromParticipant==undefined){
            return 0;
        }
        if(toParticipant!==undefined){
            var w = Math.abs(toParticipant.lineX - fromParticipant.lineX) + REF_PADDING ;
            item.width = Math.max(item.width,w);
            return (toParticipant.lineX + fromParticipant.lineX)/2 - item.width/2
        }else{
            return fromParticipant.lineX - 20;
        }
    }
     _calcOnlyNote(item:any,obj:any){
        var fromParticipant, toParticipant;
        for(var k=0;k<obj.participant.length;k++){
            if(obj.participant[k].name == item.noteItem.participant){
                fromParticipant = obj.participant[k];
            }
            if(obj.participant[k].name == item.noteItem.participantTo){
                toParticipant = obj.participant[k];
            }
        }
        if(toParticipant!==undefined){
            return (toParticipant.lineX + fromParticipant.lineX)/2 - item.noteWidth/2
        }else{
            if("left"==item.noteItem.direction){
                return fromParticipant.lineX - item.noteWidth - NOTE_MARGIN;
            }else if("right"==item.noteItem.direction){
                return fromParticipant.lineX + NOTE_MARGIN;
            }else{
                return fromParticipant.lineX - item.noteWidth/2;
            }
        }
    }
    _copyObj(obj:any){
        var copy = {};
        Object.assign(copy,obj);
        return copy;
    }
    _delayLine(ctx:any,x:number,y:number,toX:number,toY:number,arr:any){
        var yPadding =10;
        this._realLine(ctx,x,y,toX,arr[0].from + yPadding)
        
        for(var i=0;i<arr.length;i++){
            if(i>=1){
                this._realLine(ctx,x,arr[i-1].to + yPadding,toX,arr[i].from + yPadding);
            }
            this._dotedLine(ctx,x,arr[i].from + yPadding ,toX,arr[i].to + yPadding);

        }
        this._realLine(ctx,x,arr[arr.length-1].to + yPadding,toX,toY)
    }
    _dotedLine(ctx:any, x:number, y:number, toX:number, toY:number){
        ctx.save()
        ctx.beginPath()
        ctx.setLineDash([1,4])
        ctx.moveTo(x,y)
        ctx.lineTo(toX,toY)
        ctx.stroke()
        ctx.fill()
        ctx.restore()
    }
    _dashedLine(ctx:any, x:number, y:number, toX:number, toY:number){
        ctx.save()
        ctx.beginPath()
        ctx.setLineDash([5,5])
        ctx.moveTo(x,y)
        ctx.lineTo(toX,toY)
        ctx.stroke()
        ctx.fill()
        ctx.restore()
    }
    _realLine(ctx:any, x:number, y:number, toX:number, toY:number){
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(x,y)
        ctx.lineTo(toX,toY)
        ctx.stroke()
        ctx.fill()
        ctx.restore()
    }
    _drawOneParticipant(ctx:any,item:any){
        if(item.type=="actor"){
            this._drawActor(ctx,item);
        }else if(item.type=="boundary"){
            this._drawBoundary(ctx,item);
        }else if(item.type=="control"){
            this._drawControl(ctx,item);
        }else if(item.type=="entity"){
            this._drawEntity(ctx,item);
        }else if(item.type=="database"){
            this._drawDatabase(ctx,item);
        }else if(item.type=="collections"){
            this._drawCollections(ctx,item);
        }else{
            this._rectangle(ctx,item);
        }
    }

    _drawOneBox(ctx:any,item:any){
        
        ctx.save()
        ctx.beginPath()

        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowBlur=1;
        ctx.fillStyle= boxColor;
        if(item.color !=null){
           ctx.fillStyle = item.color
        }
        ctx.fillRect(item.x, item.y, item.width, item.height);

        ctx.strokeStyle= strokeStyle;
        ctx.strokeRect(item.x, item.y, item.width, item.height);
        ctx.stroke();
        ctx.fill();
        ctx.restore();

        ctx.save()
        ctx.font= font;
        ctx.fillStyle = textFillStyle;
        
        var mObj = this._measureText(ctx,item.title,fontSize);
        var drawX = item.x + (item.width - mObj.width)/2
        this._onlyDrawText(ctx, drawX, item.y,item.title, fontSize,true);
        ctx.fill()
        ctx.restore()
    }
    _drawObj(ctx:any,obj:any){
        if(obj.titleHeight>0){
            ctx.font = TITLE_FONT;
            var mObj = this._measureText(ctx,obj.title,TITLE_SIZE);
            var titleX = (obj.width-mObj.width)/2;
            this._drawTitleText(ctx,titleX, pagePadding+obj.headerHeight,obj.title);
        }
        if(obj.headerHeight>0){
            ctx.font = font;
            var hObj = this._measureText(ctx,obj.header,fontSize);

            var headerX = obj.width - pagePadding - hObj.width;
            this._drawText(ctx,headerX, pagePadding,obj.header,false);
        }
        if(obj.footerHeight>0){
            ctx.font = font;
            var fObj = this._measureText(ctx,obj.footer,fontSize);
            var footerX = obj.width - pagePadding - fObj.width;
            this._drawText(ctx,footerX, obj.height-obj.footerHeight,obj.footer,false);
        }
        if(obj.box.length>0){
           for(var i=0;i<obj.box.length;i++){
               this._drawOneBox(ctx,obj.box[i])
           }
        }
    }
    _drawParticipant(ctx:any,obj:any){
        var len = obj.participant.length;
        var delayArr = this._patchDelay(obj);
        
        for(var i=0;i<len;i++){
            var item = obj.participant[i];
            if(item.name=="[" || item.name=="]")continue
            this._drawOneParticipant(ctx,item);
            let bottom = new Participant();
            Object.assign(bottom,item);
            bottom.y = item.y + obj.innerHeight + lineHeight + item.height;
            bottom.isBottom = true;
            if(!obj.hideFootbox){
                this._drawOneParticipant(ctx,bottom);
            }
            if(delayArr.length>0){
                this._delayLine(ctx,item.lineX,item.lineY,item.lineX,bottom.y,delayArr);
            }else{
                this._dashedLine(ctx,item.lineX,item.lineY,item.lineX,bottom.y);
            }
        }
    }
    _patchDelay(obj:any){
        var len = obj.lines.length;
        var arr = []
        for(var i=0;i<len;i++){
            var line = obj.lines[i];
            if(line.type==LINE_DELAY){
                arr.push({from:line.cornerY, to: line.cornerY+line.height})
            }
        }
        return arr;
    }
    _drawRef(ctx:any,item:any){
        
        this._groupRectangle(ctx,item)
    }
    _drawActive(ctx:any,obj:any){
        for(var i=0;i<obj.activeLines.length;i++){
            this._activeRectangle(ctx,obj.activeLines[i]);
        }
    }
    _drawLines(ctx:any,obj:any){
        var len = obj.lines.length;
        for(var i=0;i<len;i++){
            var item = obj.lines[i];
            if(item.type==LINE_SEQUENCE){
                this._line(ctx,item,obj);
            }else if(item.type==LINE_SEPRATE){
                this._separateLine(ctx,item,obj)
            }else if(item.type == LINE_ELSE){
                this._elseLine(ctx,item,obj)
            }else if(item.type == LINE_ONLY_NOTE){
                this._noteRectangle(ctx,item)
            }else if(item.type == LINE_REF){
                this._drawRef(ctx,item)
            }else if(item.type == LINE_DELAY){
                this._drawDelay(ctx,item,obj.width)
            }
        }
    }
    _drawDelay(ctx:any,item:any,objWidth:number){
        if(item.message.trim()==""){
            return;
        }
        var mObj = this._measureText(ctx,item.message,fontSize);
        var x = (objWidth - mObj.width)/2 - NOTE_PADDING_LEFT;
        this._drawText(ctx,x,item.lineY+20, item.message,false);
    }
    _drawGroupAlt(ctx:any,obj:any){
        var len = obj.lines.length;
        for(var i=0;i<len;i++){
            var item = obj.lines[i];
            if(item.type==LINE_ALT || item.type == LINE_GROUP){
                this._groupRectangle(ctx,item)
            }
        }
    }
    _separateLine(ctx:any,item:any,obj:any){
        ctx.save(); 
        ctx.beginPath(); 
        var midY = item.y -item.height /2 + paddingHeight;
        var boxX = obj.width/2 - item.width/2;
        var textObj = this._measureText(ctx,item.message,fontSize);
        var boxY = midY - textObj.height/2;
        var boxHeight = textObj.height;

        var line1 = midY-2;
        var line2 = midY +2;
        ctx.fillStyle= fillStyleWhite;
        ctx.fillRect(0, line1, obj.width, 4);
        ctx.fill();

        ctx.moveTo(0, line1); 
        ctx.lineTo(obj.width, line1); 
        ctx.moveTo(obj.width,line2);
        ctx.lineTo(0, line2); 
        ctx.stroke(); 
        ctx.beginPath(); 

        
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=4;
        ctx.shadowOffsetY=4;
        ctx.shadowColor= shadowColor;

        ctx.fillStyle= fillStyleWhite;
        ctx.fillRect(boxX, boxY, item.width, boxHeight);
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowBlur=1;

        ctx.fillRect(boxX, boxY, item.width, boxHeight);

        ctx.strokeStyle= strokeStyle;
        ctx.strokeRect(boxX, boxY, item.width, boxHeight);

        ctx.stroke(); 
        ctx.restore(); 

        this._drawText(ctx,boxX+paddingWidth,boxY-2, item.message,false);

    }
     _drawToSelf(ctx:any,x:number,y:number){
        ctx.save(); 
        ctx.beginPath(); 
        ctx.moveTo(x, y); 
        ctx.lineTo(x + 40, y); 
        ctx.lineTo(x+40, y+13); 
        
        ctx.lineTo(x, y+13); 
        ctx.stroke(); 
        ctx.restore(); 
        this._drawArrow(ctx,x,y+13,true);

    }
    _elseLine(ctx:any,item:any,obj:any){
        var message = "["+ item.message + "]";
        var textObj = this._measureText(ctx,item.message,fontSize);
        this._drawGroupText(ctx,Math.min(item.refItem.x,item.refItem.toX) + 10,item.y-textObj.height, message,false);
        var lineY = item.cornerY + 7
        this._dashedLine(ctx,item.refItem.x, lineY, item.refItem.toX, lineY);
    }
     _line(ctx:any,item:any,obj:any){
      /*
        ctx.save(); 
        ctx.fillStyle = FILL_RED;
        ctx.fillRect(Math.min(item.x,item.toX), item.cornerY, item.width, item.height);
        ctx.restore();
    */
        if(item.noteItem != undefined){
            this._noteRectangle(ctx,item)
        }
        var message = item.message;
        if(obj.autonumber){
            message = item.number + " " + message;
        }
        var textObj = this._measureText(ctx,item.message,fontSize);
        if(item.from==item.to){
            this._drawText(ctx,Math.min(item.x,item.toX) + 10,item.lineY+paddingHeight, message,false);
            this._drawToSelf(ctx,item.x,item.lineY+item.lineHeight-toSelfHeight)
            return;
        }else{
            this._drawText(ctx,Math.min(item.x,item.toX) + 10,item.lineY+paddingHeight, message);
        }
        if(dashOperators.indexOf(item.operator)!==-1){
            this._dashedLine(ctx,item.x, item.lineY+item.lineHeight, item.toX, item.lineY+item.lineHeight);
        }else{
            this._realLine(ctx,item.x, item.lineY+item.lineHeight, item.toX, item.lineY+item.lineHeight);
        }
        this._drawArrow(ctx,item.toX,item.lineY+item.lineHeight,item.x>item.toX);
    }
    _drawArrow(ctx:any, x:number,y:number,reverse:boolean) { 
        var xDelta =-12;
        var xDelta2 =-7;
        var yDelta =-5;
        if(reverse){
            xDelta = 0 -xDelta;
            xDelta2 = 0- xDelta2;
            yDelta = 0- yDelta;
        }
        
        ctx.save(); 
        ctx.beginPath(); 
        ctx.moveTo(x, y); 
        ctx.lineTo(x + xDelta, y+yDelta); 
        ctx.lineTo(x+xDelta2, y); 
        
        ctx.lineTo(x + xDelta, y-yDelta); 
        ctx.lineTo(x,y);
        ctx.stroke(); 
        ctx.fill();
        ctx.restore(); 
    }
    _drawDatabase(ctx:any,item:any){
        var x = item.x;
        var y = item.y;
        if(item.isBottom){
            y+=fontSize+paddingHeight;
        }
        var picWidth =  this.iPar.get("database").width;
        var picHeight = this.iPar.get("database").height;
        if(item.width>picWidth){
            x = item.x + (item.width-picWidth)/2;
        }
        ctx.save()
        ctx.lineWidth=2
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        ctx.shadowBlur=0;
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowColor= shadowColor;

        ctx.beginPath();
        ctx.fillRect(item.x, y+11, 38, 28);
        ctx.fill()

        ctx.lineWidth=2
        ctx.ellipse(x+19,y+11,19,11,0,0,Math.PI*2);
        
        ctx.ellipse(x+19,y+39,19,11,0,0,Math.PI);
        ctx.moveTo(x,y+11)
        ctx.lineTo(x,y+39)
        ctx.moveTo(x+38,y+11)
        ctx.lineTo(x+38,y+39)
        ctx.fill()
        ctx.stroke()
        ctx.beginPath()
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=2;
        ctx.shadowOffsetY=3;
        ctx.shadowColor= shadowColor;
        
        ctx.moveTo(x+38,y+11)
        ctx.lineTo(x+38,y+39)
        ctx.ellipse(x+19,y+39,19,11,0,0,Math.PI);
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.beginPath();
        ctx.font= font;
        ctx.fillStyle = textFillStyle;
        x=item.x;
        var textWidth = ctx.measureText(item.title).width;
        if(textWidth<picWidth){
            x+= (picWidth-textWidth)/2;
        }
        ctx.fontSize = fontSize;
        if(item.isBottom){
            ctx.fillText(item.title,x,y-paddingHeight);
        }else{
            ctx.fillText(item.title,x,fontSize+picHeight+item.y);
        }
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }
    _drawEntity(ctx:any,item:any){
        var x = item.x;
        var y = item.y;
        if(item.isBottom){
            y+=fontSize+paddingHeight;
        }
        var picWidth = this.iPar.get("entity").width;
        var picHeight = this.iPar.get("entity").height;
        if(item.width>picWidth){
            x = item.x + (item.width-picWidth)/2;
        }
        ctx.save()
        ctx.lineWidth=2
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=4;
        ctx.shadowOffsetY=4;
        ctx.shadowColor= shadowColor;

        ctx.beginPath();
        ctx.lineWidth=2

        ctx.arc(x+12,y+12,12,0,2*Math.PI);
        ctx.stroke()
        ctx.beginPath()
        ctx.shadowBlur=0;
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.arc(x+12,y+12,11,0,2*Math.PI);
        ctx.fill();

        ctx.beginPath()
        ctx.fillStyle = strokeStyle;
        ctx.moveTo(x,y+25);
        ctx.lineTo(x+25,y+25);
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.beginPath();
        ctx.font= font;
        ctx.fillStyle = textFillStyle;
        x=item.x;
        var textWidth = ctx.measureText(item.title).width;
        if(textWidth<picWidth){
            x+= (picWidth-textWidth)/2;
        }
        ctx.fontSize = fontSize;
        if(item.isBottom){
            ctx.fillText(item.title,x,y-paddingHeight);
        }else{
            ctx.fillText(item.title,x,fontSize+picHeight+item.y);
        }
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }

    _drawControl(ctx:any,item:any){
        var x = item.x;
        var y = item.y;
        if(item.isBottom){
            y+=fontSize+paddingHeight;
        }
        var picWidth = this.iPar.get("control").width;
        var picHeight = this.iPar.get("control").height;
        if(item.width>picWidth){
            x = item.x + (item.width-picWidth)/2;
        }
        ctx.save()
        ctx.lineWidth=2
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=4;
        ctx.shadowOffsetY=4;
        ctx.shadowColor= shadowColor;

        ctx.beginPath();
        ctx.lineWidth=2

        ctx.arc(x+13,y+19,13,0,2*Math.PI);
        ctx.stroke()
        ctx.beginPath()
        ctx.shadowBlur=0;
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.arc(x+13,y+19,12,0,2*Math.PI);
        ctx.fill();

        ctx.beginPath()
        ctx.fillStyle = strokeStyle;
        ctx.moveTo(x+10,y+6);
        ctx.lineTo(x+17,y+12);
        ctx.lineTo(x+15,y+6);
        ctx.lineTo(x+17,y);
        ctx.closePath()
        ctx.fill()
        ctx.restore()

        ctx.save()
        ctx.beginPath();
        ctx.font= font;
        ctx.fillStyle = textFillStyle;
        x=item.x;
        var textWidth = ctx.measureText(item.title).width;
        if(textWidth<picWidth){
            x+= (picWidth-textWidth)/2;
        }
        ctx.fontSize = fontSize;
        if(item.isBottom){
            ctx.fillText(item.title,x,y-paddingHeight);
        }else{
            ctx.fillText(item.title,x,fontSize+picHeight+item.y);
        }
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }
    
    _drawBoundary(ctx:any,item:any){
        var x = item.x+1;
        var y = item.y;
        if(item.isBottom){
            y+=fontSize+paddingHeight;
        }
        var picWidth = this.iPar.get("boundary").width;
        var picHeight = this.iPar.get("boundary").height;
        if(item.width>picWidth){
            x = item.x + (item.width-picWidth)/2;
        }
        ctx.save()
        ctx.beginPath();
        ctx.lineWidth=2
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=4;
        ctx.shadowOffsetY=4;
        ctx.shadowColor= shadowColor;

        ctx.moveTo(x,y);
        ctx.lineTo(x,y+24);
        ctx.moveTo(x,y+12);
        ctx.lineTo(x+17,y+12);
        ctx.stroke()

        ctx.beginPath();
        ctx.lineWidth=2

        ctx.arc(x+29,y+12,12,0,2*Math.PI);
        ctx.stroke()
        ctx.beginPath()
        ctx.shadowBlur=0;
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.arc(x+29,y+12,11,0,2*Math.PI);
        ctx.fill();

        ctx.restore()

        ctx.save()
        ctx.beginPath();
        ctx.font= font;
        ctx.fillStyle = textFillStyle;
        x=item.x;
        var textWidth = ctx.measureText(item.title).width;
        if(textWidth<picWidth){
            x+= (picWidth-textWidth)/2;
        }
        ctx.fontSize = fontSize;
        if(item.isBottom){
            ctx.fillText(item.title,x,y-paddingHeight);
        }else{
            ctx.fillText(item.title,x,fontSize+picHeight+item.y);
        }
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }
    _drawActor(ctx:any,item:any){
        var x = item.x+2;
        var y = item.y;
        if(item.isBottom){
            y+=fontSize+paddingHeight;
        }
        var picWidth = this.iPar.get("actor").width;
        var picHeight = this.iPar.get("actor").height;

        if(item.width>picWidth){
            x = item.x + (item.width-picWidth)/2;
        }
        ctx.save()
        ctx.beginPath();
        ctx.lineWidth=2
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;

        ctx.arc(x+15,y+8,8,0,2*Math.PI);
        ctx.fill();
        ctx.moveTo(x+15,y+16);
        ctx.lineTo(x+15,y+40);
        ctx.moveTo(x+2,y+22);
        ctx.lineTo(x+28,y+22);
        ctx.moveTo(x,y+54);
        ctx.lineTo(x+15,y+40);
        ctx.lineTo(x+30,y+54)
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.beginPath();
        ctx.font= font;
        ctx.fillStyle = textFillStyle;
        x=item.x;
        var textWidth = ctx.measureText(item.title).width;
        if(textWidth<picWidth){
            x+= (picWidth-textWidth)/2;
        }
        if(item.isBottom){
            ctx.fillText(item.title,x,y-paddingHeight);
        }else{
            ctx.fillText(item.title,x,fontSize+picHeight+item.y);
        }
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }
    
    _drawGroupText(ctx:any,x:number,y:number,title:string,center:boolean){
        ctx.save()
        ctx.font= GROUP_TEXT_FONE
        ctx.fillStyle = textFillStyle;
        this._onlyDrawText(ctx, x, y,title, fontSize,center);
        ctx.fill()
        ctx.restore()
    }
    _drawText(ctx:any,x:number,y:number,title:string,center?:boolean){
        ctx.save()
        ctx.font= font;
        ctx.fillStyle = textFillStyle;
        this._onlyDrawText(ctx, x, y,title, fontSize,center);
        ctx.fill()
        ctx.restore()
    }
     _drawTitleText(ctx:any,x:number,y:number,title:string){
        ctx.save()
        ctx.font= TITLE_FONT;
        ctx.fillStyle = textFillStyle;
        this._onlyDrawText(ctx, x, y,title, fontSize,true);
        ctx.fill()
        ctx.restore()
    }
     _onlyDrawText(ctx:any, x:number, y:number,title:string, size:number,center:boolean) {
        var fSize = size || fontSize;
        var arr = title.split("\n");
        var obj = null;
        if (center) {
            obj = this._measureText(ctx, title,fSize);
        }
        for (var i = 0; i < arr.length; i++) {
            var lineX = x;
            var lineY = y + i * (fSize + paddingHeight);
            if (center) {
                lineX = x + (obj.width - ctx.measureText(arr[i]).width) / 2;
            }
            ctx.fillText(arr[i], lineX, fSize + lineY + paddingHeight - 1);
        }
    }
    _getLineItem(lineType:any,message:string,typeName:any):Line{
        return {
            from:"",
            to: "",
            message: message,
            operator: "",
            number:0,
            type: lineType,
            typeName: typeName,
            active:[]
        }
    }
    isIntNum(val:any){
        var regPos = /^\d+$/; 
        if(regPos.test(val)){
            return true;
        }else{
            return false;
        } 
    }
    _parseSkinparam(tokens:any,obj:any,cur:number){
       var len = tokens.length;
        // handle below case:
        // skinparam maxMessageSize 50
       if(cur+1<len){
          var nameItem = tokens[cur]
          var valueItem = tokens[cur+1]
          if("maxMessageSize" == nameItem.value && this.isIntNum(valueItem.value)){
             obj.maxMessageSize = valueItem.value
             cur +=2
          }
       } 
       return cur
    }
    _parseRef(tokens:any,obj:any,cur:number){
        var len = tokens.length;

        /* handle below case:
                ref over Alice, Bob : init
            */
        if(cur+5<len){
            var refFrom = tokens[cur+1];
            var refTo = tokens[cur+3];

            var refMessage = tokens[cur+5];

            if("over"==tokens[cur].value && refFrom.type==TYPE_WORD
                && tokens[cur+2].type == TYPE_COMMA && refTo.type==TYPE_WORD
                && tokens[cur+4].value == ":" && refMessage.type ==TYPE_MESSAGE
            ){
                    var lineObj = this._getLineItem(LINE_REF,refMessage.value,"REF")
                    lineObj.from = refFrom.value;
                    lineObj.to = refTo.value;
                    obj.lines.push(lineObj)
                return cur+6
            }
        }
        /* handle below case:
            ref over Alice : init
            */
        if(cur+3<len){
            var refFrom = tokens[cur+1];
            var refMessage = tokens[cur+3];

            if("over"==tokens[cur].value && refFrom.type==TYPE_WORD
            && tokens[cur+2].value == ":" && refMessage.type ==TYPE_MESSAGE
            ){
                var lineObj = this._getLineItem(LINE_REF,refMessage.value,"REF")
                lineObj.from = refFrom.value;
                obj.lines.push(lineObj)
                return cur+4
            }
        }
            /* handle below case:
            ref over Bob
            This can be on
            several lines
            end ref
            */
        if(cur+4<len){
            var refFrom = tokens[cur+1];

            var refMessage = tokens[cur+2];

            if("over"==tokens[cur].value && refFrom.type==TYPE_WORD
             && refMessage.type ==TYPE_MESSAGE && tokens[cur+3].value=="end"
             && tokens[cur+4].value=="ref"
            ){
                var lineObj = this._getLineItem(LINE_REF,refMessage.value,"REF")
                lineObj.from = refFrom.value;
                obj.lines.push(lineObj)
                return cur+5
            }
        }
        /* handle below case:
            ref over Alice, Bob
            This can be on
            several lines
            end ref
            */
           if(cur+6<len){
            var refFrom = tokens[cur+1];
            var refTo = tokens[cur+3];

            var refMessage = tokens[cur+4];

            if("over"==tokens[cur].value && refFrom.type==TYPE_WORD
             && tokens[cur+2].type==TYPE_COMMA && refFrom.type==TYPE_WORD
             && refMessage.type ==TYPE_MESSAGE && tokens[cur+5].value=="end"
             && tokens[cur+6].value=="ref"
            ){
                var lineObj = this._getLineItem(LINE_REF,refMessage.value,"REF")
                lineObj.from = refFrom.value;
                lineObj.to = refTo.value;
                obj.lines.push(lineObj)
                return cur+7
            }
        }
    }
    isActive(val:any){
        return activeWords.indexOf(val)!==-1;
    }
    isColor(val:any){
        if(val===undefined){
            return false
        }
        return val[0]==='#';
    }
    handleActive(obj:any,token:any,cur:number,val:any){

        var item = token[cur++];
        var colorWord = token[cur];
        if(colorWord!== undefined &&  this.isColor(colorWord.value)){
            if(obj.lines.length>0){
                obj.lines[obj.lines.length-1].active.push({
                    "type":val,
                    "participant":item.value,
                    "color":colorWord.value
                })
            }
            return cur+1;
        }
        if(item.type==TYPE_WORD){
            if(obj.lines.length>0){
                obj.lines[obj.lines.length-1].active.push({
                    "type":val,
                    "participant":item.value
                })
            }else{
                //todo syntax error
            }
        }else{
            // todo syntax error
        }
        return cur;
    }
    _getObj(tokens:any){
        let obj:SequenceObj = {
            participant : [],
            box : [],
            lines : [],
            activeLines : [],
            innerHeight:0,
            width:0,
            height:0,
            title: '', 
            header: '',
            footer: '',
            headerHeight: 0,
            boxHeight: 0,
            titleHeight: 0,
            footerHeight: 0,
            autonumber:false,
            maxMessageSize:0,
            hideFootbox:false
        };
        var len = tokens.length;
        var cur =0;
        var participantArr = [];
        var number = 1;
        var inBox = false;
        while(cur<len){
            var item = tokens[cur++];
            if(item.type==TYPE_RESERVED){
                if("ref"==item.value){
                    cur = this._parseRef(tokens,obj,cur)
                    continue;
                }
                if("skinparam"==item.value){
                    cur = this._parseSkinparam(tokens,obj,cur)
                    continue;
                }
                if("box"==item.value){
                    //  case
                    // box "Internal Service" #LightBlue
                    if(cur+1<len){
                       var nextItem = tokens[cur];
                       var next2 = tokens[cur+1];
                       if(next2.type == TYPE_WORD && item.line==nextItem.line && item.line==next2.line){
                           obj.box.push({title:nextItem.value,color:next2.value,start:null,end:null}) 
                           cur +=2
                           inBox =true
                           continue
                       }else if(item.line==nextItem.line){
                           obj.box.push({title:nextItem.value,color:null,start:null,end:null}) 
                           cur +=1
                           inBox =true
                           continue
                       } 
                    } 
                    obj.box.push({title:'',color:null,start:null,end:null}) 
                    inBox=true
                    continue;
                }
                if("note"==item.value){
                    // handle two case
                    //note left: this is a first note
                    //note right: this is another note

                    if(cur+2<len){
                        var noteDir = tokens[cur];
                        var noteColon = tokens[cur+1];
                        var noteMessage = tokens[cur+2];
                        if( ("left" == noteDir.value || "right"==noteDir.value)
                         && ":"==noteColon.value && noteMessage.type == TYPE_MESSAGE){
                             var noteItem = {
                                    "direction":noteDir.value,
                                    "message":noteMessage.value
                                }
                            cur = cur+3;
                            if(obj.lines.length>0){
                                obj.lines[obj.lines.length-1].noteItem = noteItem;
                            }
                            continue;
                         }
                    }
                    /** handle blow case
                        note left
                        a note
                        can also be defined
                        on several lines
                        end note
                     */
                    if(cur+3<len){
                        var noteDir = tokens[cur];
                        var noteMessage = tokens[cur+1];
                        if( ("left" == noteDir.value || "right"==noteDir.value)
                         && noteMessage.type == TYPE_MESSAGE 
                         && tokens[cur+2].value=='end' && tokens[cur+3].value=='note'){
                            var noteItem = {
                                "direction":noteDir.value,
                                "message":noteMessage.value
                            }
                            cur = cur+4;
                            if(obj.lines.length>0){
                                obj.lines[obj.lines.length-1].noteItem = noteItem;
                            }
                            continue;
                         }
                    }
                    /** handle blow case
                        note left of Alice #aqua
                        This is displayed
                        left of Alice.
                        end note
                     */
                    if(cur+6<len){
                        var noteDir = tokens[cur];
                        var noteOf = tokens[cur+1];
                        var noteWord = tokens[cur+2];
                        var noteColor = tokens[cur+3];
                        var noteMessage = tokens[cur+4];
                        if( ("left" == noteDir.value || "right"==noteDir.value)
                         && "of" == noteOf.value && noteWord.type == TYPE_WORD
                         && noteMessage.type == TYPE_MESSAGE 
                         && tokens[cur+5].value=='end' && tokens[cur+6].value=='note'){
                            let noteItem:NoteItem = {
                                direction: noteDir.value,
                                message: noteMessage.value,
                                color: noteColor.value,
                                participant: noteWord.value
                            }
                            cur = cur+7;
                            var lineObj = this._getLineItem(LINE_ONLY_NOTE,"","ONLY_NOTE")
                            lineObj.noteItem = noteItem;
                            obj.lines.push(lineObj)
                            continue;
                         }
                    }
                    /** handle blow case
                        note right of Alice: This is displayed right of Alice.
                     */
                    if(cur+4<len){
                        var noteDir = tokens[cur];
                        var noteOf = tokens[cur+1];
                        var noteWord = tokens[cur+2];
                        var noteSeprator = tokens[cur+3];
                        var noteMessage = tokens[cur+4];
                        if( ("left" == noteDir.value || "right"==noteDir.value)
                         && "of" == noteOf.value && noteWord.type == TYPE_WORD
                         && noteSeprator.type == TYPE_SEPARATORS
                         && noteMessage.type == TYPE_MESSAGE ){
                            let noteItem:NoteItem = {
                                "direction": noteDir.value,
                                "message": noteMessage.value,
                                "participant": noteWord.value
                            }
                            cur = cur+5;
                            var lineObj = this._getLineItem(LINE_ONLY_NOTE,"","ONLY_NOTE")
                            lineObj.noteItem = noteItem;
                            obj.lines.push(lineObj)
                            continue;
                         }
                    }
                     /** handle blow case
                        note over Alice: This is displayed over Alice.
                     */
                    if(cur+3<len){
                        var noteOver = tokens[cur];
                        var noteWord = tokens[cur+1];
                        var noteSeprator = tokens[cur+2];
                        var noteMessage = tokens[cur+3];
                        if( "over" == noteOver.value && noteWord.type == TYPE_WORD
                         && noteSeprator.type == TYPE_SEPARATORS
                         && noteMessage.type == TYPE_MESSAGE ){
                            let noteItem:NoteItem = {
                                "direction": noteOver.value,
                                "message": noteMessage.value,
                                "participant": noteWord.value
                            }
                            cur = cur+4;
                            var lineObj = this._getLineItem(LINE_ONLY_NOTE,"","ONLY_NOTE")
                            lineObj.noteItem = noteItem;
                            obj.lines.push(lineObj)
                            continue;
                         }
                    }
                    /** handle blow case
                        note over Alice, Bob #FFAAAA: This is displayed\n over Bob and Alice.
                     */
                    if(cur+6<len){
                        var noteOver = tokens[cur];
                        var noteWord = tokens[cur+1];
                        var noteComma = tokens[cur+2];
                        var noteWordTo = tokens[cur+3];
                        var noteColor = tokens[cur+4];
                        var noteSeprator = tokens[cur+5]
                        var noteMessage = tokens[cur+6];
                        if( "over" == noteOver.value && noteWord.type == TYPE_WORD
                         && noteComma.type == TYPE_COMMA && noteWordTo.type == TYPE_WORD
                         && noteSeprator.type == TYPE_SEPARATORS
                         && noteMessage.type == TYPE_MESSAGE ){
                            let noteItem:NoteItem = {
                                "direction": noteOver.value,
                                "message": noteMessage.value,
                                "participant": noteWord.value,
                                "color":noteColor.value,
                                "participantTo": noteWordTo.value
                            }
                            cur = cur+7;
                            var lineObj = this._getLineItem(LINE_ONLY_NOTE,"","ONLY_NOTE")
                            lineObj.noteItem = noteItem;
                            obj.lines.push(lineObj)
                            continue;
                         }
                    }

                    /** handle blow case
                        note over Bob, Alice
                        This is yet another
                        example of
                        a long note.
                        end note                     
                    */
                    if(cur+6<len){
                        var noteOver = tokens[cur];
                        var noteWord = tokens[cur+1];
                        var noteComma = tokens[cur+2];
                        var noteWordTo = tokens[cur+3];
                        var noteMessage = tokens[cur+4];
                        if( "over" == noteOver.value && noteWord.type == TYPE_WORD
                         && noteComma.type == TYPE_COMMA && noteWordTo.type == TYPE_WORD
                         && noteMessage.type == TYPE_MESSAGE 
                         && tokens[cur+5].value == "end" && tokens[cur+6].value== "note"){
                            let noteItem:NoteItem = {
                                "direction": noteOver.value,
                                "message": noteMessage.value,
                                "participant": noteWord.value,
                                "participantTo": noteWordTo.value
                            }
                            cur = cur+7;
                            var lineObj = this._getLineItem(LINE_ONLY_NOTE,"","ONLY_NOTE")
                            lineObj.noteItem = noteItem;
                            obj.lines.push(lineObj)
                            continue;
                         }
                    }
                }
                if("autonumber"==item.value){
                    obj.autonumber = true
                    continue
                }
                if("title"==item.value){
                    var opItem = tokens[cur++];
                    if(opItem.type == TYPE_MESSAGE){
                        obj.title = opItem.value;
                    }
                }
                if(this.isActive(item.value)){
                    cur = this.handleActive(obj,tokens,cur,item.value)
                    continue;
                }
                if("header"==item.value){
                    var opItem = tokens[cur++];
                    if(opItem.type == TYPE_MESSAGE){
                        obj.header = opItem.value;
                    }
                }
                if("footer"==item.value){
                    var opItem = tokens[cur++];
                    if(opItem.type == TYPE_MESSAGE){
                        obj.footer = opItem.value;
                    }
                }
                if("hide"==item.value){
                    var hideItem = tokens[cur];
                    if("footbox"==hideItem.value){
                        obj.hideFootbox = true
                        cur++
                    }
                    continue
                }
                if("alt"==item.value){
                    var message = "";
                    if(cur<len){
                        var nextItem = tokens[cur];
                        if(nextItem.type==TYPE_MESSAGE){
                            message = nextItem.value;
                            cur++;
                        }
                    }
                    obj.lines.push(this._getLineItem(LINE_ALT,message,item.value));
                    continue
                }
                if("else"==item.value){
                    var message = "";
                    if(cur<len){
                        var nextItem = tokens[cur];
                        if(nextItem.type==TYPE_MESSAGE){
                            message = nextItem.value;
                            cur++;
                        }
                    }
                    obj.lines.push(this._getLineItem(LINE_ELSE,message,item.value));
                    continue
                }
                if("end"==item.value){
                    // handle end box
                    if(cur>=len){
                        obj.lines.push(this._getLineItem(LINE_END,"",item.value));
                        continue
                    }
                    var nextItem = tokens[cur]
                    if(nextItem.value=='box'){
                        inBox=false
                        cur++
                        continue
                    }
                    obj.lines.push(this._getLineItem(LINE_END,"",item.value));
                    continue
                }
                if(groupWords.indexOf(item.value)!==-1){
                    var message = "";
                    if(cur<len){
                        var nextItem = tokens[cur];
                        if(nextItem.type==TYPE_MESSAGE){
                            message = nextItem.value;
                            cur++;
                        }
                    }
                    obj.lines.push(this._getLineItem(LINE_GROUP,message,item.value));
                    continue
                }
                if(participantWords.indexOf(item.value)!==-1){
                    var opItem = tokens[cur++];
                    if(cur+1<len){
                        var asItem = tokens[cur];
                        var valItem = tokens[cur+1];
                      
                        if(opItem.type == TYPE_WORD && asItem.value=="as" && valItem.type == TYPE_STRING){
                            // case 
                            // participant User as "aaa"
                            obj.participant.push({ 
                                name:opItem.value, 
                                title:valItem.value, 
                                type:item.value 
                            });
                            participantArr.push(opItem.value);
                            this.setBox(obj,inBox,opItem.value)
                            cur +=2
                            continue
                        }else if(opItem.type == TYPE_STRING && asItem.value=="as" && valItem.type == TYPE_WORD){
                             // case 
                            // participant "aaa" as user
                            obj.participant.push({ 
                                name:valItem.value, 
                                title:opItem.value, 
                                type:item.value 
                            });
                            participantArr.push(valItem.value);
                            this.setBox(obj,inBox,valItem.value)
                            cur +=2
                            continue
                        }
                    }
                    
                    // case participant User

                    if(opItem.type == TYPE_WORD){
                        obj.participant.push({ 
                            name:opItem.value, 
                            title:opItem.value, 
                            type:item.value 
                        });
                        participantArr.push(opItem.value);
                        this.setBox(obj,inBox,opItem.value)
                        continue
                    }
                }
            }
            if(item.type==TYPE_DELAY){
                obj.lines.push(this._getLineItem(LINE_DELAY,item.value,"DELAY"));
                continue
            }else if(item.type==TYPE_SPACE){
                obj.lines.push(this._getLineItem(LINE_SPACE,item.value,"SPACE"));
                continue
            }
            if(item.type==TYPE_WORD || item.type==TYPE_STRING|| item.type==TYPE_SEPARATE_LINE){
                var lineItem = this._getLineItem(LINE_SEQUENCE,"","SEQUENCE");
                
                if(item.type==TYPE_SEPARATE_LINE){
                    lineItem.type = LINE_SEPRATE
                    lineItem.message = item.value;
                    obj.lines.push(lineItem);
                    continue
                }
                
                if(participantArr.indexOf(item.value)==-1){
                    obj.participant.push({
                        name: item.value,
                        title: item.value,
                        type: "participant"
                    });
                    participantArr.push(item.value);
                }
                if(cur>=len){
                    break;
                }
                var opItem = tokens[cur++];
                if(opItem.type != TYPE_OPERATOR){
                   // syntax error 
                   obj.error = item;
                   return obj;
                } 
                if(cur>=len){
                    break;
                }
                lineItem.operator = opItem.value;
                var toItem = tokens[cur++];
                var toParticipant = {
                    name:toItem.value,
                    title:toItem.value,
                    type: "participant"
                }
                if(cur<len){
                    var sepItem = tokens[cur];
                    if(sepItem.type == TYPE_RESERVED){
                        if("as"==sepItem.value){
                            cur++
                            var wordItem = tokens[cur++];
                            if(wordItem.type == TYPE_WORD){
                                toParticipant.name = wordItem.value
                            }else if(wordItem.type==TYPE_STRING){
                                toParticipant.title = wordItem.value
                            }
                            if(cur<len){
                                sepItem = tokens[cur];
                            }
                        }
                    }
                    if(sepItem.type==TYPE_SEPARATORS){
                        cur++;
                        var messageItem = tokens[cur];
                        if(messageItem.type == TYPE_MESSAGE){
                            lineItem.message = messageItem.value
                        }
                    }
                }
                if(participantArr.indexOf(toParticipant.name)==-1){
                    obj.participant.push(toParticipant);
                    participantArr.push(toParticipant.name);
                }
                if(fromOperators.indexOf(opItem.value)!==-1){
                    lineItem.from = item.value;
                    lineItem.to = toParticipant.name;
                }else{
                    lineItem.from = toParticipant.name;
                    lineItem.to = item.value;
                }
                lineItem.number=number++;
                obj.lines.push(lineItem);
            }
        }
        this.sortParticipant(obj);
        return obj;
    }
    wordwrap(ctx:any,text:string,maxWidth:number){
        var arr = text.split("\n");
        var lines = [];
        for (var i = 0; i < arr.length; i++) {
            var line = arr[i];
            var lineWidth = ctx.measureText(line).width;
            if(lineWidth<=maxWidth){
                lines.push(line);
                continue;
            }
            let cur =0; 
            var tmpLine = "";

            while(cur<line.length){                
                let word = "" + text[cur++];
                while(cur < text.length && text[cur]!=' ' && text.charCodeAt(cur)<256) {                        
                    word += text[cur++];
                }
                var wordWidth = ctx.measureText(word).width;
                let tempLineWidth = ctx.measureText(tmpLine).width;

                if(wordWidth>maxWidth){
                    let wordCur =0;
                    let tmpWord = word[wordCur++];
                    while(wordCur<word.length){
                        let tmpWidth = ctx.measureText(tmpWord + word[wordCur]).width;
                        if(tmpWidth+tempLineWidth>maxWidth){
                            lines.push(tmpLine+tmpWord);
                            tmpLine = "";
                            tempLineWidth = 0;
                            tmpWord=word[wordCur];
                        }else{
                            tmpWord += word[wordCur];
                        }
                        wordCur++
                    }
                    tmpLine = tmpWord
                }else{
                    if(wordWidth+tempLineWidth>maxWidth){
                        lines.push(tmpLine.trim())
                        if(word[0]!=' ' || word.length>1){
                            tmpLine = word;
                        }else{
                            tmpLine = "";
                        }                        
                    }else{
                        tmpLine +=word;
                    }
                }
            }
            if(tmpLine.length>0){
                lines.push(tmpLine.trim())
            }
        }
        return lines.join('\n');
    }
    handleMaxMessage(ctx:any,obj:any){
        ctx.save()
        ctx.font= font;
        ctx.fillStyle = textFillStyle;
        if(obj.maxMessageSize<=0)return;
        for(var i=0;i<obj.lines.length;i++){
            var item = obj.lines[i];
            item.message = this.wordwrap(ctx,item.message,obj.maxMessageSize);
        } 
        ctx.restore()
    }
    sortParticipant(obj:any){
        var arr = [];
        var head = null;
        var tail = null;
        for(var j=0;j<obj.participant.length;j++){
           var item = obj.participant[j];
           if(item.name=="["){
               head = item;
           }else if(item.name=="]"){
               tail = item;
           }else{
               arr.push(item);
	   }
        }
        if(tail!=null){
           arr.push(tail)
        }
        if(head!=null){
           arr.unshift(head)
        }
        obj.participant=arr;
    }
    setBox(obj:any,inBox:boolean,val:any){
       if(inBox){
          var box = obj.box[obj.box.length-1];
          if( box.start==null){
              box.start = val 
           }
         box.end=val
       }
    }
     _getParByName(obj:SequenceObj,name:string){
        for(var i=0;i<obj.participant.length;i++){
            if(name== obj.participant[i].name){
                return obj.participant[i];
            }
        }
        return undefined;
    }
     _patchLine(line:Line,doc:any){
        var fromArr = doc[line.from];
        var toArr = doc[line.to];

        if(line.from==="" && line.to===""){
            return;
        }
        if(line.from===line.to){
            // self
            if(fromArr!== undefined && fromArr.length>0){
                line.x += fromArr.length * ACTIVE_WIDTH/2 
                line.toX += toArr.length* ACTIVE_WIDTH/2 
            }
        }
        if(line.x<line.toX){
            if(fromArr!== undefined && fromArr.length>0){
                line.x += fromArr.length * ACTIVE_WIDTH/2 
            }
            if(toArr!== undefined && toArr.length>0){
                line.toX = line.toX + (toArr.length-2) * ACTIVE_WIDTH/2
            }
        }else if(line.x>line.toX){
            if(fromArr!== undefined && fromArr.length>0){
                line.x += fromArr.length * ACTIVE_WIDTH/2 
            }
            if(toArr!== undefined && toArr.length>0){
                line.toX +=  ACTIVE_WIDTH/2
            }
        }
    }

    _calcActiveOne(line:Line,doc:any,j:number,obj:SequenceObj){
        var item = line.active[j];
        var arr = doc[item.participant];
        var par = this._getParByName(obj,item.participant);
        if(par===undefined){
            console.log("undefined" + item.participant)
            return;
        }
        var y = line.y;
        if(item.type=="activate"){
            if(arr === undefined || arr.length==0){
                arr = []
                arr.push({x:par.lineX,topY:y})
                doc[item.participant]=arr;
            }else{
                var lineX = arr[arr.length-1].x + ACTIVE_WIDTH/2
                arr.push({x:lineX,topY:y})
            }
            this._patchLine(line,doc)
        }else{
            this._patchLine(line,doc)

            var one = arr.pop();
            if(one === undefined){
                //error
                return;
            }
            one.bottomY = y;
            one.type = item.type;
            return one;
        }
    }
    _calcActiveLines(obj:SequenceObj){
        let doc = new Array();
        for(var i=0;i<obj.lines.length;i++){
            var line = obj.lines[i];
            if(line.active.length>0){
                for(var j=0;j<line.active.length;j++){
                    var one= this._calcActiveOne(line,doc,j,obj)
                    if(one !== undefined){
                        obj.activeLines.push(one);
                    }
                }
            }else{
                this._patchLine(line,doc)
            }
        }
        obj.activeLines.reverse();
    }
    
    _calcBoxXY(secObj:SequenceObj){
       if(secObj.box.length==0)
          return

       for(var i=0;i<secObj.box.length;i++){
           var item = secObj.box[i];
           item.x=0;
           for(var j=0;j<secObj.participant.length;j++){
               var p = secObj.participant[j];
               if(p.name==item.start){
                    item.x = p.x - pagePadding
                    break;
               }
           }
           var w = 0;
           for(var j=0;j<secObj.participant.length;j++){
                var p = secObj.participant[j];
                if(p.name==item.end){
                    w = p.x - item.x + p.width + pagePadding
                    break;
                }
            }
           
           item.y=secObj.titleHeight + secObj.headerHeight;
           item.width=w;
           item.height=secObj.height-secObj.titleHeight-secObj.headerHeight-secObj.footerHeight-pagePadding; 
       } 
    }


    drawUml(text:string){
        var ana = analysis(text);
        if(!this.keep){
            this.img.src="#";
            this.img.style.setProperty("display","none");
        }
        if(this.debug){
            console.log(ana)
        }
        if(ana instanceof Array){
            this.tokens = ana;
        }else{
            return ana;
        }
        var secObj = this._getObj(this.tokens);
        if(this.debug){
            console.log(secObj)
        }
        if(secObj.error !==undefined){
            console.log("error" + JSON.stringify(secObj.error))
            this.message.innerText = "Syntax error near \"" + secObj.error.value + "\" at line " + secObj.error.line
            this.message.style.setProperty("background-color","#fcf8e3");
            this.message.style.setProperty("padding","15px");
            this.message.style.setProperty("font-family","\"Helvetica Neue\",Helvetica,Arial,sans-serif");
            this.message.style.setProperty("font-size","14px");
            this.message.style.setProperty("line-height","1.42857143");
            this.message.style.setProperty("color","#333");
            this.message.style.setProperty("display","block");

            return ""; 
        }else{
            this.message.style.setProperty("display","none");
            this.message.innerHTML = "";
        }

        var ctx= this.context;
        ctx.lineWidth=1;
        
        this.handleMaxMessage(ctx,secObj);
        this._calcObjSize(ctx,secObj);
        this._calcParticipantSize(ctx,secObj.participant);
        this._calcLineSize(ctx,secObj);
        this._calcParticipantXY(secObj);
        this._calcLinesXY(secObj);
        this._calcActiveLines(secObj);
        this._calcBoxXY(secObj);

        this.canvas.width = secObj.width;
        this.canvas.height = secObj.height;

        ctx.translate(0.5,0.5);
        this._drawObj(ctx,secObj);
        if(secObj.tranlateX!=undefined){
            ctx.translate(secObj.tranlateX,0.5);
        }
        this._drawParticipant(ctx,secObj);
        this._drawGroupAlt(ctx,secObj);
        this._drawActive(ctx,secObj);
        this._drawLines(ctx,secObj);
        this.img.src=this.canvas.toDataURL();
        this.img.style.setProperty("display","block");

        return "";
    }
    render(text:string){
        this.drawUml(text);
        return this.el.innerHTML;
    }
    
}
