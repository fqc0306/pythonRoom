var commonUtils = require("./commonUtils.js")

//处理一个楼盘面积/价格等信息
function processFileData(res) {
  var j = 0
  var allData = []

  var allProjects = new Map() //{"京房售证字1**":["A-1",'A-2'], "京房售证字2**":["A-11"]}
  var allBuilds = new Map() //{'A-1':['1单元','2单元','3单元'],'A-2':['1单元','2单元']}
  var allTypes = [] //["一室一厅","两室一厅]
  var rangePrice = [] //{max:500, min:200}
  var maxPrice = 0
  var minPrice = 0

  var lines = JSON.parse(res.result)
  for (j = 0; j < lines.length; j++) {

    var line = lines[j]
    var json = {}
    var i = 0
    // { "id": 80, "build": "1", "project": "京房售证字(2020)24号", "unit": "5单元", "room": "102", "detail": { "房间号": "5单元-102", "规划设计用途": "住宅", "户型": "三室两厅", "建筑面积": "88.3300", "套内面积": "72.3800", "按建筑面积拟售单价": "38565", "按套内面积拟售单价": "47063.37" } },
    // { "id": 81, "build": "1", "project": "京房售证字(2020)24号", "unit": "1单元", "room": "", "detail": { "房间号": "1单元--101", "用途": "戊类库房", "建筑面积(m2)": "87.7100", "套内面积(m2)": "71.3000" } },

    try {
      if (line != '') {
        json["build"] = line.build
        json["unit"] = line.unit
        json["room"] = line.room
        if (json["room"] == "") {
          json["room"] = line.detail['房间号'].replace(line.unit + "-", "")
        }
        var temp = line.detail['建筑面积']
        if (temp == null) {
          temp = line.detail['建筑面积(m2)']
        }
        json["square_all"] = parseFloat(temp).toFixed(2)

        var temp = line.detail['套内面积']
        if (temp == null) {
          temp = line.detail['套内面积(m2)']
        }
        json["square_in"] = parseFloat(temp).toFixed(2)
        json["price_all"] = parseInt(line.detail['按建筑面积拟售单价'])
        json["price_in"] = parseInt(line.detail['按套内面积拟售单价'])

        if (typeof (line.detail['户型']) == 'undefined') {
          json["type"] = "无" + "(" + line.detail['用途'] + ")"
        } else {
          json["type"] = line.detail['户型']
        }
        json["func"] = line.detail['规划设计用途']
        if (json["func"] == null) {
          json["func"] = line.detail['用途']
        }

        var totalPrice = parseFloat(json.square_all) * parseFloat(json.price_all)
        totalPrice = parseFloat((totalPrice / 10000).toFixed(2))
        if (totalPrice == null || isNaN(totalPrice)) {
          totalPrice = 0;
        }
        json["price_total"] = "" + totalPrice
        allData.push(json)

        if (totalPrice > maxPrice) {
          maxPrice = totalPrice
        }
        if (minPrice == 0 || (totalPrice > 0 && totalPrice < minPrice)) {
          minPrice = totalPrice
        }

        var isAdd = true
        for (var i = 0; i < allTypes.length; i++) {
          if (json.type == allTypes[i]) {
            isAdd = false;
            break;
          }
        }
        if (isAdd) {
          allTypes.push(json.type);
        }

        var tempList = allBuilds.get(json.build)
        if (tempList == null) {
          tempList = []
          tempList.push(json.unit)
        } else if (tempList.indexOf(json.unit) < 0) {
          tempList.push(json.unit)
        }
        allBuilds.set(json.build, tempList)

      }
    } catch (err) {
      console.error(err)
      return null
    }
  }
  rangePrice.max = maxPrice
  rangePrice.min = minPrice
  return [allData, allBuilds, allTypes, rangePrice]
}

