'use strict'

/**
 * NutUml version 0.2.1
 */

var NutUml;

(function(){
    var fontSize = 14;
    var font = fontSize + "px Arial";
    var linePadding =5;
    var paddingWidth = 10;
    var paddingHeight = 5;
    var pagePadding = 10;
    var lineHeight = fontSize + linePadding;
    var shadowColor = "#9A6A7A";
    var fillStyle = "#FEFECE";
    var fillStyleWhite = "#ffffff";
    var textFillStyle = "#333";
    var strokeStyle = "#A80036";
    var toSelfHeight = 13;
    const FILL_RED = "#ff0000";
    const GROUP_TEXT_SIZE = 12;
    const GROUP_PADDING = 8;

    const GROUP_TEXT_FONE = 'bold '+GROUP_TEXT_SIZE+ 'px Courier'

    const TITLE_SIZE = 28;
    var TITLE_FONT = TITLE_SIZE + "px Arial";

    const TYPE_RESERVED = 1;
    const TYPE_WORD = 2;
    const TYPE_MESSAGE = 3;
    const TYPE_OPERATOR = 4;
    const TYPE_SEPARATORS = 5;
    const TYPE_STRING = 6;
    const TYPE_SEPARATE_LINE = 7;
    const ALT_HEIGHT = 10;
    const END_HEIGHT = 10;
    const ACTOR_WIDTH = 34;

    const TAB_LEFT_PADDING = 13;
    const TAB_RIGHT_PADDING = 15;
    const TAB_MIN_TEXT_WIDTH = 40;
    const TAB_HEIGHT = 14;

    const LINE_SEQUENCE = 1;
    const LINE_SEPRATE = 2;
    const LINE_ALT = 3;
    const LINE_ELSE =4;
    const LINE_GROUP = 5;
    const LINE_END = 6;
    const GROUP_LINE_LEFT_PADDING = 30;
    const GROUP_GROUP_LEFT_PADDING = 10;
    const GROUP_LINE_RIGHT_PADDING = 20;
    const GROUP_GROUP_RIGHT_PADDING = 20;
    const NOTE_PADDING_TOP = 10;
    const NOTE_PADDING_LEFT = 10;
    const NOTE_PADDING_BOTTOM = 10;
    const NOTE_PADDING_RIGHT = 15;
    const NOTE_MARGIN = 10;


    const reservedWords = ['hide','autonumber','as', 'participant', 'actor', 'boundary', 
        'control', 'entity', 'database', 'collections','title','header','footer',
        'alt','else','opt','loop','par','break','critical','group','end','note',
        'left','right','of','over'];
    const participantWords = ['participant', 'actor', 'boundary', 'control', 'entity', 'database', 'collections'];
    const oneLineWords = ['title','header','footer','alt','else','opt','loop','par','break','critical','group'];
    const multiLineWords = ['title','note'];
    const groupWords = ['opt','loop','par','break','critical','group']
    const operators = ['-','>','<','->', '-->','<-','<--'];
    const fromOperators = ['->', '-->'];
    const dashOperators = ['<--', '-->'];

    const separators = [':'];
    const newLines = ['\r','\n'];

    function _groupRectangle(ctx,item){
        var frameY = item.cornerY + GROUP_PADDING;
        var frameHeight = item.height - GROUP_PADDING;

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
        var tabMeasure = _measureText(ctx,typeName,GROUP_TEXT_SIZE);
        var tabWidth = Math.max(tabMeasure.width,TAB_MIN_TEXT_WIDTH);
        tabWidth = tabWidth + TAB_LEFT_PADDING + TAB_RIGHT_PADDING;
        var tabHeight = item.height -5;
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
        if(item.message!=""){
            var msg =  "[" + item.message  + "]"
            _drawGroupText(ctx,item.x +tabWidth +paddingWidth,frameY-2,msg,true)
        }
        _drawGroupText(ctx,item.x +paddingWidth,frameY-2,typeName,true)

    }
    function _rectangle(ctx,item){
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

        _drawText(ctx,item.x+paddingWidth,item.y,item.title,true)
        
    }
    function _noteRectangle(ctx,item){
        ctx.save()
        ctx.beginPath()
        ctx.shadowBlur=3;
        ctx.shadowOffsetX=4;
        ctx.shadowOffsetY=4;
        ctx.shadowColor= shadowColor;
        var y = item.cornerY + NOTE_PADDING_TOP;
        var height = item.noteHeight - NOTE_PADDING_TOP - NOTE_PADDING_BOTTOM;
        ctx.fillStyle= fillStyle;
        ctx.fillRect(item.noteX, y, item.noteWidth, height);
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowBlur=1;

        ctx.fillRect(item.noteX, y, item.noteWidth, height);

        ctx.strokeStyle= strokeStyle;
        ctx.strokeRect(item.noteX, y , item.noteWidth, height);
        ctx.stroke();
        ctx.fill();
        ctx.restore();

        _drawText(ctx,item.noteX+NOTE_PADDING_LEFT,y,item.noteItem.message,false)
        
    }
    function _oneParticipantSize(ctx,item){
        var pw = paddingWidth;
        var ph = paddingHeight;
        var obj = _measureText(ctx,item.title);
        item.width = obj.width + pw*2;
        item.height = obj.height;
        if("actor"==item.type){
            item.width = obj.width;
            item.height += 54;
            if(item.width<ACTOR_WIDTH){
                item.width = ACTOR_WIDTH;
            }
        }
        
    }
    function _calcObjSize(ctx,obj){
        if(obj.title.length>0){
            var mObj = _measureText(ctx,obj.title,TITLE_SIZE);
            obj.titleHeight = mObj.height;
        }
        if(obj.header.length>0){
            var hObj = _measureText(ctx,obj.header);
            obj.headerHeight = hObj.height;
        }
        if(obj.footer.length>0){
            var fObj = _measureText(ctx,obj.footer);
            obj.footerHeight = fObj.height;
        }
    }
    function _calcParticipantSize(ctx,participant){
        ctx.font = font;
        var len = participant.length;
        for (var i = 0; i < len; i++) {
            var item = participant[i];
            _oneParticipantSize(ctx,item);
        }
    }
    function _calcLineSize(ctx,lines){
        ctx.font = font;
        var len = lines.length;
        var pw = paddingWidth;

        for (var i = 0; i < len; i++) {
            var item = lines[i];
            var obj = _measureText(ctx,item.message);
            item.width = obj.width + pw*2;
            if(item.type==LINE_ALT || item.type==LINE_GROUP){
                item.height = obj.height + linePadding;
            }else if(item.type == LINE_END){
                item.height = END_HEIGHT;
            }else{
                item.height = obj.height + linePadding;
            }
            if(item.from == item.to && item.type == LINE_SEQUENCE){
                item.height += toSelfHeight;
            }
            if(item.noteItem !=undefined){
                var noteObj = _measureText(ctx,item.noteItem.message);
                item.noteWidth = noteObj.width + NOTE_PADDING_LEFT + NOTE_PADDING_RIGHT;
                item.noteHeight = noteObj.height + NOTE_PADDING_TOP + NOTE_PADDING_BOTTOM;
                item.height = Math.max(item.height,item.noteHeight);
            }
        }
    }
    function _calcParticipantXY(obj){
        obj.innerHeight = 0;
        var len = obj.participant.length;
        var arr = [];
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
            console.log(t + "=" + arr[t])
            obj.innerHeight += item.height
        }
        console.log(arr);
        for(var i=0;i<len;i++){
            obj.maxParticipantHeight = Math.max(obj.participant[i].height,obj.maxParticipantHeight);
        }
        var picPadding = pagePadding + obj.titleHeight + obj.headerHeight;
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
            var span = minWidth;
            if(arr[val] !== undefined){
                span = Math.max(span,arr[val])
            }
            if(arr[val2] !== undefined){
                span = Math.max(span,arr[val2])
            }
            item.x = preItem.x + span;
            
            item.y = picPadding + obj.maxParticipantHeight - item.height;
            item.lineX = item.x + item.width/2;
            item.lineY = item.y + item.height;
        }
        obj.height = Math.ceil(obj.titleHeight + obj.footerHeight + obj.headerHeight 
            + lineHeight + obj.innerHeight + obj.maxParticipantHeight*2 + pagePadding*2);
        var lastWidth = obj.participant[len-1].width;
        var lastLineWidth = arr[obj.participant[len-1].name + "_" + obj.participant[len-1].name];
        if(lastLineWidth && lastLineWidth>lastWidth/2){
            lastWidth = lastWidth/2 + lastLineWidth;
        }
        obj.width = Math.ceil(obj.participant[len-1].x + lastWidth + pagePadding) ; 
    }
    function _calcLinesXY(obj){
        var hisArr = [];
        var curY = pagePadding + obj.headerHeight + obj.titleHeight + obj.maxParticipantHeight;
        var curGroupItem, lastGroupItem;
        var minX = 0;
        var maxX = 0;
        for(var j=0;j<obj.lines.length;j++){
            var item = obj.lines[j];
            item.cornerY = curY;
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
                if(curGroupItem.x==undefined){
                    curGroupItem.x = item.x - GROUP_LINE_LEFT_PADDING
                }else{
                    curGroupItem.x = Math.min(item.x - GROUP_LINE_LEFT_PADDING,curGroupItem.x)
                }
                if(curGroupItem.toX == undefined){
                    curGroupItem.toX = item.toX + GROUP_LINE_RIGHT_PADDING
                }else{
                    curGroupItem.toX = Math.max(item.toX + GROUP_LINE_RIGHT_PADDING,curGroupItem.toX)
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
    function _copyObj(obj){
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }
    function _dashedLine(ctx, x, y, toX, toY){
        ctx.save()
        ctx.beginPath()
        ctx.setLineDash([5,5])
        ctx.moveTo(x,y)
        ctx.lineTo(toX,toY)
        ctx.stroke()
        ctx.fill()
        ctx.restore()
    }
    function _realLine(ctx, x, y, toX, toY){
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(x,y)
        ctx.lineTo(toX,toY)
        ctx.stroke()
        ctx.fill()
        ctx.restore()
    }
    function _drawOneParticipant(ctx,item){
        if(item.type=="actor"){
            _drawActor(ctx,item);
        }else{
            _rectangle(ctx,item);
        }
    }
    function _drawObj(ctx,obj){
        if(obj.titleHeight>0){
            ctx.font = TITLE_FONT;
            var mObj = _measureText(ctx,obj.title,TITLE_SIZE);
            var titleX = (obj.width-mObj.width)/2;
            _drawTitleText(ctx,titleX, pagePadding+obj.headerHeight,obj.title,false);
        }
        if(obj.headerHeight>0){
            ctx.font = font;
            var hObj = _measureText(ctx,obj.header);

            var headerX = obj.width - pagePadding - hObj.width;
            _drawText(ctx,headerX, pagePadding,obj.header,false);
            debugger;
        }
        if(obj.footerHeight>0){
            ctx.font = font;
            var fObj = _measureText(ctx,obj.footer);
            var footerX = obj.width - pagePadding - fObj.width;
            _drawText(ctx,footerX, obj.height-obj.footerHeight,obj.footer,false);
        }
    }
    function _drawParticipant(ctx,obj){
        var len = obj.participant.length;
        for(var i=0;i<len;i++){
            var item = obj.participant[i];
            _drawOneParticipant(ctx,item);
            var bottom = _copyObj(item);
            bottom.y = item.y + obj.innerHeight + lineHeight + item.height;
            if(!obj.hideFootbox){
                _drawOneParticipant(ctx,bottom);
            }
            _dashedLine(ctx,item.lineX,item.lineY,item.lineX,bottom.y);
        }
    }
    function _drawLines(ctx,obj){
        var len = obj.lines.length;
        for(var i=0;i<len;i++){
            var item = obj.lines[i];
            if(item.type==LINE_SEQUENCE){
                _line(ctx,item,obj);
            }else if(item.type==LINE_SEPRATE){
                _separateLine(ctx,item,obj)
            }else if(item.type == LINE_ELSE){
                _elseLine(ctx,item,obj)
            }
        }
    }
    function _drawGroupAlt(ctx,obj){
        var len = obj.lines.length;
        for(var i=0;i<len;i++){
            var item = obj.lines[i];
            if(item.type==LINE_ALT || item.type == LINE_GROUP){
                _groupRectangle(ctx,item)
            }
        }
    }
    function _separateLine(ctx,item,obj){
        ctx.save(); 
        ctx.beginPath(); 
        var midY = item.y -item.height /2 + paddingHeight;
        var boxX = obj.width/2 - item.width/2;
        var textObj = _measureText(ctx,item.message);
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

        _drawText(ctx,boxX+paddingWidth,boxY-2, item.message);

    }
    function _drawToSelf(ctx,x,y){
        ctx.save(); 
        ctx.beginPath(); 
        ctx.moveTo(x, y); 
        ctx.lineTo(x + 40, y); 
        ctx.lineTo(x+40, y+13); 
        
        ctx.lineTo(x, y+13); 
        ctx.stroke(); 
        ctx.restore(); 
        _drawArrow(ctx,x,y+13,true);

    }
    function _elseLine(ctx,item,obj){
        var message = "["+ item.message + "]";
        var textObj = _measureText(ctx,item.message);
        _drawGroupText(ctx,Math.min(item.refItem.x,item.refItem.toX) + 10,item.y-textObj.height, message);
        var lineY = item.cornerY + 7
        _dashedLine(ctx,item.refItem.x, lineY, item.refItem.toX, lineY);
    }
    function _line(ctx,item,obj){
     /*   
        ctx.save(); 
        ctx.fillStyle = FILL_RED;
        ctx.fillRect(Math.min(item.x,item.toX), item.cornerY, item.width, item.height);
        ctx.restore();
    */
        if(item.noteItem != undefined){
            _noteRectangle(ctx,item)
        }
        var message = item.message;
        if(obj.autonumber){
            message = item.number + " " + message;
        }
        var textObj = _measureText(ctx,item.message);
        if(item.from==item.to){
            _drawText(ctx,Math.min(item.x,item.toX) + 10,item.cornerY+paddingHeight, message);
            _drawToSelf(ctx,item.x,item.y-toSelfHeight)
            return;
        }else{
            _drawText(ctx,Math.min(item.x,item.toX) + 10,item.y-textObj.height, message);
        }
        if(dashOperators.includes(item.operator)){
            _dashedLine(ctx,item.x, item.y, item.toX, item.toY);
        }else{
            _realLine(ctx,item.x, item.y, item.toX, item.toY);
        }
        _drawArrow(ctx,item.toX,item.toY,item.x>item.toX);
    }
    function _drawArrow(ctx, x,y,reverse) { 
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
    function _drawActor(ctx,item){
        var x = item.x;
        var y = item.y;
        if(item.width>ACTOR_WIDTH){
            x = item.x + (item.width-ACTOR_WIDTH)/2;
        }
        ctx.save()
        ctx.beginPath();
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
        if(textWidth<ACTOR_WIDTH){
            x+= (ACTOR_WIDTH-textWidth)/2;
        }
        ctx.fillText(item.title,x,fontSize+54+item.y+paddingHeight-1);
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }
    function _measureText(ctx,title,fontHeight){
        fontHeight = fontHeight || fontSize;
        var obj = { width: 0, height: 0};
        var arr = title.split("\n");
        arr.forEach(function(item){
            obj.width = Math.max(obj.width,ctx.measureText(item).width)
        })
        obj.height = arr.length * (fontHeight+paddingHeight) + paddingHeight;
        return obj;
    }
    function _drawGroupText(ctx,x,y,title,center){
        ctx.save()
        ctx.font= GROUP_TEXT_FONE
        ctx.fillStyle = textFillStyle;
        _onlyDrawText(ctx, x, y,title, fontSize,center);
        ctx.fill()
        ctx.restore()
    }
    function _drawText(ctx,x,y,title,center){
        ctx.save()
        ctx.font= font;
        ctx.fillStyle = textFillStyle;
        _onlyDrawText(ctx, x, y,title, fontSize,center);
        ctx.fill()
        ctx.restore()
    }
    function _drawTitleText(ctx,x,y,title){
        ctx.save()
        ctx.font= TITLE_FONT;
        ctx.fillStyle = textFillStyle;
        _onlyDrawText(ctx, x, y,title, fontSize);
        ctx.fill()
        ctx.restore()
    }
    function _onlyDrawText(ctx, x, y,title, size,center) {
        var fSize = size || fontSize;
        var arr = title.split("\n");
        var obj = null;
        if (center) {
            obj = _measureText(ctx, title);
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
    function _getLineItem(lineType,message,typeName){
        return {
            from:"",
            to: "",
            message: message,
            operator: "",
            number:0,
            type: lineType,
            typeName: typeName
        }
    }
    function _getObj(tokens){
        var obj = {
            participant : [],
            lines : [],
            innerHeight:0,
            width:0,
            height:0,
            title: '', 
            header: '',
            footer: '',
            headerHeight: 0,
            titleHeight: 0,
            footerHeight: 0,
            autonumber:false,
            hideFootbox:false
        };
        var len = tokens.length;
        var cur =0;
        var participantArr = [];
        var number = 1;
        while(cur<len){
            var item = tokens[cur++];
            if(item.type==TYPE_RESERVED){
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
                    obj.lines.push(_getLineItem(LINE_ALT,message,item.value));
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
                    obj.lines.push(_getLineItem(LINE_ELSE,message,item.value));
                    continue
                }
                if("end"==item.value){
                    obj.lines.push(_getLineItem(LINE_END,"",item.value));
                    continue
                }
                if(groupWords.includes(item.value)){
                    var message = "";
                    if(cur<len){
                        var nextItem = tokens[cur];
                        if(nextItem.type==TYPE_MESSAGE){
                            message = nextItem.value;
                            cur++;
                        }
                    }
                    obj.lines.push(_getLineItem(LINE_GROUP,message,item.value));
                    continue
                }
                if(participantWords.includes(item.value)){
                    var opItem = tokens[cur++];
                    if(opItem.type == TYPE_WORD){
                        obj.participant.push({ 
                            name:opItem.value, 
                            title:opItem.value, 
                            type:item.value 
                        });
                        participantArr.push(opItem.value);
                    }
                }
            }
            if(item.type==TYPE_WORD || item.type==TYPE_STRING|| item.type==TYPE_SEPARATE_LINE){
                var lineItem = {
                    from:"",
                    to: "",
                    message: "",
                    operator: "",
                    number:0,
                    type:LINE_SEQUENCE
                }
                if(item.type==TYPE_SEPARATE_LINE){
                    lineItem.type = LINE_SEPRATE
                    lineItem.message = item.value;
                    obj.lines.push(lineItem);
                    continue
                }
                
                if(!participantArr.includes(item.value)){
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
                if(!participantArr.includes(toParticipant.name)){
                    obj.participant.push(toParticipant);
                    participantArr.push(toParticipant.name);
                }
                if(fromOperators.includes(opItem.value)){
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
        return obj;
    }
    
    NutUml = function (el) {
        this.el = el;
        el.innerHTML="";
        var canvas = document.createElement("canvas");
        this.context = canvas.getContext("2d");
        var img = document.createElement("img");
        el.appendChild(img);
        this.img = img;
        this.canvas = canvas;
        this.tokens = [];
    };
    

    NutUml.prototype.drawUml = function(text){
        var ana = this.analysis(text);
        console.log(ana)
        if(ana instanceof Array){
            this.tokens = ana;
        }else{
            return ana;
        }
        var secObj = _getObj(this.tokens);
        console.log(secObj)
        var ctx= this.context;
        ctx.lineWidth=1;
        

        _calcObjSize(ctx,secObj);
        _calcParticipantSize(ctx,secObj.participant);
        _calcLineSize(ctx,secObj.lines);
        _calcParticipantXY(secObj);
        _calcLinesXY(secObj);

        this.canvas.width = secObj.width;
        this.canvas.height = secObj.height;

        ctx.translate(0.5,0.5);
        _drawObj(ctx,secObj);
        if(secObj.tranlateX!=undefined){
            ctx.translate(secObj.tranlateX,0.5);
        }
        _drawParticipant(ctx,secObj);
        _drawGroupAlt(ctx,secObj);
        _drawLines(ctx,secObj);
        this.img.src=this.canvas.toDataURL();
        return "";
    };
    function isWordChar(c){
        var result = /[a-z0-9]/i.test(c);
        if(result){
            return result;
        }
        return c.charCodeAt(0)>255;
    }
    NutUml.prototype.analysis = function(str) {
        /**
         * current用于标识当前字符位置,
         * str[cur]即为当前字符
         */
        let cur = 0;
        /**
         * tokens存储词法分析的最终结果
         */
        let tokens = [];
        var multiLineFlag = false;
        var multiLine = false;
        while(cur < str.length) {
            if(newLines.includes(str[cur]) && multiLineFlag ==true){
                multiLine = true
                multiLineFlag = false
                cur++
            }
            if(multiLine){
                // handle multiline message until of 'end' at begin of line
                var message = "";
                var lineStart = true;
                while(cur < str.length){
                    if(lineStart){
                        if(isWordChar(str[cur])) { // 读单词
                            let word = "" + str[cur++];
                            // 测试下一位字符,如果不是字母直接进入下一次循环(此时cur已经右移)
                            // 如果是则继续读字母,并将cur向右移动
                            while(cur < str.length && isWordChar(str[cur])) {
                                // cur < str.length防止越界
                                word += str[cur++];
                            }
                            if("end"==word){
                                multiLine = false;
                                tokens.push({
                                    type: TYPE_MESSAGE,
                                    value: message,
                                });
                                tokens.push({
                                    type: TYPE_RESERVED,
                                    value: word,
                                });
                                break;
                            }else{
                                message += word
                                lineStart = false;
                            }
                        }else{
                            message += str[cur++]
                        }
                    }else{
                        if(newLines.includes(str[cur])){
                            lineStart = true;
                        }
                        message += str[cur++]
                    }
                }
                multiLine =  false
            }
            if(/\s/.test(str[cur])) { // 跳过空格
                cur++;
            } else if(isWordChar(str[cur])) { // 读单词
                
                let word = "" + str[cur++];
                // 测试下一位字符,如果不是字母直接进入下一次循环(此时cur已经右移)
                // 如果是则继续读字母,并将cur向右移动
                while(cur < str.length && isWordChar(str[cur])) {
                    // cur < str.length防止越界
                    word += str[cur++];
                }
                if(reservedWords.includes(word)) {
                    tokens.push({
                        type: TYPE_RESERVED,
                        value: word,
                    }); // 存储保留字(关键字)
                    if(multiLineWords.includes(word)){
                        multiLineFlag = true;
                    }
                    if(oneLineWords.includes(word)){
                        while(cur<str.length && /\s/.test(str[cur]) && !newLines.includes(str[cur])){
                            cur++;
                        }
                        var tempWord = "";
                        while(cur < str.length && !newLines.includes(str[cur])) {
                            tempWord += str[cur++];
                            multiLineFlag = false;
                        }
                        tokens.push({
                            type: TYPE_MESSAGE,
                            value: tempWord,
                        })
                    }
                } else {
                    tokens.push({
                        type: TYPE_WORD,
                        value: word,
                    }); // 存储普通单词                            
                }
            } else if(separators.includes(str[cur])) {
                multiLineFlag = false
                tokens.push({
                    type: TYPE_SEPARATORS,
                    value: str[cur++],
                }); // 存储分隔符并将cur向右移动
                
                let word = "";
                while(cur < str.length && " " == str[cur]){ 
                    cur++;
                }

                // 测试下一位字符,如果是换行进入下一次循环
                // 如果不是则继续读字符,并将cur向右移动
                while(cur < str.length && !newLines.includes(str[cur])) {
                    word += str[cur++];
                }
                word = word.replace(/\\n/g,"\n")
                tokens.push({
                    type: TYPE_MESSAGE,
                    value: word,
                }); 
            } else if(operators.includes(str[cur])) {
                let operator = "" + str[cur++];
                while(cur < str.length && operators.includes(str[cur])) {
                    operator += str[cur++];
                }
                tokens.push({
                    type: TYPE_OPERATOR,
                    value: operator,
                }); // 存储运算符                        
            } else if('"'==str[cur]){
                let operator = "";
                cur++;
                while(cur < str.length) {
                    var c = str[cur++];
                    if('"'==c)break;
                    operator += c;
                }
                operator = operator.replace("\\n","\n")
                tokens.push({
                    type: TYPE_STRING,
                    value: operator,
                });
            } else if('='==str[cur]){
                cur++;
                if('='==str[cur]){
                    var message = "";
                    cur++
                    while(cur < str.length) {
                        var c = str[cur++];
                        if('='==c && cur<str.length && str[cur]=='='){
                            cur++;
                            break;
                        }
                        message += c;
                    }
                    tokens.push({
                        type: TYPE_SEPARATE_LINE,
                        value: message,
                    });
                }else{
                    return "syntax error"
                }
            }else {
                return "包含非法字符：" + str[cur];
            }

        }
        this.tokens = tokens;
        return tokens;
    };

})()

export default NutUml;
