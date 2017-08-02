/*
html5行情图库
author:yukaizhao
blog:http://www.cnblogs.com/yukaizhao/
商业或公开发布请联系：yukaizhao@gmail.com
*/
/*
canvasId:canvasId
paintImplement: 负责告诉painter该如何画图
{
getX:function(i){},
getY:function(i){},
start:function(){},
paintItem:function(x,y,i){},
end:function(){},
}
data: 画图要表现的数据
*/
var dashSize = 2;

function Painter(canvasId, paintImplement, data) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas.getContext) return;
    this.ctx = this.canvas.getContext('2d');
    this.data = data;
    this.paintImplement = paintImplement;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
}
Painter.prototype = {
    paint: function (minsChartOptions) {
        var pctx = this.paintImplement;
        var data = this.data;
        var ctx = this.ctx;
        if (typeof pctx.initialize == 'function') pctx.initialize(this);
        if (pctx.start) pctx.start.call(this);

        if (typeof pctx.paintItems == 'function') {
            pctx.paintItems.call(this);  // 图表
        }
        else {
            // 边, 文字部分
            var dataLength = ((typeof pctx.getDataLength == 'function') ? pctx.getDataLength.call(this) : this.data.length);
            var start = {x: 0, y: 0};
            var end = {x: 0, y: 0};
            if(minsChartOptions){
                end.y = minsChartOptions.region.height;
            }
            for (var i = 0; i < dataLength; i++) {
                var x = pctx.getX ? pctx.getX.call(this, i) : undefined;
                var y = pctx.getY ? pctx.getY.call(this, i) : undefined;
                // 记录第一个点和最后一个点的颜色
                if( i == 0 ){start.x = x;}
                if( i == dataLength-1 ){ end.x = x;}
                pctx.paintItem.call(this, i, x, y, true);
            }
            if(pctx.paintItemForBg && pctx.paintItemForBg.call ){
                pctx.paintItemForBg.call(this, start, end, true);
            }
            // pctx.end.call(this);
            /*for (var i = 0; i < dataLength; i++) {
                var x = pctx.getX ? pctx.getX.call(this, i) : undefined;
                var y = pctx.getY ? pctx.getY.call(this, i) : undefined;
                // 顺便画上背景颜色
                pctx.paintItemForBg.call(this, i, x, y, true);
            }*/
            // console.trace();
        }
        if (pctx.end) {
            pctx.end.call(this);
        }
    },
    drawHLine: function (color, x0, y0, w, lineWidth, lineStyle) {
        var ctx = this.ctx;
        ctx.strokeStyle = color;
        if (y0 * 10 % 10 == 0) y0 += .5;
        if (lineStyle && lineStyle == 'dashed') {
            var width = 0;
            do {
                this.drawHLine(color, width, y0, dashSize, 1, 'solid');
                width += dashSize * 2;
            } while (width < w);
        }
        else {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + w, y0);
            ctx.stroke();
        }
    },
    drawVLine: function (color, x0, y0, h, lineWidth, lineStyle) {
        var ctx = this.ctx;
        ctx.strokeStyle = color;
        if (x0 * 10 % 10 == 0) x0 += .5;
        if (lineStyle && lineStyle == 'dashed') {
            var height = 0;
            do {
                this.drawVLine(color, x0, height, dashSize, 1);
                height += dashSize * 2;
            } while (height < h);
        }
        else {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0, y0 + h);
            ctx.stroke();
        }
    },
    setData: function (data) {
        this.data = data;
    },
    setPainterImplement: function (implement) {
        this.paintImplement = implement;
    }
};
