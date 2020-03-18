//index.js
//获取应用实例

var wxCharts = require("../../utils/wxcharts.js");
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
      var j = 0
      var rooms = res.result.split('\n')
      var mapData = new Map()
      var horizonData = []
      var jsonList = []
      var buildList = [] //['A-1','A-2']
      var lastBuild
      console.log("rooms number:", rooms.length)
      for (j = 0; j < rooms.length; j++) {

        var infos = rooms[j]
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
        }

        if (j == rooms.length - 1 || (lastBuild != "" && lastBuild != jsonObj.build)) {
          mapData.set(jsonObj.build, jsonList)
          buildList.push(jsonObj.build)
          lastBuild = jsonObj.build
        }
      }
      
      that.setData({
        listData: mapData.get(buildList[0])
      })

      that.getMothElectro(horizonData)
      console.log('[downloadFile] result：', res)
    }).catch(err => {
      console.log('[downloadFile] 失败：', err)
    })
  },
  getMothElectro: function(data) {

    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    new wxCharts({ //当月用电折线图配置
      canvasId: 'yueEle',
      type: 'line',
      categories: data, //categories X轴
      animation: true,
      background: '#f5f5f5',
      series: [{
        name: '总用电量',
        //data: yuesimulationData.data,
        data: [1, 6, 9, 1, 0],
        format: function(val, name) {
          return val.toFixed(2) + 'kWh';
        }
      }, {
        name: '电池供电量',
        data: [0, 6, 2, 2, 7],
        format: function(val, name) {
          return val.toFixed(2) + 'kWh';
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '当月用电(kWh)',
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