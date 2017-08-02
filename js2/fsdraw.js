
/*
 html5行情图库
 author:yukaizhao
 blog:http://www.cnblogs.com/yukaizhao/ http://weibo.com/yukaizhao/
 参与项目或技术交流：yukaizhao@gmail.com
 */
function line(ctx, x0, y0, x1, y1, color, width) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1;
    ctx.stroke();
}

function getMinTime(minIndex) {
    //上午09：30-11：30
    //下午13：00-15：00
    var d = new Date();
    if (minIndex <= 120) {
        d.setHours(9, 30, 30);
        d = new Date(d.getTime() + (minIndex) * 60 * 1000);
    } else {
        d.setHours(13, 0, 0);
        d = new Date(d.getTime() + (minIndex - 120) * 60 * 1000);
    }


    var hour = d.getHours() > 9 ? new String(d.getHours()) : '0' + d.getHours();
    var minutes = d.getMinutes() > 9 ? new String(d.getMinutes()) : '0' + d.getMinutes();
    var seconds = '30';
    return hour + '' + minutes + seconds;
}

function _Tip(options) {
    this.options = options;
    this.canvas = options.canvas;
    this.canvas.tip = this;
}

_Tip.prototype = {
    show: function (relativePoint, html) {
        var dc = this.dataContext;
        var painter = this.canvas.painter;
        if (dc) {
            if (dc.isNewQuote) painter.fillTopText(dc.data);
            else painter.fillTopText(dc.data, dc.index);
        }
    },
    update: function (relativePoint, html) {
        this.show(relativePoint, html);
    },
    hide: function () {
        var dc = this.dataContext;
        var painter = this.canvas.painter;
        if (dc) {
            painter.fillTopText(dc.data);
        }
    }
};

