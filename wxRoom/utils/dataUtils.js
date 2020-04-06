function processFileData(res) {
  var j = 0
  var lines = res.result.split('\n')
  var allData = []
  var allProjects = new Map()
  var allBuilds = new Map()

  console.log("lines number:", lines.length)
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
        json["price_total"] = "" + (totalPrice / 10000).toFixed(2)

        allData.push(json)

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
  return [allData, allProjects, allBuilds]
}

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
    if (buildLimit == data[i].build) {
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
//filters: { build: "A - 11", project: "京房售证字(2020)21号" }
function filtByParams(data, filters) {
  var result = []
  for (var i = 0; i < data.length; i++) {
    if ((typeof(filters.project) == 'undefined' ? true : data[i].project == filters.project)
      && (typeof (filters.build) == 'undefined' ? true : data[i].build == filters.build)
        && (typeof (filters.unit) == 'undefined' ? true : data[i].unit == filters.unit)) {
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
  filtByParams: filtByParams
}