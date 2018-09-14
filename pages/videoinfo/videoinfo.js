const app = getApp()
//引入
var videoUtil = require('../../utils/videoUtil.js')
Page({
  data: {
    cover: "cover", //是否进行拉伸
    videoId: "",
    src: "",
    videoInfo: {},
  },
  videoCtx: {},
  onLoad: function(params) {
    var me = this;
    me.videoCtx = wx.createVideoContext("myVideo", this);
    //获取上一个页面传入的参数，并且把字符串解析成json对象,因为需要
    //把视频相关的信息存入页面的data里
    var videoInfo = JSON.parse(params.videoInfo);
    debugger;
    var videoHeight = videoInfo.videoHeight;
    var videoWidth = videoInfo.videoWidth;
    var cover = "cover",
    if (videoWidth > videoHeight) {
      cover: "";
    }

    me.setData({
      videoId: videoInfo.id,
      src: app.serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
    })

  },

  onShow: function() {
    var me = this;
    me.videoCtx.play();
  },

  onHide: function() {
    var me = this;
    me.videoCtx.pause();
  },

  upload: function() {
    videoUtil.uploadVideo();
  },

  //按住搜索跳转到搜索页面
  showSearch: function() {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },


  showIndex: function() {
    wx.navigateTo({
      url: '../index/index',
    })
  }
})