function minsChart(canvasId, options) {
    extendObject(options, this);
    this.canvas = $id(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.painter = this;
    this.options = options;
    this.initWidth(options);
}

minsChart.prototype = {
    /*
     data format like :{
     quote: {
     time: 20111214150106,
     open: 2241.390,
     preClose: 2248.590,
     highest: 2256.740,
     lowest: 2224.730,
     price: 2228.530,
     volume: 4407982200,
     amount: 38621178573
     },
     mins: [
     {price:2239.45,volume:49499299,amount:459279327}
     ]
     }
     */
    initWidth: function(options){
        this.canvas.width = options.initialWidth;
    },
    paint: function (data) {
        this.clear();

        this.fillTopText(data);
        this.paintChart(data, this.options.minsChart);
        this.paintxAxis();
        this.fillBottomText(data);
        this.paintVolume(data);
    },
    clearArr: [],
    clear: function(){
        /*console.log( this.clearArr );
        console.log( this.ctx );*/

        for( var i = this.clearArr.legnth;i>0;i-- ){
            var ocl = this.clearArr.pop();
            ocl.clearRect(0,0,1000,1000);
        }

        this.ctx.clearRect(0, 0, 1000, 1000);
        // debugger;
    },

    paintVolume: function (data) {
        var ctx = this.ctx;
        var options = this.volume;

        ctx.beginPath();
        ctx.rect(options.region.x, options.region.y, options.region.width, options.region.height);
        ctx.strokeStyle = options.borderColor;
        ctx.stroke();

        line(ctx, options.region.x, options.region.y + options.region.height / 2, options.region.x + options.region.width, options.region.y + options.region.height / 2, options.splitLineColor);
        options.getDataLength = function () { return this.data.items.length; };
        options.maxDotsCount = this.maxDotsCount;
        var volumePainterImp = new volumePainter(options);
        var painter = new Painter(this.canvas.id, volumePainterImp, { items: data.mins });
        painter.paint();
        this.clearArr.push( painter );

        var max = painter.maxVolume;
        var unit;
        if (max / 1000000 > 1000) {
            max = max / 1000000;
            unit = '百万';
        } else {
            max = max / 10000;
            unit = '万';
        }
        var scalers = [max.toFixed(2), (max / 2).toFixed(2), '(' + unit + ')'];
        var yscaler = new yAxis(this.volume.yScaler);
        //* debugger;
        var painter = new Painter(this.canvas.id, yscaler, scalers);
        //* debugger;
        painter.paint();
        this.clearArr.push( painter );
    },

    fillBottomText: function (data) {
        if (!this.bottomText) return;
        //高9999 低9999 成交888999
        var ctx = this.ctx;
        var txt = '高';
        var options = this.bottomText;
        ctx.font = options.font;
        ctx.fillStyle = options.color;
        var w = ctx.measureText(txt).width;
        ctx.fillText(txt, options.region.x, options.region.y);
        var x = options.region.x + w;
        var quote = data.quote;
        var me = this;
        function getTxtColor(val) { return val > quote.preClose ? me.riseColor : (val == quote.preClose ? me.normalColor : me.fallColor); }
        var highColor = getTxtColor(quote.highest);
        var high = toMoney(quote.highest);
        ctx.fillStyle = highColor;
        w = ctx.measureText(high).width;
        ctx.fillText(high, x, options.region.y);
        x += w;
        txt = ' 低';
        ctx.fillStyle = options.color;
        w = ctx.measureText(txt).width;
        ctx.fillText(txt, x, options.region.y);
        x += w;
        var lowColor = getTxtColor(quote.lowest);
        var low = toMoney(quote.lowest);
        w = ctx.measureText(low).width;
        ctx.fillStyle = lowColor;
        ctx.fillText(low, x, options.region.y);
        x += w;
        ctx.fillStyle = options.color;
        var amount = ' 成交' + bigNumberToText(quote.amount);
        ctx.fillText(amount, x, options.region.y);
    },

    paintxAxis: function () {
        // debugger;
        var xAxisImpl = new xAxis(this.xScaler);
        var xAxisPainter = new Painter(this.canvas.id, xAxisImpl, this.xScaler.data);
        xAxisPainter.paint();
        this.clearArr.push(xAxisPainter);
    },

    paintChart: function (data) {
        var minsChartOptions = this.minsChart;
        var region = this.minsChart.region;
        var ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = minsChartOptions.borderColor;
        ctx.rect(region.x, region.y, region.width, region.height);
        ctx.stroke();

        //水平线
        var middleIndex = (this.minsChart.horizontalLineCount + this.minsChart.horizontalLineCount % 2) / 2;
        var splitCount = this.minsChart.horizontalLineCount + 1;
        for (var i = 1; i <= this.minsChart.horizontalLineCount; i++) {
            var color = (i == middleIndex ? minsChartOptions.middleLineColor : minsChartOptions.otherSplitLineColor);
            var y = region.y + region.height * i / splitCount;
            line(ctx, region.x, y, region.x + region.width, y, color);
        }
        //垂直线
        splitCount = this.minsChart.verticalLineCount + 1;
        for (var i = 1; i <= this.minsChart.verticalLineCount; i++) {
            var x = region.x + region.width * i / splitCount;
            line(ctx, x, region.y, x, region.y + region.height, minsChartOptions.otherSplitLineColor);
        }

        //价格线
        var lineOptions = {
            region: region,
            maxDotsCount: this.maxDotsCount,
            getDataLength: function () { return this.data.items.length; },
            getItemValue: function (item) { return item.price; },
            middleValue: data.quote.preClose, //通常是昨收
            lineColor: minsChartOptions.priceLineColor
        };
        var linePainterImp = new linePainter(lineOptions);
        var priceLinePainter = new Painter(this.canvas.id, linePainterImp, { items: data.mins });
        priceLinePainter.paint(minsChartOptions);
        this.clearArr.push( priceLinePainter );

        //y轴
        var yOptions = this.minsChart.yScalerLeft;
        var preClose = data.quote.preClose;
        var me = this;
        yOptions.color = function (val) {
            return val > preClose ? me.riseColor : (val == preClose ? me.normalColor : me.fallColor);
        };
        var scalersLeft = [];
        var scalersRight = [];
        var min = preClose - priceLinePainter.maxDiff;
        var space = priceLinePainter.maxDiff * 2 / (this.minsChart.horizontalLineCount + 1);
        for (var i = this.minsChart.horizontalLineCount + 1; i >= 0; i--) {
            var val = min + i * space;
            scalersLeft.push(val.toFixed(2));
            var percent = (val - preClose) * 100 / preClose;
            scalersRight.push(percent.toFixed(2) + '%');
        }
        var yx = new yAxis(yOptions);
        var yAxisPainter = new Painter(this.canvas.id, yx, scalersLeft);
        yAxisPainter.paint();
        this.clearArr.push( yAxisPainter );

        var yPercentOptions = this.minsChart.yScalerRight;
        yPercentOptions.color = function (val) {
            return (val == '0.00%' ? 'black' : (val.charAt(0) == '-' ? 'green' : 'red'));
        };
        var yxPercent = new yAxis(yPercentOptions);
        var yxPercentPainter = new Painter(this.canvas.id, yxPercent, scalersRight);
        yxPercentPainter.paint();
        this.clearArr.push( yxPercentPainter );


        //均线
        if (this.needPaintAvgPriceLine) {
            //生成移动均线数据
            var items = [];
            var totalVolume = 0;
            var totalAmount = 0;
            data.mins.each(function (item) {
                totalVolume += item.volume;
                totalAmount += item.amount;
                items.push(totalAmount / totalVolume);
            });
            lineOptions.lineColor = minsChartOptions.avgPriceLineColor;
            lineOptions.getItemValue = function (item) { return item; };
            linePainterImp = new linePainter(lineOptions);
            var painterAvg = new Painter(this.canvas.id, linePainterImp, { items: items });
            painterAvg.paint();
            this.clearArr.push( painterAvg );
        }

        var me = this;
        var chartRegion = me.minsChart.region;

        function getIndex(x) {

            console.log(x);
            // debugger;
            /*x -= region.x;
            var index = Math.ceil(x / (me.klOptions.spaceWidth + me.klOptions.barWidth)) - 1;
            var count = me.toIndex - me.startIndex + 1;
            if (index >= count) index = count - 1;*/
            return 0;
        }
        function getX(x) {
            var index = Math.ceil((x - me.minsChart.region.x) * me.maxDotsCount / me.minsChart.region.width);
            /*console.group( ':' );
            console.log( x );
            console.log( me.minsChart.region.x );
            console.log( me.maxDotsCount );
            console.log( me.minsChart.region.width );
            console.groupEnd();*/
            return x;
        }
        function getY(x) {
            var index = Math.ceil((x - me.minsChart.region.x) * me.maxDotsCount / (me.minsChart.region.width) );
            index -= 1;
            var val;
            var isNewQuote;
            if (index >= 0 && index < data.mins.length) {
                val = data.mins[index].price;
                isNewQuote = false;
            } else {
                val = data.quote.price;
                isNewQuote = true;
            }

            if (me.canvas.tip) me.canvas.tip.dataContext = { data: data, isNewQuote: isNewQuote, index: index };
            var diff = val - preClose;
            var middleY = (me.minsChart.region.y + me.minsChart.region.height / 2);
            // console.log( me.maxDotsCount / me.minsChart.region.width );
            return middleY - diff * me.minsChart.region.height / 2 / priceLinePainter.maxDiff;
        }

        //添加鼠标事件
        _addCrossLinesAndTipEvents(this.canvas, {
            getCrossPoint: function (ev) {
                // debugger;
                return { x: getX(ev.offsetX), y: getY(ev.offsetX) };
            },
            triggerEventRanges: { x: chartRegion.x, y: chartRegion.y, width: chartRegion.width, height: me.volume.region.y + me.volume.region.height - chartRegion.y },
            tipOptions: {
                getTipHtml: function (ev) { return null; },
                position: { x: false, y: false }
            },
            crossLineOptions: {
                color: 'black'
            }
        });
    },

    fillTopText: function (data, minIndex) {
        var quote = data.quote;
        var ctx = this.ctx;
        var topText = this.topText;
        var region = topText.region;
        ctx.clearRect(region.x, region.y, region.width, region.height);
        var price;
        var time;
        if (typeof minIndex == 'undefined') {
            price = quote.price;
            time = quote.time;
        } else {
            price = data.mins[minIndex].price;
            time = quote.time.toString().substr(0, 8) + getMinTime(minIndex);
        }

        ctx.fillStyle = topText.color;
        ctx.font = topText.font;
        if (topText.textBaseline) ctx.textBaseline = topText.textBaseline;
        var txt = '最新' + toMoney(price);
        var width = ctx.measureText(txt).width;
        ctx.fillText(txt, topText.region.x, topText.region.y);

        var isRise = price > quote.preClose;
        var isEqual = price == quote.preClose;
        var isFall = price < quote.preClose;
        var diff = toMoney(price - quote.preClose);
        var txtRiseFall = (isRise ? '↑' : (isFall ? '↓' : '')) + diff
            + ('(')
            + toMoney(diff * 100 / quote.preClose)
            + '%)';

        var x = topText.region.x + width;
        ctx.fillStyle = isRise ? this.riseColor : (isFall ? this.fallColor : this.normalColor);
        ctx.fillText(txtRiseFall, x, topText.region.y);

        var temp = new String(time);
        var txtTime = temp.charAt(8) + temp.charAt(9) + ':' + temp.charAt(10) + temp.charAt(11);
        ctx.fillStyle = topText.color;
        var timeWidth = ctx.measureText(txtTime).width;
        ctx.fillText(txtTime, topText.region.x + topText.region.width - timeWidth, topText.region.y);
    }
};

var initialWidth = Math.min(screen.width,1024)-12;  // canvas 宽度
var storkHeight = 160;
var newCharConfig = {
//* 241
    initialWidth: initialWidth,
    fallColor: 'green', riseColor: 'red', normalColor: 'black', maxDotsCount: 241, needPaintAvgPriceLine: false,
    backgroundColor:'white',
    topText: { font: '12px 宋体', color: 'black', region: { x: 58.5, y: 5.5, width: 305, height: 14 }, textBaseline: 'top' },
    minsChart: {
        // region: { x: 56.5, y: 21.5, width: 310, height: 200 },
        region: { x: 0, y: 21.5, width: initialWidth, height: storkHeight },
        priceLineColor: '#3F9DD5', avgPriceLineColor: 'red', middleLineColor: 'red', otherSplitLineColor: 'lightgray', borderColor: 'gray',
        horizontalLineCount: 3, verticalLineCount: 3,
        yScalerLeft: { font: '12px Arial', region: { x: .5, y: 20, width: 50.5, height: storkHeight}, align: 'right', fontHeight: 9, textBaseline: 'top' },
        yScalerRight: { font: '12px Arial', region: { x: initialWidth - 40, y: 20, width: 40.5, height: storkHeight }, align: 'right', fontHeight: 9, textBaseline: 'top' }
    },
    xScaler: {
        font: '12px Arial', color: 'black',
        // region: { x: 56.5, y: 225, width: 310, height: 20 },
        region: { x: 0, y: storkHeight+22 , width: 310, height: 20 },
        // data: ['09:30', '10:30', '11:30/13:00', '14:00', '15:00'] //*
        data: ['09:30']
    },

    //bottomText: { font: '11px 宋体', color: 'black', region: { x: 5.5, y: 260, width: 400, height: 20} },
    volume: {
        // region: { x: 56.5, y: 245.5, width: 310, height: 60 },
        region: { x: 0, y: storkHeight+40, width: initialWidth, height: 44 },
        bar: { color: 'green', width: 2 },
        borderColor: 'lightgray', splitLineColor: 'lightgray',
        yScaler: { font: '12px Arial', region: { x: .5, y: storkHeight+40, width: 50.5, height: 40 }, color: 'black', align: 'right', fontHeight: 12, textBaseline: 'top' }
    }
}

window.chart = null;
window.fsdata = null;


function showChart(domId)
{

    var c = document.getElementById("canvasFS");
    if(c) c.remove();
    c = document.createElement("canvas");
    c.id = "canvasFS";
    c.width = 414;
    c.height = 250;
    document.getElementById("fsWarp").appendChild(c);

    document.getElementById("storeWarp").style.display = "none";
    document.getElementById("chartLoading").style.display = "none";
    /*<canvas id="canvasFS" width="414" height="250">
        <p>你的浏览器不支持html5哟</p>
    </canvas>*/


    if( !window.chart )
        chart = new minsChart(domId, newCharConfig);
    /*if( !window.fsdata )
        fsdata = getQuote();*/

    // 获取数据
    getFSData(kType, function(data){
        window.fsdata = data;
        var fsWarp = document.getElementById("fsWarp");
        fsWarp.style.display = "block";

        fsdata.mins.push( {price:2240.16,volume:21086600,amount:193157609} );
        newCharConfig.maxDotsCount = fsdata.mins.length;
        // var chart = new minsChart(domId, newCharConfig);
        chart.paint(fsdata);

    }.bind(window));

}













