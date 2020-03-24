var wxCharts = require("./wxcharts.js");
var dataUtils = require("./dataUtils.js")

function showGraph(data) {
  var dataMap = new Map()
  var xCoordMap = new Map() //横坐标-房间号
  var yTotalMap = new Map() //纵坐标-总价
  var yAvrMap = new Map() //纵坐标-均价

  dataUtils.updateGraphData(data, dataMap, xCoordMap, yTotalMap, yAvrMap)

  // console.log("datamap:", dataMap)
  // console.log("total:", yTotalMap.values().next().value)
  // console.log("catogrey:", xCoordMap.values().next().value)

  var windowWidth = 320;
  try {
    var res = wx.getSystemInfoSync();
    windowWidth = res.windowWidth;
  } catch (e) {
    console.error('getSystemInfoSync failed!');
  }

  var seriesList = []
  for (let [key, value] of yTotalMap.entries()) {
    var item = {}
    item.name = "test" + key
    item.data = value
    item.format = function (val, name) {
      return val + '百万';
    }
    console.log(key, value)
    seriesList.push(item)
  }

  var charts = new wxCharts({ //当月用电折线图配置
    canvasId: 'line_graph',
    type: 'line',
    categories: xCoordMap.values().next().value, //categories X轴
    animation: true,
    background: '#f5f5f5',
    series: seriesList,
    xAxis: {
      disableGrid: true
    },
    yAxis: {
      title: '总价(万)',
      format: function(val) {
        return val.toFixed(2);
      },
      max: 20,
      min: 0
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
    item.format = function (val, name) {
      return val + '个';
    }
    seriesList.push(item)
  }
  console.log("map:", map)
  var charts = new wxCharts({

    canvasId: id,

    type: 'pie',

    series: seriesList,
    width: 320,
    height: 150,
    dataLabel: false
  });
  return charts
}


module.exports = {
  showGraph: showGraph,
  showPieChart: showPieChart
}