//处理一个楼盘售卖状态信息
function processDYFileData(res) {
  var j = 0
  var lines = JSON.parse(res.result)
  var allData = []
  var allStatus = {} //计算其数量{"33CC00":50, "FFCC99":22}

  for (j = 0; j < lines.length; j++) {

    var line = lines[j]
    var json = {}
    var i = 0

    try {
      if (line != '') {
        json["build"] = line.build
        json["unit"] = line.unit
        json["room"] = line.room
        json["status"] = line.status

        allData.push(json)

        var value = allStatus[json.status]
        if (value == null) {
          allStatus[json.status] = 1
        } else {
          allStatus[json.status] = value + 1
        }
      }
    } catch (err) {
      console.error(err)
      return null
    }
  }
  return [allData, allStatus]
}
//处理所有楼盘信息数据
function processFileProjectData(res) {
  var j = 0
  var lines = res.result.split('\n')
  var mapData = new Map()
  var jsonList = []

  for (j = 0; j < lines.length; j++) {
    var infos = lines[j]
    var json = {}
    var i = 0

    try {
      if (infos != '') {
        var jsonObj = JSON.parse(infos)

        json["id"] = jsonObj.id
        json["name"] = jsonObj.name
        json["url"] = jsonObj.url

        jsonList.push(json)
      }
    } catch (err) {
      console.error(err)
      return null
    }
  }
  return jsonList
}


function updateGraphData(data, xCoordList, yTotalList, yAvrList, buildLimit) {

  var total = []
  var xLastValue = ""
  for (var i = 0; i < data.length; i++) {
    if (buildLimit == null || buildLimit == data[i].build) {
      yTotalList.push(data[i].price_total)
      yAvrList.push(data[i].price_all)
      var key = data[i].build + "_" + data[i].unit //如:1_2单元_1 
      if (xLastValue == key) {
        xCoordList.push("")
      } else {
        xCoordList.push(key)
      }
      xLastValue = key
    }
  }
}

function processHotData(dataList) {
  var result = []
  for (var i = 0; i < dataList.length; i++) {
    var temp = {}
    temp.name = dataList[i].name.split('_')[0]
    temp.fileName = dataList[i].name
    for (var j = 0; j < result.length; j++) {
      if (result[j].name == temp.name) {
        temp.name = temp.fileName.replace('_京房售证字', '')
        break
      }
    }
    result.push(temp)
  }
  return result
}

function processHomeData(dataList) {
  var result = []

  for (var i = 0; i < dataList.length; i++) {
    var item = dataList[i]
    var totalPrice = 0
    var totalSqr = 0
    var totalRooms = 0
    for (var j = 0; j < item.build_list.length; j++) {
      var it = item.build_list[j]
      if (it["住宅拟售价格(元/m2)"].length > 0 && it["批准销售面积(m2)"].length > 0) {
        var tempPrice = parseFloat(it["住宅拟售价格(元/m2)"]) * parseFloat(it["批准销售面积(m2)"])
        totalPrice = totalPrice + tempPrice
        totalSqr = totalSqr + parseFloat(it["批准销售面积(m2)"])
        totalRooms = totalRooms + parseInt(it['批准销售套数'])
      }
    }
    var avgPrice = totalPrice / totalSqr
    avgPrice = avgPrice.toFixed(2)
    item.info['avg_price'] = avgPrice
    item.info['total_room'] = totalRooms

    result.push(item)
  }
  return result
}

//filters: { build: "A - 11", project: "京房售证字(2020)21号", range:{min:100, max:200} }
function filtByParams(data, filters) {
  var result = []
  for (var i = 0; i < data.length; i++) {
    if ((typeof (filters.project) == 'undefined' ? true : data[i].project == filters.project) &&
      (typeof (filters.build) == 'undefined' ? true : data[i].build == filters.build) &&
      (typeof (filters.unit) == 'undefined' ? true : data[i].unit == filters.unit) &&
      (typeof (filters.type) == 'undefined' ? true : data[i].type == filters.type) &&
      (typeof (filters.range) == 'undefined' ? true : (data[i].price_total >= filters.range.min && data[i].price_total < filters.range.max))) {
      result.push(data[i])
    }
  }
  return result
}

module.exports = {
  processFileData: processFileData,
  updateGraphData: updateGraphData,
  processFileProjectData: processFileProjectData,
  processHotData: processHotData,
  processHomeData: processHomeData,
  filtByParams: filtByParams,
  processDYFileData: processDYFileData
}