var wxCharts = require("./wxcharts.js");
var dataUtils = require("./dataUtils.js")

//data:{[],[],[build:"1",room:"801"...]}
function showGraph(id, data, rangePrice) {
  var dataMap = []
  var xCoordList = [] //横坐标-房间号
  var yTotalList = [] //纵坐标-总价
  var yAvrList = [] //纵坐标-均价

  dataUtils.updateGraphData(data, xCoordList, yTotalList, yAvrList, null)

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
  item.format = function(val, name) {
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
      max: Math.ceil(rangePrice.max / 50) * 50,
      min: Math.floor(rangePrice.min / 50) * 50
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
// 示例
// [{
//   'text': '语种',
//     'originalText': '语种',
//       'active': false,
//         'child': [
//           { 'id': 1, 'text': '华语' },
//           { 'id': 2, 'text': '粤语' },
//           { 'id': 3, 'text': '欧美' }
//         ],
//           'type': 0
// }]
// selected: { build: "A - 11", project: "京房售证字(2020)21号", type:"一室一厅", range:{min:100, max:200} } 修改上一级则下级均为空，如build修改，则unit为null
//project:{"京房售证字1**":["A-1",'A-2'], "京房售证字2**":["A-11"]}
//buildMap:{'A-1':['1单元','2单元','3单元'],'A-2':['1单元','2单元']}
function updateTabTxt(buildMap, allTypes, rangePrice, selected) {
  console.log("selected", selected)
  var tabTxt = []
  var item = {}

  item = {}
  item["text"] = "价格"
  item["originalText"] = "价格"
  item["key"] = "range"
  item["active"] = false
  item["type"] = 0
  //更新价格的下拉框
  var children = []
  var max = Math.ceil(rangePrice.max / 100) * 100
  var min = Math.floor(rangePrice.min / 100) * 100
  var level = min
  var index = 0
  var step = 50 * Math.floor((max - min) / 5 / 60)
  step = (step == 0 ? 50 : step)
  while (level < max) {
    var child = {}
    var temp = {}
    temp["min"] = level
    temp["max"] = level + step
    child["range"] = temp
    child["id"] = ++index,
      child["text"] = level + "-" + (level + step) + "万"
    if (selected.range != null && child["range"].min == selected.range.min && child["range"].max == selected.range.max) {
      item["type"] = child["id"]
      item["text"] = child["text"]
      item["range"] = child["range"]
    }
    children.push(child)
    level = level + step
  }
  item["child"] = children
  tabTxt.push(item)

  item = {}
  item["text"] = "户型"
  item["originalText"] = "户型"
  item["key"] = "type"
  item["active"] = false
  item["type"] = 0
  //更新户型的下拉框
  var children = []
  for (var index = 0; index < allTypes.length; index++) {

    var child = {}
    child["id"] = index + 1,
      child["text"] = allTypes[index]
    if (allTypes[index] == selected.type) {
      item["type"] = child["id"]
      item["text"] = selected.type
    }
    children.push(child)
  }
  item["child"] = children
  tabTxt.push(item)

  if (Array.from(buildMap.entries()).length > 1) {
    item = {}
    item["text"] = "楼号"
    item["originalText"] = "楼号"
    item["key"] = "build"
    item["active"] = false
    item["type"] = 0
    if (selected.build != null) { //map entries length
      var children = []
      var index = 1
      for (var [key, val] of buildMap.entries()) {
        var child = {}
        child["id"] = index++,
          child["text"] = key
        if (key == selected.build) {
          item["type"] = child["id"]
          item["text"] = selected.build
        }
        children.push(child)
      }
      item["child"] = children

      tabTxt.push(item)
    } else {
      var children = []
      var index = 1
      for (var [key, val] of buildMap.entries()) {
        var child = {}
        child["id"] = index++,
          child["text"] = key
        children.push(child)
      }
      item["child"] = children

      tabTxt.push(item)
      return tabTxt
    }
  }

  item = {}
  item["text"] = "单元"
  item["originalText"] = "单元"
  item["key"] = "unit"
  item["active"] = false
  item["type"] = 0
  if (selected.unit != null) {
    var val = buildMap.get(selected.build)
    var children = []
    for (var index = 0; index < val.length; index++) {

      var child = {}
      child["id"] = index + 1,
        child["text"] = val[index]
      if (val[index] == selected.unit) {
        item["type"] = child["id"]
        item["text"] = selected.unit
      }
      children.push(child)
    }
    item["child"] = children

    tabTxt.push(item)
  } else {
    var val = buildMap.get(selected.build)
    var children = []
    for (var index = 0; index < val.length; index++) {
      var child = {}
      child["id"] = index + 1,
        child["text"] = val[index]
      children.push(child)
    }
    item["child"] = children

    tabTxt.push(item)
  }
  return tabTxt
}

module.exports = {
  showGraph: showGraph,
  showPieChart: showPieChart,
  updateTabTxt: updateTabTxt
}