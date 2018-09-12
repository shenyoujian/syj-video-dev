const app = getApp()

Page({
  data: {
    // 用于分页的属性
    totalPage: 1,
    page: 1,
    videoList: [],


    screenWidth: 350,
    serverUrl: ""
  },

  onLoad: function(params) {
    var me = this;
    //调用微信接口获取手机屏幕的宽度
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
    });

    // 获取当前的分页数
    var page = me.data.page;
    var serverUrl = app.serverUrl;

    wx.showLoading({
      title: '请等待，加载中...',
    })

    //开始请求后端
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page,
      method: 'POST',
      success: function(res) {
        wx.hideLoading();

        console.log(res.data);

        // 判断当前是否是第一页，如果是第一页那么videoList为空
        if (page == 1) {
          me.setData({
            videoList: []
          });
        }

        //从后台请求到的视频列表
        var videoList = res.data.data.rows;
        //本来的视频列表
        var newvideoList = me.data.videoList;

        me.setData({
          videoList: newvideoList.concat(videoList),
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        });
      }
    })
  }

})