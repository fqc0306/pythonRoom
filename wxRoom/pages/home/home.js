// pages/home/home.js
const app = getApp();
var dataUtils = require("../../utils/dataUtils.js")
var commonUtils = require("../../utils/commonUtils.js")
var showMoreTap = false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    builds: {},
    showMore: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHotData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },

  getHotData: function () {

    wx.cloud.callFunction({
      name: 'dbInfo',
      data: {
        file_id: 'build_infos'
      }
    }).then(res => {
      var builds = res.result.data.slice(0, 50)
      builds = dataUtils.processHomeData(builds)
      this.setData({
        builds: builds
      });

      wx.cloud.callFunction({
        name: 'dbInfo',
        data: {
          file_id: 'mapping'
        }
      }).then(res => {
        var mapping = res.result.data
        builds = dataUtils.processMapData(builds, mapping)
        commonUtils.log("maped builds", builds)
        this.setData({
          builds: builds
        });
      }).catch(err => {
        commonUtils.error('[get mapping] 失败：', err)
      })
    }).catch(err => {
      commonUtils.error('[hot data] 失败：', err)
    })
  },

  go_to_detail: function (e) {
    if (showMoreTap) {
      showMoreTap = false
      return
    }
    var alias = ""
    if (e.currentTarget.dataset.keywords.alias != null) {
      alias = "&alias=" + e.currentTarget.dataset.keywords.alias.join(",")
    }
    wx.navigateTo({
      url: "../index/index?fileName=" + e.currentTarget.dataset.keywords.name + alias,

    })
  },

  bindSearchTap: function () {
    wx.navigateTo({
      url: "../search/search"
    })
  },

  showMore: function (e) {
    showMoreTap = true
    var showMore = this.data.showMore
    showMore[e.currentTarget.dataset._id] = !e.currentTarget.dataset.value
    this.setData({
      showMore: showMore
    })
  }
})