//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    listData: [
      { code: "01", text: "text1", type: "type1" },
      { code: "02", text: "text2", "type": "type2" },
      { "code": "03", "text": "text3", "type": "type3" }
    ]
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
      var infos = res.result.split('\n')[1]
      var jsonArry = {}
      var i = 0
      
      for (i = 0; i < infos.split(',').length; i++) {
        var codeKey = "code"
        var code = infos.split(',')[0]
        var textKey = "text"
        var text = infos.split(',')[1]
        var typeKey = "type"
        var type = infos.split(',')[2]
        var json = {
        }
        jsonArry[codeKey] = code
        jsonArry[textKey] = text
        jsonArry[typeKey] = type
      }
      that.data.listData.push(jsonArry)
      console.log('jsonArry:', jsonArry)
      that.setData({
        listData: that.data.listData
      })
      console.log('[downloadFile] success result：', res)
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