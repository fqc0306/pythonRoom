// https://www.cnblogs.com/jiqing9006/p/12191158.html
const app = getApp();
var searchData = null;//[{id:1,name:"project_name",url:"**"}]
Page({
  /**
   * 页面的初始数据
   */
  data: {
    index_data: {
      'history': ['1', '2'],
      'hot': ['12', '22']
    },
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
    console.log(keywords);
    if (keywords == '') {
      return tips.showMsg("请输入要搜索的内容");
    }
    wx.navigateTo({
      url: "../searchResult/searchResult?keywords=" + keywords
    });
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
        wo_title: app.globalData.wo_title
      });
    }, 300);

    wx.getStorage({
      key: 'search_data',
      success: function (res) {
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