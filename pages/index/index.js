//index.js
//获取应用实例

var wxCharts = require("../../utils/wxcharts.js");
var utils = require("../../utils/dataUtils.js")
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    listData: []
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //调用云函数
  getFileData: function() {

    let that = this
    wx.cloud.callFunction({
      name: 'downloadFile',
      data: {}
    }).then(res => {
      var value = utils.processFileData(res)
      var mapData = value[0]
      var buildList = value[1]

      that.setData({
        listData: mapData.get(buildList[0])
      })

      that.showGraph(mapData.get(buildList[0]))
      console.log('[downloadFile] result：', res)
    }).catch(err => {
      console.log('[downloadFile] 失败：', err)
    })
  },

  showGraph: function(data) {
    var dataMap = new Map()
    var xCoordMap = new Map() //横坐标-房间号
    var yTotalMap = new Map() //纵坐标-总价
    var yAvrMap = new Map() //纵坐标-均价

    utils.updateGraphData(data, dataMap, xCoordMap, yTotalMap, yAvrMap)

    console.log("datamap:", dataMap)
    console.log("total:", yTotalMap.values().next().value)
    console.log("catogrey:", xCoordMap.values().next().value)

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
      canvasId: 'yueEle',
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
  },

  onLoad: function() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.getFileData()
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})