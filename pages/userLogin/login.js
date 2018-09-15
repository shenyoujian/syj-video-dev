const app = getApp()

Page({
  data: {
  },

  onLoad: function(params) {
    var me = this;
    //获取需要重定向的url
    debugger;
    var redirectUrl = params.redirectUrl;
    redirectUrl = redirectUrl.replace(/#/g, "?");
    redirectUrl = redirectUrl.replace(/@/g, "=");
    me.redirectUrl = redirectUrl;
  },

  //登录，这个e就是form对象，我们可以通过e获取username和password
  doLogin: function(e) {
    var me = this;
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;

    //非空判断
    if (username == null || password == null) {
      //相当于弹窗的一个api，3秒后消失
      wx.showToast({
        title: '用户名和密码不能为空！',
        icon: 'none',
        duration: 3000
      })
    } else { //验证通过，发起请求
      var serverUrl = app.serverUrl;
      //如果请求过慢，后台可以sleep三秒，可以使用显示正在加载
      wx.showLoading({
        title: '请等待....',
      })
      wx.request({
        url: serverUrl + '/login',
        method: 'POST',
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        //当调用成功会有个回调函数,res是后端发回的数据，主要是判断状态码
        success: function(res) {
          console.log(res.data);
          //当成功后隐藏加载
          wx.hideLoading();
          //判断状态码
          var status = res.data.status;
          if (status == 200) {
            wx.showToast({
              title: "登录成功~",
              icon: 'success',
              duration: 2000
            })
            //设置全局对象，类似于cookie
            //app.userInfo = res.data.data;
            //fixme 修改原有的全局变量改为本地缓存
            app.setGlobalUserInfo(res.data.data);

            var redirectUrl = me.redirectUrl;
            if (redirectUrl != null && redirectUrl != '' && redirectUrl != undefined) {
              //需要重定向
              wx.redirectTo({
                url: redirectUrl,
              })
            }else{
              //登录成功，跳转到首页页面,不需要重定向
              wx.redirectTo({
                url: '../index/index',
              })
            }
            
          } else if (status == 500) {
            //失败弹出框
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })

    }
  },

  //关闭当前页面，跳转到注册页面
  goRegistPage: function() {
    wx.redirectTo({
      url: '../userRegist/regist',
    })
  }
})