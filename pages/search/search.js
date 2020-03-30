// https://www.cnblogs.com/jiqing9006/p/12191158.html
const app = getApp();
var searchData = null; //[{id:1,name:"project_name",url:"**"}]
var HISTORY_KEY = 'history'
var HOT_KEY = 'hot'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    index_data: {},
    keywords: '',
  },
  // 清理
  clearSearchHistory: function() {
    wx.showModal({
      title: '清理历史',
      content: '确定要清理历史？',
      showCancel: true,
      cancelColor: 'skyblue',
      confirmColor: 'skyblue',
      success: function(res) {

        wx.showToast({
          title: '清理成功',
        })
        this.setData({
          "index_data.history": []
        });
      },
      fail: function(res) {
        wx.showToast({
          title: '清理失败',
        })
      }, //接口调用失败的回调函数
      complete: function(res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
    })
  },
  // 监听输入
  watchSearch: function(event) {
    console.log(event.detail.value);
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
      return wx.showToast({
        title: "搜索内容不能为空～",
        icon: 'none',
        duration: 2000,
      });

    }
    this.updateHistory(keywords)

    var isValidKeyword = false
    for (var i = 0; i < searchData.length; i++) {
      var item = searchData[i]
      if (item['name'] == keywords) {
        isValidKeyword = true
      }
    }

    if (isValidKeyword) {

      wx.navigateBack();
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1];   //当前页面
      var prevPage = pages[pages.length - 2];  //上一个页面

      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        searchKey: keywords
      })
    } else {
      wx.redirectTo({
        url: "../searchResult/searchResult?keywords=" + keywords
      });
    }
  },

  updateHistory: function(keywords) {

    var list = wx.getStorageSync(HISTORY_KEY)
    if (list == null || list == '') {
      list = []
    }
    var newList = []
    newList.push(keywords)

    for (var i = 0; i < list.length; i++) {
      if (list[i] != keywords) {
        newList.push(list[i])
      }
    }

    wx.setStorageSync(HISTORY_KEY, newList)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 展示
   */
  onShow: function(options) {
    const uid = app.globalData.uid;
    console.log(uid);
    setTimeout(() => {
      this.setData({
        wo_title: app.globalData.wo_title,

        "index_data.history": wx.getStorageSync(HISTORY_KEY),
        "index_data.hot": ['青年金色佳苑', '燕西华府家园', '畅茜园馥霞里','花樊雅苑']
      });
    }, 300);

    wx.getStorage({
      key: 'search_data',
      success: function(res) {
        searchData = res.data
        console.log("get storage:", res)
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});