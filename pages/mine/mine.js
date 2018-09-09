const app = getApp()

Page({
      data: {
        faceUrl: "../resource/images/noneface.png",

      },

      logout: function() {
        //首先获取全局的userinfo和服务端地址
        var user = app.userInfo;
        var serverUrl = app
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
          success: function(res) {
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
              app.userInfo = null;
              //跳转到登录页面
              wx.redirectTo({
                url: '../userLogin/login',
              });
            }
          }
        })

      },


      //上传图片
      changeFace: function() {

        //在回调函数中不能使用this当前对象去获取初始化数据，因为在success回调函数当前对象中已经改变，这里先保存到一个变量中以供回调函数使用
        var me = this;

        //选择本地照片
        wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['compressed'], // 指定压缩图
          sourceType: ['album'], // 指定从相册获取
          success: function(res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            var tempFilePaths = res.tempFilePaths
            console.log(tempFilePaths);
            wx.showLoading({
              title: '上传中...',
            })

            //上开始请求服务端上传图片
            var serverUrl = app.serverUrl;

            wx.uploadFile({
              url: serverUrl + "/user/uploadFace?userId=" + app.userInfo.id, //仅为示例，非真实的接口地址
              filePath: tempFilePaths[0],
              name: 'file',
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function(res) {
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
                }
                //do something
              }

            })


          }
        })
      },


      //当加载用户页面的时候显示用户信息
      onLoad: function() {
        //回调函数里的当前对象已经改变，需要提前保存在变量里
        var me = this;
        var user = app.userInfo;
        var serverUrl = app.serverUrl;

        wx.showLoading({
          title: '请等待...',
        })

        //请求query并且把user的id发送给服务端
        wx.request({
          url: serverUrl + '/user/query?userId=' + user.id,
          method: 'POST',
          header: {
            'content-type': 'application/json' // 默认值
          },

          //请求成功后，调用回调函数，res是服务端返回的数据
          success: function(res) {
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
                isFollow: userInfo.follow

              });


            }
          }

        })
      },
})