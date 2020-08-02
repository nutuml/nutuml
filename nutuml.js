/**
 * NutUml version 0.1 
 */

var NutUml;

(function(){
    var fontSize = 14;
    var font = fontSize + "px Arial";
    var linePadding =15;
    var paddingWidth = 10;
    var paddingHeight = 5;
    var pagePadding = 10;
    var lineHeight = fontSize + linePadding;
    var shadowColor = "#9A6A7A";
    var fillStyle = "#FEFECE";
    var textFillStyle = "#333";
    var strokeStyle = "#A80036";

    const TYPE_RESERVED = 1;
    const TYPE_WORD = 2;
    const TYPE_MESSAGE = 3;
    const TYPE_OPERATOR = 4;
    const TYPE_SEPARATORS = 5;

    const reservedWords = ['if', 'int', 'for', 'while', 'do', 'return', 'break', 'continue'];
    const operators = ['-','>','<','->', '-->','<-','<--'];
    const fromOperators = ['->', '-->'];
    const dashOperators = ['<--', '-->'];

    const separators = [':'];
    const newLines = ['\r','\n'];

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

        ctx.save();
        ctx.font= font;
        ctx.fillStyle = textFillStyle;
        ctx.fillText(item.title,item.x+paddingWidth,fontSize+item.y+paddingHeight-1);
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }
    function _calcHeaderSize(context,header){
        context.font = font;
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
        context.font = font;
        var len = lines.length;
        var pw = paddingWidth;

        for (i = 0; i < len; i++) {
            var item = lines[i];
            item.width = context.measureText(item.message).width + pw*2;
            item.height = fontSize + linePadding;
        }
    }
    function _calcHeaderXY(obj){
        obj.innerHeight = 0;
        var len = obj.header.length;
        var arr = [];
        var minWidth = 100;
        var maxHeight = 0;
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
        for(var i=0;i<len;i++){
            maxHeight = Math.max(obj.header[i].height,maxHeight);
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
            var val = preItem.name + "_" + item.name;
            var val2 = item.name + "_" + preItem.name;
            var span = minWidth;
            if(arr.includes(val)){
                span = Math.max(span,arr[val])
            }
            if(arr.includes(val2)){
                span = Math.max(span,arr[val2])
            }
            item.x = preItem.x + span;
            
            item.y = pagePadding;
            item.lineX = item.x + item.width/2;
            item.lineY = item.y + item.height;
        }
        obj.height = Math.ceil(lineHeight + obj.innerHeight + maxHeight*2 + pagePadding*2);
        obj.width = Math.ceil(obj.header[len-1].x + obj.header[len-1].width + pagePadding) ; 
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
        ctx.save()
        ctx.beginPath()
        ctx.font= font;
        ctx.fillText(item.message,Math.min(item.x,item.toX) + 10,item.y-5);
        ctx.fill();
        ctx.restore()

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
    function _getObj(tokens){
        var obj = {
            header : [],
            lines : [],
            innerHeight:0
        };
        var len = tokens.length;
        var cur =0;
        var headerArr = [];
        while(cur<len){
            var item = tokens[cur++];
            if(item.type==TYPE_WORD){
                var lineItem = {
                    from:"",
                    to: "",
                    message: "",
                    operator: ""
                }
                
                if(!headerArr.includes(item.value)){
                    obj.header.push({name:item.value,title:item.value});
                    headerArr.push(item.value);
                }
                var opItem = tokens[cur++];
                lineItem.operator = opItem.value;

                var toItem = tokens[cur++];
                if(!headerArr.includes(toItem.value)){
                    obj.header.push({name:toItem.value,title:toItem.value});
                    headerArr.push(toItem.value);
                }
                if(fromOperators.includes(opItem.value)){
                    lineItem.from = item.value;
                    lineItem.to = toItem.value;
                }else{
                    lineItem.from = toItem.value;
                    lineItem.to = item.value;
                }
                var sepItem = tokens[cur++];
                if(sepItem.type==TYPE_SEPARATORS){
                    var messageItem = tokens[cur];
                    if(messageItem.type == TYPE_MESSAGE){
                        lineItem.message = messageItem.value
                    }
                }
                obj.lines.push(lineItem);
            }
        }
        return obj;
    }
    NutUml = function (el) {
        this.el = el;
        this.context = el.getContext("2d");
        this.tokens = [];
    };
    

    NutUml.prototype.drawUml = function(text){
        var secObj = {
            header : [],
            lines : [],
            innerHeight:0,
            width:0,
            height:0
        };
        var ana = this.analysis(text);
        
        if(ana instanceof Array){
            this.tokens = ana;
        }else{
            return ana;
        }
        secObj = _getObj(this.tokens);
        console.log(secObj)
        var ctx= this.context;
        ctx.lineWidth=1;
        ctx.translate(0.5,0.5);

        _calcHeaderSize(ctx,secObj.header);
        _calcLineSize(ctx,secObj.lines);
        _calcHeaderXY(secObj);
        _calcLinesXY(secObj);

        this.el.width = secObj.width;
        this.el.height = secObj.height;

        _drawHeader(ctx,secObj);
        _drawLines(ctx,secObj);

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
        

        while(cur < str.length) {

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
                } else {
                    tokens.push({
                        type: TYPE_WORD,
                        value: word,
                    }); // 存储普通单词                            
                }
            } else if(separators.includes(str[cur])) {
                tokens.push({
                    type: TYPE_SEPARATORS,
                    value: str[cur++],
                }); // 存储分隔符并将cur向右移动
                
                let word = "";
                // 测试下一位字符,如果是换行进入下一次循环
                // 如果不是则继续读字符,并将cur向右移动
                while(cur < str.length && !newLines.includes(str[cur])) {
                    word += str[cur++];
                }
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
            } else {
                return "包含非法字符：" + str[cur];
            }

        }
        this.tokens = tokens;
        return tokens;
    };

})()


