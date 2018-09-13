const app = getApp()

Page({
  data: {
    cover: "cover",
  },

  //按住搜索跳转到搜索页面
  showSearch: function () {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  }
})


