import { convertTime } from '../../utils/common';
import { getConfig } from '../../service/user';

const app = getApp();  // 获取配置

Page({
  data: {
    shop:null,
    ads:[]
  },
  async onLoad(){
   this.getShopInfo();
  },
  async getShopInfo(){
    let data = await getConfig();
    let new_hours = []; 
    const { logo } = data[0];
    if(logo === undefined || logo === null || logo === '' ){
      data[0].logo = '/images/index-shop.png';
    }
    data[0].trading_hours.forEach(function(item) {
        new_hours.push( convertTime(item) )
    });
    data[0].trading_hours = new_hours;

    // data[0].banner = '/数据文件（小程序发布前务必删掉）/初始化数据/头部展示图.jpg';
    // data[0].banners = [
    //   '/数据文件（小程序发布前务必删掉）/初始化数据/广告1.jpg','/数据文件（小程序发布前务必删掉）/初始化数据/广告3.jpg'
    // ]


    this.setData({
        shop:data[0]
    });

    app.globalData.config =data[0];
    console.log('c',app.globalData.config);
    
  },
  onChangeTab(e) {
    const {key}=e.target.dataset
    this.setData({
      selectedItemIndex:key
    })
  },
  onOpenTipsModal(){
    this.setData({
      tipShow:true
    })
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
});

