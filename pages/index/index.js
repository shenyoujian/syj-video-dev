const app = getApp()

Page({
  data: {
    // 用于分页的属性
    totalPage: 1,
    page: 1,
    videoList: [],
    screenWidth: 350,
    serverUrl: "",
    searchContent: ""
  },

  onLoad: function(params) {
    var me = this;

    //调用微信接口获取手机屏幕的宽度
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    //获取搜索页传递的搜索词
    var searchContent = params.search;
    var isSaveRecord = params.isSaveRecord;

    // 空的热搜词我们不需要保存
    if (isSaveRecord == null || isSaveRecord == undefined || isSaveRecord == '') {
      isSaveRecord = 0;
    }
    // 获取当前的分页数
    var page = me.data.page;
    //把从上个页面和系统获取的参数存入到本页面对象里去
    //这样其他方法就获取得到
    me.setData({
      screenWidth: screenWidth,
      searchContent: searchContent
    });
    me.getAllVideoList(page, isSaveRecord);
  },


  //提取公共方法，获取视频列表的方法
  getAllVideoList: function (page, isSaveRecord) {
    var me = this;
    var serverUrl = app.serverUrl;
    //从页面对象里获取
    var searchContent = me.data.searchContent;
    wx.showLoading({
      title: '请等待，加载中...',
    });

    wx.request({
      //添加热搜词和是否保存热搜词参数
      url: serverUrl + '/video/showAll?page=' + page + "&isSaveRecord=" + isSaveRecord,
      method: "POST",
      //我们需要把热搜词变成一个json对象传递过去对应后台的video参数
      data: {
        videoDesc: searchContent,
      },
      success: function(res) {
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
  onReachBottom: function() {
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

    //上拉刷新不需要热搜词
    me.getAllVideoList(page,0);
  },

  //下拉刷新
  onPullDownRefresh: function() {
    //往下拉就有三个点在加载
    wx.showNavigationBarLoading();

    //每次下拉刷新都去找第一页，并且不需要热搜词
    this.getAllVideoList(1,0);
  }


})