//index.js
//获取应用实例
var wxCharts = require("../../utils/wxcharts.js");
var dataUtils = require("../../utils/dataUtils.js")
var viewUtils = require("../../utils/viewUtils.js")
var pullUtils = require("../pull/pull.js")

var NOT_SALE = "CCCCCC" //不可售
var ON_SALE = "33CC00" //可售
var booked = "FFCC99" //已预订
var signed = "FF0000" //已签约
"ffff00" //已办理预售项目抵押
"d2691e" //网上联机备案
"00FFFF" //资格核验中

const app = getApp()
var page
var allData
var projectMap
var buildMap
var allTypes
var rangePrice
// selected: { build: "A - 11", project: "京房售证字(2020)21号" }

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    listData: [],
    searchKey: '',
    price: '',
    detail: '',
    isShow: false,

    tabTxt: [],
    filterParam: [],

  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  bindSearchTap: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  //调用云函数
  getFileData: function () {
    let that = this
    var fileName = ''

    if (this.data.searchKey != '' && typeof this.data.searchKey != 'undefined') {
      fileName = this.data.searchKey
    } else {
      fileName = '青年金色佳苑'
    }

    wx.cloud.callFunction({
      name: 'fileInfo',
      data: {
        file_id: 'cloud://zhaoxinfang-i5zft.7a68-zhaoxinfang-i5zft-1301400512/bj/' + fileName + '.json'
      }
    }).then(res => {
      var value = dataUtils.processFileData(res)
      allData = value[0]
      projectMap = value[1] //下拉框过滤
      buildMap = value[2]
      allTypes = value[3]
      rangePrice = value[4] //range:{min:100, max:200}

      var tabTxt = viewUtils.updateTabTxt(projectMap, buildMap, allTypes, rangePrice, {})

      var price = Math.floor(rangePrice.min) + '~' + Math.ceil(rangePrice.max)
      that.setData({
        searchKey: fileName,
        listData: allData,
        tabTxt: tabTxt,
        price: price,
      })

      if (allData != null || allData.length > 0) {
        this.lineChart = viewUtils.showGraph('line_graph', allData, rangePrice)
        this.pieChart = viewUtils.showPieChart('pie_graph', allData)
      } else {
        console.error("no data!")
      }
      console.log('[file info] result：', res)
    }).catch(err => {
      console.log('[file info] 失败：', err)
    })

    wx.cloud.callFunction({
      name: 'fileInfo',
      data: {
        file_id: 'cloud://zhaoxinfang-i5zft.7a68-zhaoxinfang-i5zft-1301400512/bj/' + fileName + '_dy.json'
      }
    }).then(res => {
      var value = dataUtils.processDYFileData(res)
      var allData = value[0]
      var allStatus = value[1]
      console.log("status:", allStatus)

      // var tabTxt = viewUtils.updateTabTxt(projectMap, buildMap, allTypes, rangePrice, {})

      var detail = '共' + allData.length + '套 在售:' + allStatus[ON_SALE] + '套'
      that.setData({
        detail: detail
      })
    }).catch(err => {
      console.log('[file info] 失败：', err)
    })

  },

  onLoad: function (options) {
    page = this
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

    this.setData({
      searchKey: options.keywords
    });
  },

  onReady: function () { },
  onShow: function (options) {
    this.getFileData()
  },

  onShareAppMessage: function () { },

  getUserInfo: function (e) {
    console.log("getUserInfo:", e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: e.detail.userInfo == null ? false : true
    })

    if (e.detail.userInfo != null) {
      wx.cloud.callFunction({
        name: 'writeDbInfo',
        data: {
          userInfo: e.detail.userInfo,
          file_id: 'login_info'
        }
      }).then(console.log)
    }
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


  filterTab: function (e) {
    pullUtils.filterTab(e, this)
  },

  filterTabChild: function (e) {
    pullUtils.filterTabChild(e, this, onTabChanged)
  }
});

function onTabChanged(filterParams) {

  var filtData = dataUtils.filtByParams(allData, filterParams)

  if (filtData != null && filtData.length > 0) {
    page.lineChart = viewUtils.showGraph('line_graph', filtData, rangePrice)
    page.pieChart = viewUtils.showPieChart('pie_graph', filtData)
  } else {
    console.error("no data!")
  }
  var tabTxt = viewUtils.updateTabTxt(projectMap, buildMap, allTypes, rangePrice, filterParams)
  page.setData({
    listData: filtData,
    tabTxt: tabTxt
  })
}