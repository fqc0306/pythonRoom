function processFileData(res) {
  var j = 0
  var lines = res.result.split('\n')
  var mapData = new Map()
  var horizonData = []
  var jsonList = []
  var buildList = [] //['A-1','A-2']
  var lastBuild
  console.log("lines number:", lines.length)
  for (j = 0; j < lines.length; j++) {

    var infos = lines[j]
    var json = {}
    var i = 0

    try {
      if (infos != '') {
        var jsonObj = JSON.parse(infos)

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

        horizonData.push(json)
        jsonList.push(json)
      }
    } catch (err) {
      console.error(err)
      return null
    }

    if (j == lines.length - 1 || (lastBuild != "" && lastBuild != jsonObj.build)) {
      mapData.set(jsonObj.build, jsonList)
      buildList.push(jsonObj.build)
      lastBuild = jsonObj.build
    }
  }
  return [mapData, buildList]
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


function updateGraphData(data, dataMap, xCoordMap, yTotalMap, yAvrMap) {

  for (var i = 0; i < data.length; i++) {
    var key = data[i].build + "_" + data[i].unit + "_" + parseInt(data[i].room) % 100 //如:1_2单元_1 
    var value = dataMap.get(key)
    if (value == null) {
      var yListValue = []
      yListValue.push(data[i])
      dataMap.set(key, yListValue)

      var xCoordValue = []
      xCoordValue.push(data[i].room)
      xCoordMap.set(key, xCoordValue)

      var yTotalValue = []
      yTotalValue.push(data[i].price_total)
      yTotalMap.set(key, yTotalValue)

    } else {
      value = dataMap.get(key)
      value.push(data[i])
      dataMap.set(key, value)

      var xValue = xCoordMap.get(key)
      xValue.push(data[i].room)
      xCoordMap.set(key, xValue)

      var yTotalValue = yTotalMap.get(key)
      yTotalValue.push(data[i].price_total)
      yTotalMap.set(key, yTotalValue)
    }
  }
}

module.exports = {
  processFileData: processFileData,
  updateGraphData: updateGraphData,
  processFileProjectData: processFileProjectData
}