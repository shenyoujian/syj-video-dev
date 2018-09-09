const app = getApp()

Page({
  data: {

  },

  //这个e就是form对象，我们可以通过e获取username和password
  doRegist: function(e) {
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;

    //简单非空验证
    if (username.length == 0 || password.length == 0) {
      //相当于弹窗的一个api，3秒后消失
      wx.showToast({
        title: '用户名或密码不能为空',
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
        url: serverUrl + '/regist',
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
          //请求成功，隐藏加载
          wx.hideLoading();
          //判断状态码
          var status = res.data.status;
          if (status == 200) {
            wx.showToast({
              title: "用户注册成功~",
              icon: 'none',
              duration: 3000
            })
            //设置全局对象，类似于cookie
            app.userInfo = res.data.data;
            //注册成功，跳转到个人页面
            wx.redirectTo({
              url: '../mine/mine',
            })
          } else if (status == 500) {
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

  //保留当前页面，返回登录页面
  goLoginPage: function(){
    wx.navigateTo({
      url: '../userLogin/login',
    })
  }
})