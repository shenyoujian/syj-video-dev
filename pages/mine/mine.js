//引入
var videoUtil = require('../../utils/videoUtil.js')
const app = getApp()

Page({
  data: {
    faceUrl: "../resource/images/noneface.png",
    isMe: true,
    isFollow: false,

    //作品收藏关注的样式
    videoSelClass: "video-info",
    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

    //作品收藏关注初始化列表
    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    //是否隐藏，false为不隐藏，true为隐藏
    myWorkFalg: false,
    myLikesFalg: true,
    myFollowFalg: true

  },

  logout: function () {
    //首先获取全局的userinfo和服务端地址
    //var user = app.userInfo;
    //fixme使用本地缓存替换全局变量
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待...',
    })
    //请求logout并且把user的id发送给服务端
    wx.request({
      url: serverUrl + '/logout?userId=' + user.id,
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },

      //请求成功后，调用回调函数，res是服务端返回的数据
      success: function (res) {
        wx.hideLoading();
        console.log(res.data);
        var status = res.data.status;
        if (status == 200) {
          wx.showToast({
            title: '注销成功~',
            icon: 'success',
            duration: 2000
          })
          //注销之后，清空缓存
          //app.userInfo = null;
          wx.removeStorageSync("userInfo");
          //跳转到登录页面
          wx.redirectTo({
            url: '../userLogin/login',
          });
        }
      }
    })

  },


  //上传图片
  changeFace: function () {

    //在回调函数中不能使用this当前对象去获取初始化数据，因为在success回调函数当前对象中已经改变，这里先保存到一个变量中以供回调函数使用
    var me = this;
    //fixme使用本地缓存修改全局变量
    var userInfo = app.getGlobalUserInfo();

    //选择本地照片
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 指定压缩图
      sourceType: ['album'], // 指定从相册获取
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths);
        wx.showLoading({
          title: '上传中...',
        })

        //上开始请求服务端上传图片
        var serverUrl = app.serverUrl;

        wx.uploadFile({
          url: serverUrl + "/user/uploadFace?userId=" + userInfo.id, //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'content-type': 'application/json', // 默认值
            //安全验证
            'userId': userInfo.id,
            'userToken': userInfo.userToken
          },
          success: function (res) {
            //微信说明uploadFile返回的是String而不是json，所以需要转换不然不能使用键去获取对应的值
            //现在下面可以不使用res
            //var data = res.data;
            var data = JSON.parse(res.data);
            console.log(data);
            wx.hideLoading();
            if (data.status == 200) {
              wx.showToast({
                title: '上传成功~',
                icon: 'success',
              });

              // 上次成功后更新小程序头像，使用springboot的静态资源
              var imageUrl = data.data;
              //不能使用this
              me.setData({
                faceUrl: serverUrl + imageUrl,
              })

            } else if (data.status == 500) {
              wx.showToast({
                title: data.msg,
              });
            } else if (data.status == 502) {
              wx.showToast({
                title: data.msg,
                success: function () {
                  wx.redirectTo({
                    url: '../userLogin/login',
                  })
                }
              });
            }
            //do something
          }

        })


      }
    })
  },


  //当加载用户页面的时候显示用户信息
  onLoad: function (params) {
    //回调函数里的当前对象已经改变，需要提前保存在变量里
    var me = this;
    //var user = app.userInfo;
    var serverUrl = app.serverUrl;
    //fixme使用本地缓存修改全局变量
    var user = app.getGlobalUserInfo();
    var userId = user.id;
    //从视频页传递过来
    var publisherId = params.publisherId;
    debugger;
    //如果有发布者id就设置发布者id
    if (publisherId != null && publisherId != '' && publisherId != undefined &&
      publisherId != userId) {
      userId = publisherId;
      me.setData({
        isMe: false,
        publisherId: publisherId,
        serverUrl: app.serverUrl
      })
    }
    //否则设置用户id
    me.setData({
      userId: userId
    })

    wx.showLoading({
      title: '请等待...',
    })

    //请求query并且把user的id发送给服务端
    wx.request({
      url: serverUrl + '/user/query?userId=' + userId + '&fanId=' + user.id,
      method: 'POST',
      header: {
        'content-type': 'application/json', // 默认值
        //用于验证的安全信息
        'userId': user.id,
        'userToken': user.userToken,
      },

      //请求成功后，调用回调函数，res是服务端返回的数据
      success: function (res) {
        wx.hideLoading();
        console.log(res.data);
        var status = res.data.status;
        if (status == 200) {
          var userInfo = res.data.data;
          var faceUrl = "../resource/images/noneface.png";
          if (userInfo.faceImage != null && userInfo.faceImage != '' && userInfo.faceImage != undefined) {
            faceUrl = serverUrl + userInfo.faceImage;
          }

          me.setData({
            faceUrl: faceUrl,
            fansCounts: userInfo.fansCounts,
            followCounts: userInfo.followCounts,
            receiveLikeCounts: userInfo.receiveLikeCounts,
            nickname: userInfo.nickname,
            isFollow: userInfo.follow,
          });


        } else if (status == 502) {
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: "none",
            success: function () {
              wx.redirectTo({
                url: '../userLogin/login',
              })
            }
          })
        }
      }

    })
    //初始化
    me.getMyVideoList(1);
  },


  followMe: function (e) {
    var me = this;

    var user = app.getGlobalUserInfo();
    var userId = user.id;
    var publisherId = me.data.publisherId;
    // 1：关注 0：取消关注
    var followType = e.currentTarget.dataset.followtype;


    var url = '';
    if (followType == '1') {
      url = '/user/beyourfans?userId=' + publisherId + '&fanId=' + userId;
    } else {
      url = '/user/dontbeyourfans?userId=' + publisherId + '&fanId=' + userId;
    }

    wx.showLoading();
    wx.request({
      url: app.serverUrl + url,
      method: 'POST',
      header: {
        'content-type': 'application/json', // 默认值
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function () {
        wx.hideLoading();
        if (followType == '1') {
          me.setData({
            isFollow: true,
            fansCounts: ++me.data.fansCounts
          })
        } else {
          me.setData({
            isFollow: false,
            fansCounts: --me.data.fansCounts
          })
        }
      }
    })
  },


  //上传视频，先上传到微信的临时路径
  uploadVideo: function () {
    videoUtil.uploadVideo();
    // var me = this;
    // wx.chooseVideo({
    //   sourceType: ['album'],
    //   success: function (res) {
    //     console.log(res);
    //     // 获取你上传视频的信息
    //     var duration = res.duration;   //选定视频的时间长度
    //     var tmpHeight = res.height;    //返回选定视频的长
    //     var tmpWidth = res.width;      //返回选定视频的宽
    //     var tmpVideoUrl = res.tempFilePath;   //选定视频的临时文件路径
    //     var tmpCoverUrl = res.thumbTempFilePath;  //图片资源路径

    //     //接着简单判断
    //     if (duration > 10) {
    //       wx.showToast({
    //         title: '视频长度不能超过10秒...',
    //         icon: "none",
    //         duration: 2500
    //       })
    //     } else if (duration < 1) {
    //       wx.showToast({
    //         title: '视频长度太短，请上传超过1秒的视频...',
    //         icon: "none",
    //         duration: 2500
    //       })
    //     } else {
    //       // 判断成功后，打开选择bgm的页面,并且把该页面上传的视频参数给带过去，记得&拼接
    //       wx.navigateTo({
    //         url: '../chooseBgm/chooseBgm?duration=' + duration
    //           + "&tmpHeight=" + tmpHeight
    //           + "&tmpWidth=" + tmpWidth
    //           + "&tmpVideoUrl=" + tmpVideoUrl
    //           + "&tmpCoverUrl=" + tmpCoverUrl
    //         ,
    //       })
    //     }
    //   }
    // })
  },


  doSelectWork: function () {
    var me = this;
    me.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",

      myWorkFalg: false,
      myLikesFalg: true,
      myFollowFalg: true,
      

      //每次都要初始化
      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    }) 

    me.getMyVideoList(1);
  },

  doSelectLike: function () {
    var me = this;
    me.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      //每次都要初始化
      myWorkFalg: true,
      myLikesFalg: false,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    })

    me.getMyLikesList(1);
  },

  doSelectFollow: function () {
    var me = this;
    me.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      //每次都要初始化
      myWorkFalg: true,
      myLikesFalg: true,
      myFollowFalg: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    })

    me.getMyFollowList(1)
  },


  getMyVideoList: function (page) {
    var me = this;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showAll/?page=' + page + '&pageSize=6',
      method: "POST",
      data: {
        userId: me.data.userId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var myVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.myVideoList;
        me.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyLikesList: function (page) {
    var me = this;
    var userId = me.data.userId;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyLike/?userId=' + userId + '&page=' + page + '&pageSize=6',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var likeVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.likeVideoList;
        me.setData({
          likeVideoPage: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },

  getMyFollowList: function (page) {
    var me = this;
    var userId = me.data.userId;

    // 查询视频信息
    wx.showLoading();
    // 调用后端
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/showMyFollow/?userId=' + userId + '&page=' + page + '&pageSize=6',
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data);
        var followVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.followVideoList;
        me.setData({
          followVideoPage: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },


  // 点击跳转到视频详情页面
  showVideo: function (e) {

    console.log(e);
    debugger;
    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      var videoList = this.data.myVideoList;
    } else if (!myLikesFalg) {
      var videoList = this.data.likeVideoList;
    } else if (!myFollowFalg) {
      var videoList = this.data.followVideoList;
    }

    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoInfo/videoInfo?videoInfo=' + videoInfo
    })

  },

})