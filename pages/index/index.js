//index.js
//获取应用实例
import * as echarts from '../../utils/ec-canvas/echarts';

var wxCharts = require("../../utils/wxcharts.js");
var dataUtils = require("../../utils/dataUtils.js")
var viewUtils = require("../../utils/viewUtils.js")
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    listData: [],

    ec: {
      // 将 lazyLoad 设为 true 后，需要手动初始化图表
      lazyLoad: true
    },

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
      var value = dataUtils.processFileData(res)
      var mapData = value[0]
      var buildList = value[1]

      that.setData({
        listData: mapData.get(buildList[0])
      })


      that.ecLineComponent.init((canvas, width, height, dpr) => {
        // 获取组件的 canvas、width、height 后的回调函数
        // 在这里初始化图表
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        chart.setOption(viewUtils.getBarOption(mapData.get(buildList[0])))

        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return chart;
      });

      that.ecPieComponent.init((canvas, width, height, dpr) => {
        // 获取组件的 canvas、width、height 后的回调函数
        // 在这里初始化图表
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        chart.setOption(viewUtils.getScatterOption(mapData.get(buildList[0])))

        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return chart;
      });


      this.lineChart = viewUtils.showGraph(mapData.get(buildList[0]))
      this.pieChart =  viewUtils.showPieChart('pie_graph', mapData.get(buildList[0]))
      console.log('[downloadFile] result：', res)
    }).catch(err => {
      console.log('[downloadFile] 失败：', err)
    })
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

  onReady: function () {
    // 获取组件
    this.ecLineComponent = this.selectComponent('#mychart-dom-multi-bar');
    this.ecPieComponent = this.selectComponent('#mychart-dom-multi-scatter');
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  touchHandler: function (e) {
    
    this.lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        console.log("item:", item)
        console.log("category", category)
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },

  touchPieHandler: function (e) {

    this.pieChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        console.log("item:", item)
        console.log("category", category)
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
});