/**
 *
 *
 * @author Hailetu
 */
import { getOrder,orderStatusToName,orderTypeToName, ORDER_STATUS,updateOrderStatus } from '../../../service/order';
import { formatTime } from '../../../utils/common';
import { pay,refund } from '../../../service/pay';
import { getUser } from '../../../service/user';

const app = getApp();  // 获取配置

Page({
  data: {
    orderId:null,
    order: {},
    user:{},
    shop:app.globalData.config,
  },
  onLoad(options) {
    const { orderId } = options;
    this.setData({
      orderId
    })
    this.getDetail(orderId);
    this.getUser();
  },
  // 获取用户信息
  async getUser(){
    const user = await getUser();
    this.setData({
        user
      })
  },
  async getDetail(id) {
    const order = await getOrder(id);
    // 状态转文字
    order.statusDesc = orderStatusToName(order.status,order.trans_type);
    // 未支付显示支付按钮
    order.canPay = order.status === ORDER_STATUS.TO_PAY;
    // 显示确认收货按钮
    order.canComfirm = order.status == ORDER_STATUS.TO_RECEIVE;
    // 显示取消按钮
    order.canCancel = order.status == ORDER_STATUS.TO_SEND || order.status == ORDER_STATUS.TO_PAY;
    // 时间戳转时间
    order.createdTimeString = formatTime(order.createdAt);
    // 订单价格重新计算，如果自提不算运费
    order.express_fee = order.express_fee === undefined?0:order.express_fee;
    order.amount = order.trans_type == 'DELI'?order.amount+order.express_fee:order.amount;
    console.log('o',order);
    this.setData({ order });
  },
  
  contact: function() {
    const telephone = this.data.seller.telephone
    wx.makePhoneCall({
      phoneNumber: telephone //仅为示例，并非真实的电话号码
    })
  },

  async payment() {
    wx.showLoading({
        title: '处理中',
        mask: true
    });
    setTimeout(function () {
    wx.hideLoading()
    }, 5000);
    const { orderId } = this.data;
    try {
        await pay({ id:orderId });
        try {
          await updateOrderStatus({ orderId, status: ORDER_STATUS.TO_SEND });
         
          this.toast('支付成功');
        } catch (e) {
          console.error(e);
          this.toast('支付成功，但订单状态更新失败');
        } finally {
          setTimeout(() => {
            // wx.navigateBack();
          }, 1000);
        }
    } catch (e) {
        // this.failedAndBack('支付失败', e);
    }
  },
  

  
  callReceiver: function(e) {
    var telephone = e.currentTarget.dataset.telephone
    wx.makePhoneCall({
      phoneNumber: telephone //仅为示例，并非真实的电话号码
    })
  },

  async onCancel() {
    // 获取订单号
    const { orderId,order} = this.data;
    wx.showLoading({
      title: '处理中',
      mask: true
    });
    setTimeout(function () {
      wx.hideLoading()
    }, 4000);
    
    // 订单已支付先操作微信退款
    if (order.status !== ORDER_STATUS.TO_PAY) {
      try {
        await refund(orderId);
      } catch (e) {
        wx.showToast({
            title: '操作失败',
            duration: 2000
        })
        return;
      }
    }

    // 修改状态
    try {
      await updateOrderStatus({ orderId, status: ORDER_STATUS.CANCELED });
    } catch (e) {
        wx.showToast({
            title: '操作失败',
            duration: 2000
        })
        return;
    }
    wx.showToast({
        title: '操作成功',
        duration: 2000
    })
    this.getDetail(orderId);
  },
  phoneCall(){
    console.log('phone')
    wx.makePhoneCall({
        phoneNumber: this.data.shop.shop_info.phone
    })
  },

  /**
   * 确认收货操作
   * @async
   * @function onConfirmReceive
   * @description 此函数用于处理订单的确认收货操作。只有订单状态为待收货时，才能执行该操作。
   *              操作过程中会显示加载提示，操作完成后会显示相应的提示信息，并刷新订单详情。
   */
  async onConfirmReceive() {
    // 获取订单号和订单信息
    const { orderId, order } = this.data;
    // 检查订单状态是否为待收货
    if (order.status !== ORDER_STATUS.TO_RECEIVE) {
      // 若订单状态不是待收货，显示提示信息并结束函数执行
      wx.showToast({
        title: '只有待收货状态的订单可以确认收货',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 显示加载提示
    wx.showLoading({
      title: '处理中',
      mask: true
    });
    // 2.2 秒后隐藏加载提示
    setTimeout(function () {
      wx.hideLoading()
    }, 2200);

    // 修改状态
    try {
      // 调用更新订单状态的服务，将订单状态更新为已完成
      await updateOrderStatus({ orderId, status: ORDER_STATUS.FINISHED });
    } catch (e) {
      // 若更新状态失败，显示操作失败提示信息并结束函数执行
      wx.showToast({
        title: '操作失败',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 若更新状态成功，显示操作成功提示信息
    wx.showToast({
      title: '操作成功',
      duration: 2000
    });
    // 刷新订单详情
    this.getDetail(orderId);
  }
})
