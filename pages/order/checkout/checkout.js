/**
 * @author 
 */
import { getOrder,updateOrderInfo,TRANS_TYPE,updateOrderStatus,ORDER_STATUS } from '../../../service/order';
import { getUser } from '../../../service/user';
import { pay } from '../../../service/pay';
// import { getTransFee } from '../../../service/shipping';

const app = getApp();

Page({
  data: {
    user:{},
    types: TRANS_TYPE,
    types_selected:'DELI',
    orderId:'',
    shop:app.globalData.config,
    notes:null,
    count:0,
    amount:0,
    express_fee:null,
    personCountIndex: 0,
    order:{},
    address:null
  },
  onShow(){
    console.log('show',this.data);
    
  },
  onLoad(options) {
    const {orderId,amount,count} = options;
    this.setData({
      orderId,
      amount:Number(amount),
      count:parseInt(count)
    });
    this.getOrder(orderId);
  },
// 获取用户信息
  async getUser(){
    const user = await getUser();
    this.setData({
        user
      })
  },

  async setProfile() {
    await this.getUser();
    const { user, types_selected } = this.data;
    const checkUserInfo = ['nickName', 'phoneNumber'].some(key =>!user[key]);

    // 自提没有设置用户信息提示
    if (types_selected === 'SELF' && checkUserInfo) {
        try {
            const res = await new Promise((resolve, reject) => {
                wx.showModal({
                    title: '提示',
                    content: '自提需要填写手机号姓名，点击确定去填写',
                    success: function (res) {
                        if (res.confirm) {
                            console.log('用户点击了确认');
                            wx.navigateTo({
                                url: `/pages/profile/edit/edit`
                              })
                            resolve(true);
                        } else if (res.cancel) {
                            console.log('用户点击了取消');
                            resolve(false);
                        }
                    },
                    fail: function (err) {
                        reject(err);
                    }
                });
            });

            if (!res) {
                return false;
            }
            // 这里可以添加确认后要执行的代码
        } catch (error) {
            console.error('显示模态框出错:', error);
            return false;
        }
    }
    // 如果没有进入提示框逻辑或者用户点击确认，继续执行后续逻辑
    return true;
  },
  //选择配送方式
  typeChange(e){
    const value = e.detail.value;
    console.log(value);
    this.setData({
        types_selected:value
    });
    this.setProfile();
  },
  // 计算运费
  async getKDFee({shop,address,amount,count}){  
    const { latitude,longitude }  = address;
    const order = {
      lat:latitude,
      long:longitude,
      address,
      weight_kg:1,
      totalSalePrice:amount,
      totalCount:count
    }
    try {
      return await getTransFee({order,shop});
    } catch (e) {
      console.log('运费计算错误',e);
      return null;
    }
  },

  // 调取微信支付
  async payImpl(totalPrice, order) {
    app.globalData.isNeedClearCart = true;
    try {
      await pay({ id: order._id, totalPrice });
      try {
        const res = await updateOrderStatus({ orderId:order._id, status: ORDER_STATUS.TO_SEND });
        console.log('up',res);
        this.toast('支付成功');
      } catch (e) {
        console.log('e',e);
        this.toast('支付成功，但订单状态更新失败');
      } finally {
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      }
    } catch (e) {
        this.toast('支付失败请重试');
        setTimeout(() => {
            wx.redirectTo({
                url: '/pages/order/list/list'
            })
        }, 1000);
    }
  },
//   封装toast避免报错
  toast(message) {
    wx.showToast({
      title: message,
      icon: 'none'
    });
  },
  // 获取订单信息
  async getOrder(orderId){
    const order = await getOrder(orderId);
    console.log('order',order);
    this.setData({
      order
    });
    //地址赋值
    if(order.address){
      this.setData({
        address:order.address
      });
    }
  },

  // 获取订单备注
  getNotes(e) {
    this.setData({
      notes: e.detail.value
    });
    console.log('notes', this.data.notes);
  },

  // 选取地址
  selectAddress() {
    wx.navigateTo({
      url: `/pages/address/list/index?orderId=${this.data.orderId}`
    })
  },
  // 校验订单唤起支付
  async payment() {
   
    
    const {amount,express_fee,orderId,address,notes,types_selected,order} = this.data;

    console.log('ads',this.data);
    if (address === null && types_selected == 'DELI') {
      wx.showModal({
        title: '请先选择一个地址',
        showCancel: false
      })
      return
    }
    wx.showLoading();
    let post_data = { 
        orderId, 
        amount,
        notes,
        is_valid:true,
        trans_type:types_selected
    };
    console.log('address',address);
    if( types_selected == 'DELI' ){
        post_data.addressId = address._id;
       
    }
    console.log('post_data',post_data);
    const add_address = await updateOrderInfo(post_data);
    console.log('add-address',add_address);
    // 更新成功，跳微信支付
    if( add_address.data.count == 1 ){
      const total_price = express_fee?amount:amount+express_fee;
      console.log('total_price',total_price);
      console.log('order',order);
      this.payImpl(total_price, order);
    }else{
      console.log('update failed');
    }
  }
})
