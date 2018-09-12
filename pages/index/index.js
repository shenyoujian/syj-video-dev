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
    me.getAllVideoList(page);
  },


  //提取公共方法，获取视频列表的方法
  getAllVideoList: function (page) {
    var me = this;
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待，加载中...',
    });

    wx.request({
      url: serverUrl + '/video/showAll?page=' + page,
      method: "POST",
      success: function (res) {
        wx.hideLoading();
        //当调用成功后，导航条停止加载
        wx.hideNavigationBarLoading();
        //三个点也消失
        wx.stopPullDownRefresh();

        console.log(res.data);

        // 判断当前页page是否是第一页，如果是第一页，那么设置videoList为空
        if (page === 1) {
          me.setData({
            videoList: []
          });
        }

        var videoList = res.data.data.rows;
        var newVideoList = me.data.videoList;

        me.setData({
          videoList: newVideoList.concat(videoList),
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        });

      }
    })
  },

  //上拉分页
  onReachBottom: function () {
    var me = this;
    var currentPage = me.data.page;
    var totalPage = me.data.totalPage;

    // 判断当前页数和总页数是否相等，如果想的则无需查询
    if (currentPage === totalPage) {
      wx.showToast({
        title: '已经没有视频啦~~',
        icon: "none"
      })
      return;
    }

    var page = currentPage + 1;

    me.getAllVideoList(page);
  },

  //下拉刷新
  onPullDownRefresh:function(){
    //往下拉就有三个点在加载
    wx.showNavigationBarLoading();

    //每次下拉刷新都去找第一页
    this.getAllVideoList(1);
  }


})