//index.js
//获取应用实例
var wxCharts = require("../../utils/wxcharts.js");
var dataUtils = require("../../utils/dataUtils.js")
var viewUtils = require("../../utils/viewUtils.js")
var pullUtils = require("../pull/pull.js")
const app = getApp()
var page
var allData
var projectMap
var buildMap
// selected: { build: "A - 11", project: "京房售证字(2020)21号" }

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    listData: [],
    searchKey: '',
    price:'',
    detail:'',
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
      projectMap = value[1]//下拉框过滤
      buildMap = value[2]

      var tabTxt = viewUtils.updateTabTxt(projectMap, buildMap, {})

      var price = '54000'
      var detail = '共178套 在售:100套 已售:78'
      that.setData({
        searchKey: fileName,
        listData: allData,
        tabTxt: tabTxt,
        price: price,
        detail: detail
      })

      this.lineChart = viewUtils.showGraph('line_graph', allData)
      this.pieChart = viewUtils.showPieChart('pie_graph', allData)
      console.log('[file info] result：', res)
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

  onShareAppMessage: function () {
  },

  getUserInfo: function (e) {
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


  filterTab: function (e) {
    pullUtils.filterTab(e, this)
  },

  filterTabChild: function (e) {
    pullUtils.filterTabChild(e, this, onTabChanged)
  }
});

function onTabChanged(filterParams) {
  var filtData = dataUtils.filtByParams(allData, filterParams)

  page.lineChart = viewUtils.showGraph('line_graph', filtData)
  page.pieChart = viewUtils.showPieChart('pie_graph', filtData)
  var tabTxt = viewUtils.updateTabTxt(projectMap, buildMap, filterParams)
  page.setData({
    listData: filtData,
    tabTxt: tabTxt
  })
}