// pages/home/home.js
const app = getApp();
var dataUtils = require("../../utils/dataUtils.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    builds: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.getHotData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getHotData: function () {

    wx.cloud.callFunction({
      name: 'dbInfo',
      data: {
        file_id: 'build_infos'
      }
    }).then(res => {
      var builds = res.result.data.slice(0, 30)
      builds = dataUtils.processHomeData(builds)
      console.log(builds)
      this.setData({
        builds: builds
      });
    }).catch(err => {
      console.log('[hot data] 失败：', err)
    })
  },

  go_to_detail: function (e) {
    wx.navigateTo({
      url: "../index/index?keywords=" + e.currentTarget.dataset.keywords.name
    })
  },

  bindSearchTap: function(){
    wx.navigateTo({
      url: "../search/search"
    })
  }
})