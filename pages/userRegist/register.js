// pages/userRegist/register.js
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
        success:function(res){
          console.log(res.data);
        }
      })

    }

  }
})