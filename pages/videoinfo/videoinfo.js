const app = getApp()
//引入
var videoUtil = require('../../utils/videoUtil.js')
Page({
  data: {
    cover: "cover", //是否进行拉伸
    videoId: "",
    src: "",
    videoInfo: {},

    userLikeVideo: false,
  },
  videoCtx: {},
  onLoad: function (params) {
    var me = this;
    me.videoCtx = wx.createVideoContext("myVideo", this);
    //获取上一个页面传入的参数，并且把字符串解析成json对象,因为需要
    //把视频相关的信息存入页面的data里
    var videoInfo = JSON.parse(params.videoInfo);
    // debugger;
    var videoHeight = videoInfo.videoHeight;
    var videoWidth = videoInfo.videoWidth;
    var cover = "cover";
    if (videoWidth >= videoHeight) {
      cover: "";
    }

    me.setData({
      videoId: videoInfo.id,
      src: app.serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
    })

    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var loginUserId = "";
    if (user != null && user != undefined && user != '') {
      loginUserId = user.id;
    }
    wx.request({
      url: serverUrl + '/user/queryPublisher?loginUserId=' + loginUserId + "&videoId=" + videoInfo.id + "&publishUserId=" + videoInfo.userId,
      method: 'POST',
      success: function (res) {
        console.log(res.data);

        var publisher = res.data.data.publisher;
        var userLikeVideo = res.data.data.userLikeVideo;

        me.setData({
          serverUrl: serverUrl,
          publisher: publisher,
          userLikeVideo: userLikeVideo
        });
      }
    })



  },

  onShow: function () {
    var me = this;
    me.videoCtx.play();
  },

  onHide: function () {
    var me = this;
    me.videoCtx.pause();
  },

  showPublisher: function () {
    var me = this;

    var user = app.getGlobalUserInfo();

    var videoInfo = me.data.videoInfo;
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;
    debugger;
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + videoInfo.userId,
      })
    }

  },

  upload: function () {
    var me = this;
    //页面拦截，当没登陆观看视频后点击upload上传视频的时候进行拦截
    var user = app.getGlobalUserInfo();

    //当没登录点击上传之后跳转到登录登录页面，重新登录之后会跳到
    //首页而不是用户之前观看的视频页，所以这里使用重定向使用户登录之后跳转到之前观看的视频页
    //重定向主要就是把需要重定向的地址传递给首页让首页去自动跳转
    //而重定向的地址需要知道是哪个视频所以需要之前首页传递过来的videoInfo再传递过去
    var videoInfo = JSON.stringify(me.data.videoInfo);
    //重定向的地址
    var realUrl = "../videoInfo/videoInfo#videoInfo@" + videoInfo;


    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        //接着把重定向的地址传递给登录页面
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo();
    }
  },


  //按住搜索跳转到搜索页面
  showSearch: function () {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },


  showIndex: function () {
    wx.navigateTo({
      url: '../index/index',
    })
  },

  showMine: function () {

    //页面拦截，当没登陆观看视频后点击showme要看个人信息的时候进行拦截
    var user = app.getGlobalUserInfo();
    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }

  },

  //点赞与取消点赞
  likeVideoOrNot: function () {
    var me = this;
    var user = app.getGlobalUserInfo();
    debugger;
    var userLikeVideo = me.data.userLikeVideo;
    var videoInfo = me.data.videoInfo;
    var serverUrl = app.serverUrl;
    var url = '';
    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../UserLogin/login',
      })
    } else {
      url = "/video/userLike?userId=" + user.id + "&videoId=" + videoInfo.id +
        "&videoCreaterId=" + videoInfo.userId;
      if (userLikeVideo) {
        url = "/video/userUnLike?userId=" + user.id + "&videoId=" + videoInfo.id +
          "&videoCreaterId=" + videoInfo.userId;
      }
    }
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: serverUrl + url,
      method: 'POST',
      header: {
        'content-type': 'application/json', // 默认值
        //用于验证的安全信息
        'userId': user.id,
        'userToken': user.userToken,
      },
      success: function (res) {
        wx.hideLoading();
        me.setData({
          userLikeVideo: !userLikeVideo,
        })
      }
    })

  },

  //下载和举报功能
  shareMe: function () {
    var me = this;
    var user = app.getGlobalUserInfo();

    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
      success: function (res) {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          // 下载
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url: app.serverUrl + me.data.videoInfo.videoPath,
            success: function (res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                console.log(res.tempFilePath);

                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function (res) {
                    console.log(res.errMsg)
                    wx.hideLoading();
                  }
                })
              }
            }
          })
        } else if (res.tapIndex == 1) {
          // 举报
          var videoInfo = JSON.stringify(me.data.videoInfo);
          var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;

          if (user == null || user == undefined || user == '') {
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl=' + realUrl,
            })
          } else {
            var publishUserId = me.data.videoInfo.userId;
            var videoId = me.data.videoInfo.id;
            var currentUserId = user.id;
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + "&publishUserId=" + publishUserId
            })
          }
        } else {
          wx.showToast({
            title: '官方暂未开放...',
          })
        }
      }
    })
  },

  //转发视频
  onShareAppMessage: function (res) {
    var me = this;
    var videoInfo = me.data.videoInfo;
    return {
      title: "短视频内容分享",
      path: "pages/videoInfo/videoInfo?videoInfo=" + videoInfo,
    }
  },

  //跳转到留言
  leaveComment: function () {
    var me = this;
    //先数据绑定当点就留言按钮就把光标定位到留言的地方
    me.setData({
      commentFocus: true,
    })
  },

  //发布留言
  saveComment: function (e) {
    var me = this;
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    if (user == null || user == '' || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      //视频id，评论内容，留言者id
      var videoId = me.data.videoInfo.id;
      var comment = e.detail.value;
      var fromUserId = user.id;
      if (comment == '' || comment == undefined || comment == null) {
        wx.showToast({
          title: '留言不能为空...',
        })
      } else {
        wx.request({
          url: serverUrl + '/video/saveComment',
          method: 'POST',
          header: {
            'content-type': 'application/json', // 默认值
            //用于验证的安全信息
            'userId': user.id,
            'userToken': user.userToken,
          },
          //后台需要的参数是对象
          data: {
            videoId: videoId,
            comment: comment,
            fromUserId: fromUserId,
          },
          success: function (res) {
            console.log(res.data.msg);
          }
        })
      }
    }
  }




})