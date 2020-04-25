var commonUtils = require("../../utils/commonUtils.js")
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    index_data: [],
    keywords: '',
    noData: 1
  },

  openTypeSelect({
    currentTarget: {
      dataset: {
        id
      }
    }
  }) {
    this.selectComponent("#goodsType").openTypeSelect(id);
  },

  // 监听输入
  watchSearch: function(event) {
    let keywords = event.detail.value;
    // 设置值
    this.setData({
      "keywords": keywords
    });
  },
  go_to_search_result({
    currentTarget: {
      dataset: {
        keywords
      }
    }
  }) {
    if (keywords == '') {
      return tips.showMsg("请输入要搜索的内容");
    }

    const uid = app.globalData.uid;
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 能获取到参数
    commonUtils.log("keywords", options.keywords);
    // 设置值
    this.setData({
      "keywords": options.keywords
    });
  },

  /**
   * 展示
   */
  onShow: function(options) {
    // 获取不到参数
    let keywords = this.data.keywords;
    const uid = app.globalData.uid;
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    return initInPage(this, "searchData", this.inData, {
      inDataName: "inData",
      outDataName: "searchResult"
    });
  },

});