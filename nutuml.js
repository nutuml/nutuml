var NutUml;

(function(){
    var fontSize = 14;
    var font = fontSize + "px Arial";
    var linePadding =15;
    var paddingWidth = 10;
    var paddingHeight = 5;
    var pagePadding = 10;
    var lineHeight = fontSize + linePadding;

    
    function _dashedLine(context,startX,startY,toX, toY, dashLength){
        dashLength = dashLength === 0 || dashLength === undefined ?
            dashLength = 5 : dashLength = dashLength;
        
        //线段数量
        var dashNum = Math.ceil(Math.sqrt(Math.pow(startX-toX, 2)+Math.pow(startY-toY, 2))/ dashLength);
        for(var i = 0; i <= dashNum; i++) {
            var xTo = startX + i*(toX-startX)/dashNum;
            var yTo = startY + i*(toY-startY)/dashNum;
            if(xTo>toX){
                xTo = toX;
            }
            if(yTo>toY){
                yTo = toY;
            }
            if(i==dashNum){
                context["lineTo"](xTo, yTo);
            }else{
                context[i%2 === 0 ? "moveTo" : "lineTo"](xTo, yTo);
            }
        }
        context.stroke();
    }
        
    /**
    * 
    * @param {Object} ctx    canvas对象
    * @param {Object} fromX  起点x
    * @param {Object} fromY  起点y
    * @param {Object} toX    终点x
    * @param {Object} toY    终点y
    * @param {Object} theta  箭头夹角
    * @param {Object} headlen 斜边长度
    * @param {Object} width 箭头宽度
    * @param {Object} color 颜色
    */
    function drawArrow(ctx, fromX, fromY, toX, toY,theta,headlen,width,color) { 
        theta = typeof(theta) != 'undefined' ? theta : 30; 
        headlen = typeof(theta) != 'undefined' ? headlen : 10; 
        width = typeof(width) != 'undefined' ? width : 1;
        color = typeof(color) != 'color' ? color : '#000'; 
        // 计算各角度和对应的P2,P3坐标 
        var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI, 
            angle1 = (angle + theta) * Math.PI / 180, 
            angle2 = (angle - theta) * Math.PI / 180, 
            topX = headlen * Math.cos(angle1), 
            topY = headlen * Math.sin(angle1), 
            botX = headlen * Math.cos(angle2), 
            botY = headlen * Math.sin(angle2); 
        ctx.save(); 
        ctx.beginPath(); 
        var arrowX = fromX - topX, arrowY = fromY - topY;
        ctx.moveTo(arrowX, arrowY); 
        ctx.moveTo(fromX, fromY); 
        ctx.lineTo(toX, toY); 
        arrowX = toX + topX; 
        arrowY = toY + topY; 
        ctx.moveTo(arrowX, arrowY); 
        ctx.lineTo(toX, toY); 
        arrowX = toX + botX; 
        arrowY = toY + botY; 
        ctx.lineTo(arrowX, arrowY); 
        ctx.strokeStyle = color; 
        ctx.lineWidth = width; 
        ctx.stroke(); 
        ctx.restore(); 
    }
    function _rectangle(ctx,item){
        ctx.font= font;
        ctx.strokeRect(item.x, item.y, item.width, item.height);
        ctx.fillText(item.title,item.x+paddingWidth,fontSize+item.y+paddingHeight);
        ctx.stroke();
        ctx.fill();
    }
    function _calcHeaderSize(context,header){
        var len = header.length;
        var pw = paddingWidth;
        var ph = paddingHeight;

        for (i = 0; i < len; i++) {
            var item = header[i];
            item.width = context.measureText(item.title).width + pw*2;
            item.height = fontSize + ph*2;
        }
    }
    function _calcLineSize(context,lines){
        var len = lines.length;
        var pw = paddingWidth;

        for (i = 0; i < len; i++) {
            var item = lines[i];
            item.width = context.measureText(item.message).width + pw*2;
            item.height = fontSize + linePadding;
        }
    }
    function _calcHeaderXY(obj){
        obj.innerHeight = obj.lines.length * lineHeight;
        var len = obj.header.length;
        var arr = [];
        var minWidth = 100;
        for(var j=0;j<obj.lines.length;j++){
            var item = obj.lines[j];
            var t = item.from + "_" + item.to;
            if(arr[t] === undefined || arr[t]<item.width){
                arr[t] = item.width;
            }
            if(arr[t]<minWidth){
                arr[t]=minWidth;
            }
        }
        for(var i=1;i<len;i++){
            var item = obj.header[i];
            var preItem = obj.header[i-1];
            if(i==1){
                preItem.x = pagePadding;
                preItem.y = pagePadding;
                preItem.lineX = preItem.x + preItem.width/2;
                preItem.lineY = preItem.y + preItem.height;
            }
            item.x = preItem.x + arr[preItem.name + "_" + item.name];
            item.y = pagePadding;
            item.lineX = item.x + item.width/2;
            item.lineY = item.y + item.height;
        }
    }
    function _calcLinesXY(obj){
        var curY = pagePadding + obj.header[0].height;
        for(var j=0;j<obj.lines.length;j++){
            curY +=lineHeight;
            var item = obj.lines[j];
            var fromHeader, toHeader;
            for(var k=0;k<obj.header.length;k++){
                if(obj.header[k].name == item.from){
                    fromHeader = obj.header[k];
                }
                if(obj.header[k].name == item.to){
                    toHeader = obj.header[k];
                }
            }
            item.x = fromHeader.lineX;
            item.y = curY;
            item.toX = toHeader.lineX;
            item.toY = curY;
        }

    }
    function _copyObj(obj){
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }
    function _drawHeader(ctx,obj){
        var len = obj.header.length;
        for(var i=0;i<len;i++){
            var item = obj.header[i];
            _rectangle(ctx,item);
            var bottom = _copyObj(item);
            bottom.y = item.y + obj.innerHeight + lineHeight + item.height;
            _rectangle(ctx,bottom);
            _dashedLine(ctx,item.lineX,item.lineY,item.lineX,bottom.y);
        }
    }
    function _drawLines(ctx,obj){
        var len = obj.lines.length;
        for(var i=0;i<len;i++){
            var item = obj.lines[i];
            _line(ctx,item);
        }
    }
    function _line(ctx,item){
        ctx.fillText(item.message,item.x,item.y);

        ctx.moveTo(item.x,item.y);
        ctx.lineTo(item.toX,item.toY);
        ctx.stroke();
        ctx.fill();
        _drawArrow(ctx,item.toX,item.toY,item.x>item.toX);
    }
    function _drawArrow(ctx, x,y,reverse) { 
        var xDelta =-10;
        var xDelta2 =-6;
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
    NutUml = function (el) {
        this.context = el.getContext("2d");
    };

    NutUml.prototype.drawUml = function(){
        var ctx= this.context;
        var secObj = {
            header : [
                {name:"Tom", title:"Tom", width:0, height:0,x:0,y:0},
                {name:"Bob", title:"Bob", width:0, height:0,x:0,y:0}
            ],
            lines : [
                {from:"Tom", to: "Bob", message: "Hello"},
                {from:"Bob", to: "Tom", message: "Hi"}
            ],
            innerHeight:0
        };

        ctx.lineWidth=1;
        ctx.translate(0.5,0.5);

        _calcHeaderSize(ctx,secObj.header);
        _calcLineSize(ctx,secObj.lines);
        _calcHeaderXY(secObj);
        _calcLinesXY(secObj);
        _drawHeader(ctx,secObj);
        _drawLines(ctx,secObj);

        

        // _rectangle(ctx,10,100,"Tom");
        // console.log(ctx.lineWidth);
        

        // _dashedLine(ctx,33,34,33,100)
        // _dashedLine(ctx,123,34,123,100)

        // ctx.fillText("Hello",59,66);

         ctx.moveTo(100,200);
         ctx.lineTo(200,200);
         ctx.stroke();
         _drawArrow(ctx,200,200);
        // ctx.stroke();
        // ctx.fill();

        // drawArrow(ctx, 33,50, 122, 50,30,10,2,'black')

        // _rectangle(ctx,100,10,"Bob");
        // _rectangle(ctx,100,100,"Bob");

       
    };

})()


