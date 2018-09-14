const app = getApp()
//引入
var videoUtil = require('../../utils/videoUtil.js')
Page({
  data: {
    cover: "cover",
  },
  videoCtx:{},
  onLoad:function(){
    var me = this;
    me.videoCtx = wx.createVideoContext("myVideo", this);
  },

  onShow:function () {
    var me = this;
    me.videoCtx.play();
  },

  onHide: function () {
    var me = this;
    me.videoCtx.pause();
  },

  upload:function(){
    videoUtil.uploadVideo();
  },

  //按住搜索跳转到搜索页面
  showSearch: function () {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  }
})


