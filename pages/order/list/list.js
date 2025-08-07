/**
 *
Hailetu *
 * @author Hailetu
 */
import { ORDER_STATUS, listOrder,orderTypeToName,orderStatusToName,updateOrderStatus } from '../../../service/order';
import { getUser } from '../../../service/user';
import { pay,refund } from '../../../service/pay';
import { LIST_LOADING_STATUS } from '../../../utils/config';
import { formatTime } from '../../../utils/common';

const ORDER_STATUS_ALL = '0';

Page({
  data: {
    page: {
        size: 5,
        num: 1,
      },
    tabs: [
      { key: ORDER_STATUS_ALL, text: '全部', total: 0 },
      { key: ORDER_STATUS.TO_PAY, text: '待付款', total: 0 },
      { key: ORDER_STATUS.TO_SEND, text: '待发货', total: 0 },
      { key: ORDER_STATUS.TO_RECEIVE, text: '待收货', total: 0 },
      { key: ORDER_STATUS.FINISHED, text: '已完成', total: 0 },
    ],
    curTab: ORDER_STATUS_ALL,
    orderList: [],
    listLoading: LIST_LOADING_STATUS.READY,
    backRefresh: false,
    status: ORDER_STATUS_ALL,
    pullDownRefreshing: false
  },
  onLoad: function(query) {
    const status = this.data.tabs.find((x) => x.key === query.status)?.key ?? ORDER_STATUS_ALL;    
    this.setData({
        status,
    });
    this.refreshList(status);
  },
  showDetail(e) {
    console.log('e',e);
    const { id } = e.currentTarget.dataset
    // 传递订单objectId
    wx.navigateTo({
      url: '/pages/order/detail/detail?orderId=' + id
    })
  },
  onShow: function() {
    this.refreshList(this.data.status);
  },
  async getOrderList(statusCode = ORDER_STATUS_ALL, reset = false) {
    const { _id } = await getUser();
    if(_id.length <= 0) return;
    this.setData({
      listLoading: LIST_LOADING_STATUS.LOADING,
    });
    try {
      const { records, total } = await listOrder({
        pageSize: this.data.page.size,
        pageNumber: this.data.page.num,
        status: statusCode !== ORDER_STATUS_ALL ? statusCode : undefined,
        uid:_id
      });
      
      records.forEach((order) => {
         order.createdAt = formatTime(order.createdAt);
          order.typeDesc = orderTypeToName(order.trans_type);
          order.statusDesc = orderStatusToName(order.status,order.trans_type);
        //   未支付可以取消
          if( order.status ==  ORDER_STATUS.TO_PAY){
            order.pay_btn = true;
            order.cancel_btn = true;
          }
        //   未发货可以取消
          if( order.status ==  ORDER_STATUS.TO_SEND){
            order.cancel_btn = true;
          }
        //   待收货，可以确认
        if( order.status ==  ORDER_STATUS.TO_RECEIVE){
          order.confirm = true;
        }

          //增加快递费
          let fee = order.express_fee === undefined?0:order.express_fee;
          order.amount = order.trans_type == 'DELI'?order.amount+fee:order.amount;
      });
      console.log('rs',records);
      // async get items for each order
      // await Promise.all(records.map((order) => this.getOrderItems(order)));

      const orderList = reset ? records : this.data.orderList.concat(records);

      let listLoading = orderList.length >= total ? LIST_LOADING_STATUS.NO_MORE : LIST_LOADING_STATUS.READY; 

      if( reset &&  orderList.length == 0){
        listLoading = LIST_LOADING_STATUS.NONE;
    }

      this.setData({ listLoading, orderList });
      const currentNum = reset ? 1 : this.data.page.num;
      this.data.page.num = currentNum + 1;
    } catch (e) {
      console.error('获取订单列表失败', e);
      this.setData({ listLoading: LIST_LOADING_STATUS.FAILED });
    }
    console.log('ld',this.data.listLoading);
  },
  refreshList(status = ORDER_STATUS_ALL) {
    this.data.page = {
      size: this.data.page.size,
      num: 1,
    };
    console.log('page',this.data.page);
    this.setData({ curTab: status, orderList: [] });

    return this.getOrderList(status, true);
  },
  onTabChange(e) {
    const { id } = e.target.dataset;
    console.log('e',e);
    this.setData({
      status: id,
    });
    this.refreshList(id);
  },
  onReachBottom() {
    if (this.data.listLoading === LIST_LOADING_STATUS.READY) {
      this.getOrderList(this.data.curTab);
    }
  },
  async payment(e) {
    wx.showLoading({
      title: '处理中',
      mask: true
    });
    setTimeout(function () {
      wx.hideLoading()
    }, 3000);
    console.log('e',e);
    const { id } = e.currentTarget.dataset
    console.log('oid',id);
    try {
        await pay({ id });
        try {
          await updateOrderStatus({ orderId:id, status: ORDER_STATUS.TO_SEND });
          wx.showToast({
            title: '支付成功',
            duration: 2000
          })
        } catch (e) {
          console.error(e);
          wx.showToast({
            title: '支付成功，但订单状态更新失败',
            icon:'none',
            duration: 2000
          })
        } finally {
          this.refreshList(this.data.status);
        }
    } catch (e) {
      wx.showToast({
        title: '支付失败',
        icon:'none',
        duration: 2000
      })
    }
  },

  async onCancel(e) {
    // 获取订单号
    const { order } = e.currentTarget.dataset;
    wx.showLoading({
      title: '处理中',
      mask: true
    });
    setTimeout(function () {
      wx.hideLoading()
    }, 2200);
    
    // 订单已支付先操作微信退款
    if (order.status !== ORDER_STATUS.TO_PAY) {
      try {
        await refund(order._id);
      } catch (e) {
        wx.showToast({
            title: '操作失败',
            icon:'none',
            duration: 2000
        })
      }
    }

    // 修改状态
    try {
      await updateOrderStatus({ orderId: order._id, status: ORDER_STATUS.CANCELED });
    } catch (e) {
        wx.showToast({
            title: '操作失败',
            icon:'none',
            duration: 2000
        })
    }
    wx.showToast({
        title: '操作成功',
        duration: 2000
    })
    this.refreshList(this.data.status);
  },

  /**
   * 确认收货操作
   * @param {Object} e - 事件对象，包含当前点击元素的数据集
   */
  async onConfirmReceive(e) {
    // 获取订单号
    const { order } = e.currentTarget.dataset;
    // 检查订单状态是否为待收货
    if (order.status !== ORDER_STATUS.TO_RECEIVE) {
      // 若不是待收货状态，显示提示信息
      wx.showToast({
        title: '只有待收货状态的订单可以确认收货',
        icon: 'none',
        duration: 2000
      });
      // 结束函数执行
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
      await updateOrderStatus({ orderId: order._id, status: ORDER_STATUS.FINISHED });
    } catch (e) {
      // 若更新状态失败，显示操作失败提示信息
      wx.showToast({
        title: '操作失败',
        icon: 'none',
        duration: 2000
      });
    }
    // 若更新状态成功，显示操作成功提示信息
    wx.showToast({
      title: '操作成功',
      duration: 2000
    });
    // 刷新订单列表
    this.refreshList(this.data.status);
  }
})
