import { getAllAddress,createAddress,updateAddress,deleteAddress } from '../../../service/address';

Page({

  data: {
    uid:'',
    address: '',
    latitude:0,
    longitude:0,
    name: '',
    phone: '',
    addressId:'',
    myregion: [],
    checked:false
  },
  /**

   * 生命周期函数--监听页面加载

   */
  onPullDownRefresh: function () {
    this.onRefresh();
},

  onRefresh:function(){
    //导航条加载动画
    wx.showNavigationBarLoading();
    setTimeout(function () {
      wx.hideNavigationBarLoading();
      //停止下拉刷新
      wx.stopPullDownRefresh();
    }, 2000);
  },
  onLoad: function(options) {
    console.log('ld',options);
    const { uid } = options;
    //新建地址
    if( uid !== undefined ){
      this.setData({
          uid,
          myregion:["省", "市", "区"]
      })
      console.log('uid',this.data.uid);
    }else{
      // 编辑地址
      const { name,address,phone,_id,location } = options;
      this.setData({
        name,
        address,
        phone,
        addressId:_id,
        myregion:location.split('/')
    })
    }
  },
  
  bindTransportDayChange: function(e) {
    console.log('picker country 发生选择改变，携带值为', e.detail.value);
    this.setData({
      transportIndex: e.detail.value
    })
  },
  bindRegionChange:function(e){
    console.log(e)    //查看事件返回值
    this.setData({
        myregion:e.detail.value
    })    //重新复制给myregion
  },
 showToast(str){
  wx.showToast({
    title: str,
    icon: 'none',
    duration: 600
  })
 },

  async saveAddress(e) {
    const { longitude,latitude} = this.data;
    const {name,phone,address} = e.detail.value;
    if(name==''){
       this.showToast('请输入姓名');
        return
    }
    if(phone==''){
      this.showToast('请输入手机号');
      return
    }
    if(address==''){
      this.showToast('请输入详细地址');
      return
    }
    if(phone.length!=11){
      this.showToast('手机号格式错误');
      return
    }
    const location = this.data.myregion.join('/');
    const {uid} = this.data;
    let action, failedMessage;
    if(uid.length > 0){
      let post_data = { name, address, phone,location,uid };
    //   如果经纬度更新
      if( latitude > 0 && longitude > 0 ){
        post_data.latitude = latitude;
        post_data.longitude = longitude;
      }
      // 新增
      action = () =>  createAddress(post_data);
      failedMessage = '添加地址失败，请稍候重试';
    }else{
      let post_data = { name, address, phone, _id:this.data.addressId,location };
      //   如果经纬度更新
      if( latitude > 0 && longitude > 0 ){
        post_data.latitude = latitude;
        post_data.longitude = longitude;
      }
      //更新
      console.log('post_data',post_data);
      action = () =>  updateAddress(post_data);
      failedMessage = '修改地址失败，请稍候重试';
    }

    try {
      await action();
      wx.navigateBack({ delta: 1 });
    } catch {
      this.showToast(failedMessage);
    }
  }
})