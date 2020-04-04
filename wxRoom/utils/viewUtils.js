var wxCharts = require("./wxcharts.js");
var dataUtils = require("./dataUtils.js")

function showGraph(id, data) {
  var dataMap = []
  var xCoordList = [] //横坐标-房间号
  var yTotalList = [] //纵坐标-总价
  var yAvrList = [] //纵坐标-均价

  console.log("data:", data)
  dataUtils.updateGraphData(data, xCoordList, yTotalList, yAvrList, data[0].build)

  var windowWidth = 380;
  try {
    var res = wx.getSystemInfoSync();
    windowWidth = res.windowWidth;
  } catch (e) {
    console.error('getSystemInfoSync failed!');
  }

  var seriesList = []
  var item = {}
  item.name = "房屋总价"
  item.data = yTotalList
  item.format = function (val, name) {
    return val + '百万';
  }
  seriesList.push(item)

  console.log("series:", seriesList)
  var charts = new wxCharts({ //当月用电折线图配置
    canvasId: id,
    type: 'line',
    categories: xCoordList, //categories X轴
    animation: true,
    series: seriesList,
    xAxis: {
      disableGrid: false
    },
    yAxis: {
      title: '总价(万)',
      format: function(val) {
        return val.toFixed(1);
      },
      max: 200,
      min: 150
    },
    width: windowWidth,
    height: 200,
    dataLabel: false,
    dataPointShape: true,
    extra: {
      lineStyle: 'curve'
    }
  });
  return charts
}

function showPieChart(id, data) {
  var map = new Map()
  for (var i = 0; i < data.length; i++) {
    var num = map.get(data[i].type)
    if (num == null) {
      num = 0
    }
    map.set(data[i].type, num + 1)
  }

  var seriesList = []
  for (let [key, value] of map.entries()) {
    var item = {}
    item.name = key
    item.data = value
    seriesList.push(item)
  }
  console.log("map:", map)
  var charts = new wxCharts({

    canvasId: id,

    type: 'pie',

    series: seriesList,
    width: 320,
    height: 190,
    dataLabel: true
  });
  return charts
}


module.exports = {
  showGraph: showGraph,
  showPieChart: showPieChart
}