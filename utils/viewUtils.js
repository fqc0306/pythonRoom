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
    item.format = "metre"
    console.log(key, value)
    seriesList.push(item)
  }

  new wxCharts({ //当月用电折线图配置
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
  new wxCharts({

    canvasId: id,

    type: 'pie',

    series: seriesList,
    width: 320,
    height: 150,
    dataLabel: true
  });
}

function getBarOption(data) {
  var dataMap = new Map()
  var xCoordMap = new Map() //横坐标-房间号
  var yTotalMap = new Map() //纵坐标-总价
  var yAvrMap = new Map() //纵坐标-均价

  dataUtils.updateGraphData(data, dataMap, xCoordMap, yTotalMap, yAvrMap)

  // console.log("datamap:", dataMap)
  // console.log("total:", yTotalMap.values().next().value)
  // console.log("catogrey:", xCoordMap.values().next().value)

  var seriesList = []
  for (let [key, value] of yTotalMap.entries()) {
    var item = {}
    item.name = "test" + key
    item.data = value
    item.type = "line"
    console.log(key, value)
    seriesList.push(item)
  }
  var option = {
    title: {
      text: 'title',
      left: 'center'
    },
    legend: {
      top: 50,
      left: 'center',
      z: 100
    },
    grid: {
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xCoordMap.values().next().value,
      // show: false
    },
    yAxis: {
      x: 'center',
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
      // show: false
    },
    series: seriesList
  };
  return option;
}

function getScatterOption(data) {
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
    item.value = value
    seriesList.push(item)
  }
  console.log("map:", map)

  var option = {
    backgroundColor: "#ffffff",
    color: ["#67E0E3", "#91F2DE", "#FFDB5C", "#FF9F7F"],
    series: [{
      label: {
        normal: {
          fontSize: 10
        }
      },
      type: 'pie',
      data: seriesList
    }]
  };
  return option
}

module.exports = {
  showGraph: showGraph,
  showPieChart: showPieChart,
  getBarOption: getBarOption,
  getScatterOption: getScatterOption
}