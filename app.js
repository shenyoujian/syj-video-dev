//app.js
App({
  //定义后端服务器的路径,手机和服务端不同机子必须使用内网穿透，不能使用这种ip
  serverUrl: "http://localhost:8081",
  //定义为全局用户信息,这个设置在微信关闭之后就没有了
  //当微信重启后在点击小程序还是需要我们去登录，我们可以使用本地缓存来
  //解决这个问题
  userInfo: null,

  //使用本地缓存

  setGlobalUserInfo: function(user){
    //使用同步方法不需要回调函数
    wx.setStorageSync("userInfo", user);
  },

  getGlobalUserInfo: function () {
    //使用同步方法不需要回调函数
    return wx.getStorageSync("userInfo");
  },

  reportReasonArray: [
    "色情低俗",
    "政治敏感",
    "涉嫌诈骗",
    "辱骂谩骂",
    "广告垃圾",
    "诱导分享",
    "引人不适",
    "过于暴力",
    "违法违纪",
    "其它原因"
  ]
})