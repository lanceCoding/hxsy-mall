import { getUser } from '../../service/user';

Page({
    /**
     * 页面的初始数据
     */
    data: {
      user:{}
    },
    onLoad() {
       this.getUserInfo();
    },
    onShow(){
      this.getUserInfo();
    },
    async getUserInfo(){
      const user = await getUser();
      this.setData({
          user
        })
    },
  // 登录监听
  chooseAvatar(e) {
    this.setData({
      login: {
        show: true,
        line:true,
        avatar: e.detail.avatarUrl,
      }
    })
  },
  // 地址管理
  addressList() {
    wx.navigateTo({
        url: '/pages/address/list/index'
    })
  },
   // 地址管理
   orderList() {
    wx.navigateTo({
        url: '/pages/order/list/list'
    })
  },
  // 修改手机
  phoneEdit() {
    wx.navigateTo({
        url: '/pages/profile/edit/edit'
    })
  }
})