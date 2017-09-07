
console.log('~~');

var data = [];
function getKLData(type, cb) {
    type = !!type ? type : '1day';

    debugger;
    switch(type){
    	case 'label_1':
    		break;
    	default:
    		
    		break;
    }

    Ajax.get('/stork/get.php?k='+type, function(data){
        // debugger;
        data = JSON.parse(data.response);
        var result = {};
        var ks = [];
        for (var i = 0; i < data.length; i++) {
            var rawData = data[i];
            //20111215,11.68,11.65,11.76,11.40,11.41,43356655,502325991
            //日期,昨收,开盘价,高,低，收,量，额
            var item = {
                quoteTime: rawData[0],
                preClose: rawData[1],
                open: rawData[2],
                high: rawData[3],
                low: rawData[4],
                close: rawData[5],
                volume: rawData[6],
                amount: rawData[7]
            };
            if (ks.length == 0) {
                result.low = item.low;
                result.high = item.high;
            } else {
                result.high = Math.max(result.high, item.high);
                result.low = Math.min(result.low, item.low);
            }
            ks.push(item);
        }
        drawKL();
        result.ks = ks;
        cb(result);
    }, "canvasKL", true);
}
function getFSData(type, cb, ) {
    Ajax.get('/stork/get.php?k=fs', function(data){
        data = JSON.parse(data.response);
        cb(data);
    }, "canvasKL", true);
}

function select(k){
	window.getId = [234];
    switch (k){
        case 0:
            painter = null;
            kType = "fs";
            showChart('canvasFS');
            break;
        case 1:
            painter = null;
            kType = "1day";
            drawKL();
            break;
        case 2:
            painter = null;
            kType = "7day";
            drawKL();
            break;
        case 3:
            painter = null;
            kType = "30day";
            drawKL();
            break;
    }
}

setTimeout(function(){
    select(0);
}, 1000);