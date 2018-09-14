//上传视频，先上传到微信的临时路径
//因为mine页面和视频播放页面都有上传视频按钮所以提取出来做一个公共方法
function uploadVideo() {
  var me = this;
  wx.chooseVideo({
    sourceType: ['album'],
    success: function(res) {
      console.log(res);
      // 获取你上传视频的信息
      var duration = res.duration; //选定视频的时间长度
      var tmpHeight = res.height; //返回选定视频的长
      var tmpWidth = res.width; //返回选定视频的宽
      var tmpVideoUrl = res.tempFilePath; //选定视频的临时文件路径
      var tmpCoverUrl = res.thumbTempFilePath; //图片资源路径

      //接着简单判断
      if (duration > 10) {
        wx.showToast({
          title: '视频长度不能超过10秒...',
          icon: "none",
          duration: 2500
        })
      } else if (duration < 1) {
        wx.showToast({
          title: '视频长度太短，请上传超过1秒的视频...',
          icon: "none",
          duration: 2500
        })
      } else {
        // 判断成功后，打开选择bgm的页面,并且把该页面上传的视频参数给带过去，记得&拼接
        wx.navigateTo({
          url: '../chooseBgm/chooseBgm?duration=' + duration +
            "&tmpHeight=" + tmpHeight +
            "&tmpWidth=" + tmpWidth +
            "&tmpVideoUrl=" + tmpVideoUrl +
            "&tmpCoverUrl=" + tmpCoverUrl,
        })
      }
    }
  })
}


//导入
module.exports = {
  uploadVideo:uploadVideo
}

