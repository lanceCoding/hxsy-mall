/**
 * Hailetu
 */
import { getCate,listGood } from '../../service/good';
import { LIST_LOADING_STATUS } from "../../utils/config";
import { createOrder,createOrderItem, ORDER_STATUS } from '../../service/order';
import { getUser } from '../../service/user';
import { addCart,removeCart,getCart,clearCart } from '../../service/cart';

const app = getApp();  // 获取配置

Page({
  data: {
    goodListPagination: {
        index: 1,
        num: 10,
      },
    listLoading: LIST_LOADING_STATUS.READY,
    detail:{},
    isOverlayVisible: false,
    user:{},
    selected:'0',
    goods:[],
    categoryStates: [],
    maskVisual: 'show',
    cartData: {},
    cartObjects: [],
    cart: {
        count: 0,
        total: 0,
    },
	showCartDetail: false,
    express_fee:4.0,
    addingToCart: false,  // 添加loading状态
    subtractingFromCart: false  // 添加减少loading状态
  },

  onShow(){
    // 判断是不是清空购物车
    if(app.globalData.isNeedClearCart){
      this.clearCart();
      app.globalData.isNeedClearCart = false;
    }
  },
  async onLoad() {
    this.initCart();
    this.loadCategory('0');
    this.loadFood({category:0,fresh:true});
  },
//   初始化购物车
  async initCart(){
    // 获取用户
    const user = await getUser();
    this.setData({
        user
      })
    const data = await getCart(user._id);
    console.log('init cart',data);
    
    if(data.total > 0){
        // 初始化购物车数据
        let list = [];
        let idCountMap = {};

        data.records.forEach(item => {
            // 抽取所需信息到数组
            list.push({
                cart_id: item._id,
                _id: item.spu._id,
                name: item.spu.name,
                price: item.spu.price,
                cover:item.spu.cover,
                desc:item.spu.desc
            });
            // 抽取 spu 的 _id 和 count 到对象中
            idCountMap[item.spu._id] = item.count;
        });
        this.setData({
            cartObjects: list,
            cartData: idCountMap,
        })
        this.countCart();
        console.log('list',list);
    }
    
  },
  // 显示浮层的函数
  showOverlay(e) {
    const { id } = e.currentTarget.dataset;
    const {goods } = this.data;
    const detail = goods.find(item => item._id === id);
    
    console.log('detail',detail);
    this.setData({
      detail,   
      isOverlayVisible: true
    });
  },
  // 隐藏浮层的函数
  hideOverlay() {
    this.setData({
      isOverlayVisible: false
    });
  },
  //   加载分类数据
  async loadCategory() {
    const data = await getCate();
    console.log('c',data);
    // const cate_list = data.records.filter(item => item.hasOwnProperty('image'));
    // const categoryStates = new Array(cate_list.length).fill(false)
    this.setData({
        categoryObjects: [{_id:'0',name:'全部'}].concat(data.records)
    //   categoryStates: categoryStates
    })
  },
  async loadFood({category,fresh = false}) {
    const cate_id = category === '0'?null:category;
    if (fresh) {
        wx.pageScrollTo({
          scrollTop: 0,
        });
        this.setData({
            goods:[]
        });
      }
      this.setData({ listLoading: LIST_LOADING_STATUS.LOADING });
      const pageSize = this.data.goodListPagination.num;
      const pageIndex = fresh ? 1 : this.data.goodListPagination.index;
  
      try {
        const { records: nextList, total } = await listGood({ pageNumber: pageIndex, pageSize,cate_id});
        const goodsList = fresh ? nextList : this.data.goods.concat(nextList);
        
        let load_status = goodsList.length >= total ? LIST_LOADING_STATUS.NO_MORE : LIST_LOADING_STATUS.READY;

        if( fresh &&  goodsList.length == 0){
            load_status = LIST_LOADING_STATUS.NONE;
        }

        this.setData({
            goods:goodsList,
            listLoading: load_status,
        });
        
        this.setData({
          goodListPagination:{
            index:pageIndex + 1,
            num:pageSize
          }
        });
      } catch (err) {
        console.error('error', err);
        this.setData({ listLoading: LIST_LOADING_STATUS.FAILED });
      }
  },
  async switchCategory(e) {
    // 获取分类id并切换分类
    const categoryId = e.currentTarget.dataset.index
	console.log(categoryId)
    await this.loadFood({category:categoryId,fresh:true});

    this.setData({
        selected: categoryId
    })
  },
  onReachBottom() {
    console.log('bottom');
    if (this.data.listLoading === LIST_LOADING_STATUS.READY) {
      this.loadFood({category:this.data.selected,fresh:false});
    }
  },
  // 下单
  async submitOrder(){
    wx.showLoading();
    const { id: orderId } = await createOrder({ status: ORDER_STATUS.TO_PAY,uid:this.data.user._id });

    const { cartObjects, cartData,cart} = this.data;
    try {
      const promiseArray = cartObjects.map((cartItem) => {
        return createOrderItem({ snap:cartItem,count: cartData[cartItem._id], orderId, spuId: cartItem._id,pay_price:cartItem.price });
      });
    
      Promise.all(promiseArray)
       .then((up_orders) => {
            console.log('所有订单商品项创建完成，结果如下：', up_orders);
            // 跳转结算页面
            wx.navigateTo({
              url: `/pages/order/checkout/checkout?orderId=${orderId}&amount=${cart.total}&count=${cart.count}`
            })
            // 在这里可以继续进行后续操作，比如计算总价和支付等
            // const totalPrice = cartItems.reduce((acc, cur) => acc + cur.count * cur.sku.price, 0);
            // console.log('3-price', totalPrice);
            // return this.payImpl(totalPrice, orderId);
            wx.hideLoading();

        })
       .catch((error) => {
            console.error('创建订单商品项过程中出现错误：', error);
      });
    } catch (e) {
        this.toast('下单失败请重试');
    }
  },

  add(e) {
    // 所点商品id
    const foodId = e.currentTarget.dataset.foodId
    // 读取目前购物车数据
    const cartData = this.data.cartData
    // 获取当前商品数量
    let foodCount = cartData[foodId] ? cartData[foodId] : 0

    // 获取商品信息和库存
    const good = this.data.goods.find(item => item._id === foodId);
    if (!good) {
      wx.showToast({
        title: '商品不存在',
        icon: 'none'
      });
      return;
    }

    // 检查库存
    if (foodCount >= good.count) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      });
      return;
    }

    // 自增1后存回
    cartData[foodId] = ++foodCount

    // 转换成购物车数据为数组
    this.cartToArray(cartData,foodId)
  },
  async subtract(e) {
    // 如果正在减少中，直接返回
    if (this.data.subtractingFromCart) {
      return;
    }
    
    // 设置减少状态为true
    this.setData({
      subtractingFromCart: true
    });

    try {
      // 所点商品id
      const foodId = e.currentTarget.dataset.foodId || e.detail.foodId
      // 读取目前购物车数据
      const cartData = this.data.cartData
      // 获取当前商品数量
      let foodCount = cartData[foodId] || 0
      // 自减1
      --foodCount
      // 减到零了就直接移除
      if (foodCount <= 0) {
        delete cartData[foodId]
      } else {
        cartData[foodId] = foodCount
      }
      
      // 转换成购物车数据为数组
      await this.cartToArray(cartData,foodId)
    } finally {
      // 无论成功失败，都要重置减少状态
      this.setData({
        subtractingFromCart: false
      });
    }
  },
  async cartToArray(cartData,id) {
    //   找到商品对象
    let add_item = this.data.goods.find(item => item._id === id);
    console.log('item',add_item);
    // 需要判断购物车数据中是否已经包含了原商品，从而决定新添加还是仅修改它的数量
    const cartObjects = this.data.cartObjects

    // 判断是否包含在购物车，不在就加进去
    if (!cartObjects.find(item => item._id === id)) {
        // 做一个入库
        const cart_id = await addCart({ spu:add_item,count:cartData[id],uid:this.data.user._id });
        console.log(cart_id);
        if( 'id' in cart_id   ){
            add_item.cart_id = cart_id.id;
            cartObjects.push(add_item);
        }
    }else{
      // 在购车，扣减到0，从购物车移除；
      if( cartData[id] === undefined ){
        const index = cartObjects.findIndex(item => item._id === id);
        if (index > -1) {
          const res = await removeCart({ id });
          cartObjects.splice(index, 1);
          console.log(res);
          // 需要模型做一个移除操作
        }
      }else{
        //   非扣减到0，改数量 改数量暂时不入库，太慢了
        // const update = await updateCartCount({ id, count:cartData[id] });
        // console.log('update',update);
        // 做一个改数字，update购物车数量；
      }
    }
    console.log('cartObjects',cartObjects);
    this.setData({
        cartObjects,
        cartData
    })
    this.countCart();
  },
  //   计算购物车总价和数量
  countCart(){
    const {cartData,cartObjects} = this.data;
    // 计算总量
    let count = Object.values(cartData).reduce((acc, curr) => acc + curr, 0);
    count = isNaN(count)?0:count;
    // 计算总价
    const totalPrice = this.data.cartObjects.reduce((acc, item) => cartData[item._id]? acc + item.price * cartData[item._id] : acc, 0);
    
    this.setData({
        cart: {
            count: count,
            total:  totalPrice.toFixed(2),
        },
    })
  },
  // 隐藏购物车
  hideCartDetail(){
    this.setData({
        showCartDetail: false
    });
  },
  // 显示购物车
  showCartDetail() {
    this.setData({
        showCartDetail: !this.data.showCartDetail
    });
  },
  // 清空购物车
  async clearCart(){
    this.setData({
      cartData: {},
      cartObjects: [],
      cart: {
          count: 0,
          total: 0,
      },
    })
    try {
      await clearCart(this.data.user._id);
    } catch (e) {
      console.error(e);
      this.toast('删除购物车失败，请手动删除');
      // do not return, continue to pay
    }
  },
  onShareAppMessage() {
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: '找到一个宝藏小程序'
        })
      }, 10)
    })
    return {
      title: '赶紧来看看吧',
      path: '/pages/index/index',
      promise 
    }
  }
})
