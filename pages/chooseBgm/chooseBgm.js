const app = getApp()

Page({
  data: {
    bgmList: [],
    serverUrl: "",
    //为了接收前一个页面传递过来的数据，需要先定义一个参数变量数组
    videoParams: {}
  },

  //params是从前一个页面传过来的参数
  onLoad: function(params) {

    var me = this;
    console.log(params);
    me.setData({
      //设置之后就可以在该对象里的任何方法获取这些参数
      videoParams: params
    });

    wx.showLoading({
      title: '请等待...',
    });
    var serverUrl = app.serverUrl;
    var user = app.userInfo;
    // 调用后端
    wx.request({
      url: serverUrl + '/bgm/list',
      method: "POST",
      header: {
        'content-type': 'application/json', // 默认值
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 200) {
          var bgmList = res.data.data;
          me.setData({
            bgmList: bgmList,
            serverUrl: serverUrl
          });
        }
      }
    })
  },

  //点击上传视频,e是当选择上传按钮后可以把页面的值获取到
  upload: function(e) {
    //当前对象
    var me = this;
    //获取bgmId和描述，获取页面的值为e.detail.value.{name}
    var bgmId = e.detail.value.bgmId;
    var desc = e.detail.value.desc;

    //接着获取前一个页面传递过来的数值
    var duration = me.data.videoParams.duration;
    var tmpHeight = me.data.videoParams.tmpHeight;
    var tmpWidth = me.data.videoParams.tmpWidth;
    var tmpVideoUrl = me.data.videoParams.tmpVideoUrl;
    var tmpCoverUrl = me.data.videoParams.tmpCoverUrl;

    //开始上传短视频
    wx.showLoading({
      title: '上传中...',
    })

    //开始请求服务端上传视频
    var serverUrl = app.serverUrl;

    wx.uploadFile({
      //之前是使用query所以需要在url后面加?参数，这样在网络传输不好，而且desc还有中文，可以使用formdata把这些参数封装进去
      //url: serverUrl + "/video/upload?userId=" + app.userInfo.id, 
      url: serverUrl + "/video/upload",
      formData: {
        userId: app.userInfo.id,
        bgmId: bgmId,
        videoSeconds: duration,
        videoHeight: tmpHeight,
        videoWidth: tmpWidth,
        desc: desc,
      },
      filePath: tmpVideoUrl,
      name: 'file', //这个file需要和我们后端的参数名字所对应
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        //微信说明uploadFile返回的是String而不是json，所以需要转换不然不能使用键去获取对应的值
        // var data = res.data;
        var data = JSON.parse(res.data);
        wx.hideLoading();
        if (data.status == 200) {

          wx.showToast({
            title: '上传成功~',
            icon: 'success',
          });
          //成功后跳转到个人信息页面
          wx.navigateBack({
            delta:1,
          })
          //因为微信没有视频封面对应的属性，所以只能我们自己在后台使用ffmpeg截图
          //   //上传视频成功后上传视频封面
          //   //ok里传递过来的id
          //   var videoId = data.data;
          //   wx.showLoading({
          //     title: '上传中...',
          //   })
          //   wx.uploadFile({
          //     url: serverUrl + "/video/uploadCover",
          //     formData: {
          //       userId: app.userInfo.id,
          //       videoId: videoId,
          //     },
          //     filePath: tmpCoverUrl,
          //     name: 'file', //这个file需要和我们后端的参数名字所对应
          //     header: {
          //       'content-type': 'application/json' // 默认值
          //     },
          //     success: function(res) {
          //       //微信说明uploadFile返回的是String而不是json，所以需要转换不然不能使用键去获取对应的值
          //       //var data = res.data;
          //       var data = JSON.parse(res.data);
          //       wx.hideLoading();
          //       if (data.status == 200) {
          //         wx.showToast({
          //           title: '上传成功~',
          //           icon: 'success',
          //         });
          //         //封面也上传成功后跳转到个人页面
          //         wx.navigateBack({
          //           delta:1,
          //         })
          //       }else{
          //         wx.showToast({
          //           title: '封面上传失败~',
          //           icon: 'none',
          //         });
          //       }
          //     }

          //   })
          // }else{
          //   wx.showToast({
          //     title: '视频上传失败~',
          //     icon: 'none',
          //   });
          // }
        }
      }

    })


  }


})