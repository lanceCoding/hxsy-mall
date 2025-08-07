import { updateUser,getUser } from '../../../service/user';

Page({

  data: {
    user:{},
    phone: ''
  },
  async onLoad() {
    const user = await getUser();
    this.setData({
        user
      })
  },
 showToast(str){
  wx.showToast({
    title: str,
    icon: 'none',
    duration: 600
  })
 },
  async savePhone(e) {
    console.log(e.detail.value);
    const {phone,name} = e.detail.value;
    if(phone.length!=11){
      this.showToast('手机号格式错误');
      return
    }
    wx.showLoading();
    const {_id} = this.data;
    const res = await updateUser({ uid:_id, data:{ phoneNumber:phone,nickName:name } });
    console.log('res',res);
    if( res.nickName == name && res.phoneNumber == phone ){
        this.showToast('设置成功');
        wx.navigateBack({
            delta: 1 // 表示返回上一级，如果delta大于1则表示返回多级
        });
    }
  }
})