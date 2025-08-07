import { getUser } from '../../../service/user';
import { getAllAddress,deleteAddress } from '../../../service/address';

Page({
  data: {
    user:{},
    list:[],
    orderId:''
  },
  onLoad: function (options) {
    // 如果订单页进入获取订单ID
    console.log('options',options);
    const {orderId} = options;
    if(orderId){
      this.setData({
        orderId
      })
    }
    this.init();
  },
  async init(){
    const {user} = this.data;
    if( user._id === undefined ){
      const user = await getUser();
      this.setData({
          user
      })
    }
    // 获取地址列表
    this.getAddressList();
  },
  async getAddressList(){
    const { user:{_id}} = this.data;
    const list = await getAllAddress(_id);
    console.log('list',list)
    this.setData({
        list:list.records
    });
  },
  async delete(e) {
    const { id } = e.currentTarget.dataset;

    wx.showModal({
        title: '提示',
        content: '点击确认删除地址',
        success: async (res) => {
            if (res.confirm) {
                try {
                    // 调用异步函数
                    const res = await deleteAddress({ id });
                    console.log('res', res);
                    if (res.data.count == 1) {
                        this.getAddressList();
                    } else {
                        wx.showToast({
                            title: '删除失败',
                            duration: 2000
                        });
                    }
                } catch (error) {
                    console.error('异步操作出错:', error);
                }
            } else if (res.cancel) {
                console.log('用户点击了取消按钮');
            }
        }
    });
  },
  //修改地址
  edit(e){
    console.log(e.currentTarget.dataset)
    const {item} =  e.currentTarget.dataset;
    // 拼链接参数
    let paramString = '';
    for (const key in item) {
      if (item.hasOwnProperty(key)) {
          if (paramString.length > 0) {
              paramString += '&';
          }
         paramString += `${key}=${item[key]}`;
      }
    }

    wx.navigateTo({
      url: `/pages/address/edit/edit?${paramString}`
    })
    
  },
  //显示地址列表
  onShow(){
    console.log('show');
    this.init();
  },
  //增加地址
  addAddress: function () {
    console.log(this.data.user._id);
    wx.navigateTo({
      url: `/pages/address/edit/edit?uid=${this.data.user._id}`
    })
  },
  //选择地址
  select(e){
    console.log('e',e.currentTarget.dataset);
    // 不是从订单来不可点击
    if( this.data.orderId.length == 0 ){
      return;
    }
    var pages = getCurrentPages(); // 获取页面栈
    var currPage = pages[pages.length - 1]; // 当前页面
    var prevPage = pages[pages.length - 2]; // 上一个页面
    if (prevPage.__route__ == 'pages/order/checkout/checkout') {
      console.log("为上一个页面的address赋值")
      prevPage.setData({
        address: e.currentTarget.dataset.item
      })
      wx.navigateBack({
        delta: 1
      })
   }
  }
})
