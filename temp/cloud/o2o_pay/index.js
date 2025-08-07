const cloud = require('wx-server-sdk');
const cloudbase = require("@cloudbase/node-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const app = cloudbase.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const models = app.models;
const ORDER_MODEL_KEY = 'o2o_order';
// const ORDER_ITEM_MODEL_KEY = 'shop_order_item';

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const { orderId } = event;
  const order = (await models[ORDER_MODEL_KEY].get({
    filter: {
      where: {
        _id: {
          $eq: orderId
        }
      }
    },
    select: {
      amount: true,
      trans_type:true,
      express_fee:true,
      _openid:true
    }
  })).data;
  if (wxContext.OPENID !== order._openid) {
    throw new Error("invalid caller");
  }
console.log('order',order);
const fee = order.express_fee === undefined?0:order.express_fee;
console.log('fee',fee);
const totalPrice = order.trans_type == 'DELI'?fee + order.amount:order.amount;
console.log('totalPrice',totalPrice);

  const res = await cloud.callFunction({
    name: 'cloudbase_module',
    data: {
      name: 'wxpay_order',
      data: {
        description: '商品名称',
        amount: {
          total: totalPrice * 100,
          currency: 'CNY',
        },
        // 商户生成的订单号
        out_trade_no: order._id,
        payer: {
          // 服务端云函数中直接获取当前用户openId
          openid: wxContext.OPENID,
        },
      },
    },
  });
  return res.result;
};
