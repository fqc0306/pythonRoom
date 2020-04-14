//处理一个楼盘面积/价格等信息
function processFileData(res) {
  var j = 0
  var lines = res.result.split('\n')
  var allData = []

  var allProjects = new Map() //{"京房售证字1**":["A-1",'A-2'], "京房售证字2**":["A-11"]}
  var allBuilds = new Map() //{'A-1':['1单元','2单元','3单元'],'A-2':['1单元','2单元']}
  var allTypes = [] //["一室一厅","两室一厅]
  var rangePrice = [] //{max:500, min:200}
  var maxPrice = 0
  var minPrice = 0

  for (j = 0; j < lines.length; j++) {

    var infos = lines[j]
    var json = {}
    var i = 0

    try {
      if (infos != '') {
        var jsonObj = JSON.parse(infos)

        json["project"] = jsonObj.project
        json["build"] = jsonObj.build
        json["unit"] = jsonObj.unit
        json["room"] = jsonObj.room
        json["square_all"] = parseFloat(jsonObj.square_all).toFixed(2)
        json["square_in"] = parseFloat(jsonObj.square_in).toFixed(2)
        json["price_all"] = parseInt(jsonObj.price_all)
        json["price_in"] = parseInt(jsonObj.price_in)
        json["type"] = jsonObj.type
        var totalPrice = parseFloat(jsonObj.square_all) * parseFloat(jsonObj.price_all)
        totalPrice = (totalPrice / 10000).toFixed(2)
        json["price_total"] = "" + totalPrice

        allData.push(json)

        if (totalPrice > maxPrice) {
          maxPrice = totalPrice
        }
        if (minPrice == 0 || totalPrice < minPrice) {
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

        var tempList = allProjects.get(json.project)
        if (tempList == null) {
          tempList = []
          tempList.push(json.build)
        } else if (tempList.indexOf(json.build) < 0) {
          tempList.push(json.build)
        }
        allProjects.set(json.project, tempList)

        tempList = allBuilds.get(json.build)
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
  return [allData, allProjects, allBuilds, allTypes, rangePrice]
}
//处理一个楼盘售卖状态信息
function processDYFileData(res) {
  var j = 0
  var lines = res.result.split('\n')
  var allData = []
  var allStatus = {} //计算其数量{"33CC00":50, "FFCC99":22}

  for (j = 0; j < lines.length; j++) {

    var infos = lines[j]
    var json = {}
    var i = 0

    try {
      if (infos != '') {
        var jsonObj = JSON.parse(infos)

        json["project"] = jsonObj.project
        json["build"] = jsonObj.build
        json["unit"] = jsonObj.unit
        json["room"] = jsonObj.room
        json["status"] = jsonObj.status

        allData.push(json)

        var value = allStatus[jsonObj.status]
        if (value == null) {
          allStatus[jsonObj.status] = 1
        } else {
          allStatus[jsonObj.status] = value + 1
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
    result.push(dataList[i].name)
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
  filtByParams: filtByParams,
  processDYFileData: processDYFileData
}