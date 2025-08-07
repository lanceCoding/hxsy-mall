import { model } from './model';

const ORDER_MODEL_KEY = 'o2o_order';
const ORDER_ITEM_MODEL_KEY = 'o2o_order_item';


const ORDER_STATUS_INFO = {
  TO_PAY: { value: 'TO_PAY', label: '待付款' },
  TO_SEND: { value: 'TO_SEND', label: '待发货' },
  TO_RECEIVE: { value: 'TO_RECEIVE', label: '待收货' },
  FINISHED: { value: 'FINISHED', label: '已完成' },
  CANCELED: { value: 'CANCELED', label: '已取消' },
  RETURN_APPLIED: { value: 'RETURN_APPLIED', label: '申请退货' },
  RETURN_REFUSED: { value: 'RETURN_REFUSED', label: '拒绝退货申请' },
  RETURN_FINISH: { value: 'RETURN_FINISH', label: '退货完成' },
  RETURN_MONEY_REFUSED: { value: 'RETURN_MONEY_REFUSED', label: '拒绝退款' },
};

export const TRANS_TYPE = [{
    "label": "配送",
    "value": "DELI"
}, {
    "label": "自提",
    "value": "SELF"
}]

export const ORDER_STATUS = new Proxy(ORDER_STATUS_INFO, {
  get(target, prop) {
    return target[prop]?.value;
  },
});

// export const orderStatusToName = (status) => Object.values(ORDER_STATUS_INFO).find((x) => x.value === status)?.label;

export const orderTypeToName = (value) => TRANS_TYPE.find(item => item.value === value)?.label || null;


export  function orderStatusToName(status,trans_type) {
    const values = Object.values(ORDER_STATUS_INFO);
    for (let i = 0; i < values.length; i++) {
        const x = values[i];
        if (x.value === status) {
            if( trans_type == "SELF" ){
                switch (status) {
                    case 'TO_SEND':
                      return '备货中';
                      break;
                    case 'TO_RECEIVE':
                      return '待取货';
                      break;
                    default:
                        return x.label;
                  }
            }else{
                return x.label;
            }
            
        }
    }
    return null;
}

// 创建订单
export async function createOrder({ status,uid, addressId }) {
  let data = {
    status,
    user:{
        _id:uid,
    }
  };
  //地址存在就加进去
  if( addressId ){
    data.address = {
      _id: addressId,
    };
  }
  return (
    await model()[ORDER_MODEL_KEY].create({
      data,
    })
  ).data;
}
// 创建订单项
export async function createOrderItem({snap, count, spuId, orderId,pay_price }) {
  // const snapshot  = JSON.stringify(snap);
  return model()[ORDER_ITEM_MODEL_KEY].create({
    data: {
      count,
      snapshot:snap,
      pay_price,
      spu: {
        _id: spuId,
      },
      order: {
        _id: orderId,
      },
    },
  });
}

// 获取单条订单
export async function getOrder(orderId) {
  return (
    await model()[ORDER_MODEL_KEY].get({
      filter: {
        where: {
          _id: { $eq: orderId },
        },
      },
      select: {
        $master: true,
        address: {
          _id: true,
          phone: true,
          address: true,
          name: true,
          location:true
        },
        user:{
          _id:true,
          name:true
        },
        order_item:{
          count: true,
          pay_price:true,
          snapshot:true,
          _id:true
        }
      },
    })
  ).data;
}

// 更新信息（非状态）
export async function updateOrderInfo({ orderId, addressId,express_fee,amount,notes,is_valid,trans_type }) {
  return model()[ORDER_MODEL_KEY].update({
    data: {
      address: {
        _id: addressId,
      },
      express_fee,
      amount,
      notes,
      trans_type,
      is_valid
    },
    filter: {
      where: {
        _id: {
          $eq: orderId,
        },
      },
    },
  });
}

// 更新订单状态
export async function updateOrderStatus({ orderId, status }) {
  return await model()[ORDER_MODEL_KEY].update({
    data: {
      status,
    },
    filter: {
      where: {
        _id: {
          $eq: orderId,
        },
      },
    },
  });
}

// 获取订单列表
export async function listOrder({ pageSize, pageNumber, status,uid }) {
    const select = {
        status: true,
        createdAt:true,
        amount:true,
        express_fee:true,
        trans_type:true,
        order_item:{
          count: true,
          pay_price:true,
          snapshot:true,
          _id:true
        }
      };

    let filter = {
        where: {
          is_valid: {
            $eq: true,
          },
        },
        relateWhere: {
          user: {
            where: {
              _id: {
                $eq: uid,
              },
            },
          },
        },
      };
    if (status != null) {
        filter.where.status = {
            $eq: status,
        };
    }
  
  return (
    await model()[ORDER_MODEL_KEY].list({
      select,
      filter,
      pageSize,
      pageNumber,
      getCount: true,
    })
  ).data;
}