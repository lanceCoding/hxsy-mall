import { model } from './model';
const CART_STORAGE_KEY = 'cartInfo'

async function test() {
  
  const data = 
    [
      {
      _id: '1',
      key:'1&&&AXWJEYNAG8',
      count:2,
      spuId:"AXWJEYNAG8"
    },
    {
      _id: '2',
      key:'1&&&AWWUEN172Q',
      count:2,
      spuId:"AWWUEN172Q"
    }
  ];
  
  return data;
}

/**
 * 将数据存储到本地存储中
 * @param {string} key - 存储的键名
 * @param {any} data - 要存储的数据
 * @returns {Promise<any>} - 存储操作完成的 Promise
 */
async function setDataToLocal(data) {
  try {
      await new Promise((resolve, reject) => {
          wx.setStorage({
              key:CART_STORAGE_KEY,
              data,
              success: resolve,
              fail: reject
          });
      });
      return true;
  } catch (error) {
      console.error('存储数据到本地存储时出错:', error);
      return false;
  }
}

export async function getDataFromLocal() {
  try {
      // 使用 await 调用 wx.getStorage
      const res = await new Promise((resolve, reject) => {
          wx.getStorage({
              key: CART_STORAGE_KEY,
              success: resolve,
              fail: reject
          });
      });
      return res.data;
  } catch (error) {
    return false;
  }
}

async function getCartSpu() {
  let cart = await getDataFromLocal();
  if( cart == false ) return false;

  const data = await model()['o2o_spu'].list({
    filter: {
      where: {
        _id: {
          $in: cart.map(item => item.spuId)
        }
      }
    },
    select: {
      _id: true,
      name: true,
      cover: true,
      price: true,
      desc: true,
      count: true
    },
    pageSize: 200,
    pageNumber: 1
  });

  // 过滤掉 spuId 对应不上的 cart 对象，并添加 spu 对象
  cart = cart.filter(item => {
    const spu = data.data.records.find(spu => spu._id === item.spuId);
    if (spu) {
      item.spu = spu;
      return true;
    }
    return false;
  });

  const res = {
    total:cart.length,
    records: cart,
  }

  return res;
}

// 查询用户购物车，最多200个
export async function getCart(uid) {
  return await getCartSpu();
  // 数据模型逻辑
  // const data  = await model()['o2o_cart'].list({
  //   filter: {
  //       relateWhere: {
  //           user: {
  //               where: {
  //                 _id: {
  //                   $eq: uid,
  //                 },
  //               },
  //             },
  //       },
  //   },
  //   select:{
  //     _id: true,
  //     count: true,
  //     spu: true
  //   },
  //   // orderBy: [{ rank: 'desc' }],
  //   pageSize: 200, // 分页大小，建议指定，如需设置为其它值，需要和 pageNumber 配合使用，两者同时指定才会生效
  //   pageNumber: 1, // 第几页
  //   getCount: true, // 开启用来获取总数
  // });
  // console.log('getCart',data.data);

  // return data.data;
}

// 增加购物车
export async function addCart({ spu,count,uid }) {
    let cart = await getDataFromLocal();
    console.log('cart',cart);

    const add_item =  {
      count,
      spuId:spu._id,
      _id:uid+'&&&'+spu._id,
      key:uid+'&&&'+spu._id
    };

    // 检查 cart 是否为数组，如果不是则初始化为空数组
    if (!Array.isArray(cart)) {
      cart = [];
    }

    // 检查 add_item.key 是否不等于 cart 里面的 key
    const isKeyExists = cart.some(item => item.key === add_item.key);
    if (!isKeyExists) {
        cart.push(add_item);
    }

    const add_res = await setDataToLocal(cart);
    console.log('add_res',add_res);

    return {
      id: add_item._id,
    };

    // 数据模型逻辑
  //   const res = await model()['o2o_cart'].create({
  //    data: {
  //      count,
  //      spu: { _id: spu._id },
  //      user:{ _id: uid },
  //      key:uid+'&&&'+spu._id
  //    },
  //  });
  //  console.log('add',res);
  //  return res.data;
 }

// 移除购物车
 export async function removeCart({ id }) {
    let cart = await getDataFromLocal();
    console.log('cart',cart);
    
    // 移除 cart 里面 spuId 等于 id 的对象
    cart = cart.filter(item => item.spuId!== id);

    // 将更新后的 cart 存回本地存储
    const res = await setDataToLocal(cart);
    console.log('res',res);
    return res?{ count: 1 }:{ count:0 };
    // 数据模型逻辑
    // return await model()['o2o_cart'].delete({
    //   filter: {
    //     where: {
    //       spu: {
    //         $eq: id,
    //       },
    //     },
    //   },
    // });
}

// 清空购物车
export async function clearCart({ uid }) {
  return await model()['o2o_cart'].deleteMany({
    filter: {
      where: {
        user: {
          $eq: uid,
        },
      }
    }
  });
}

// 修改购物车数量
export async function updateCartCount({ id, count }) {
    return await model()['o2o_cart'].update({
      data: {
        count,
      },
      filter: {
        where: {
          _id: {
            $eq: id,
          },
        },
      },
    });
  }