import { model } from './model';
const USER_STORAGE_KEY = "userInfo";

export function getUser(){
    return new Promise((resolve, reject) => {
        // 获取本地用户缓存
        wx.getStorage({
            key: USER_STORAGE_KEY,
            success (res) {
            console.log('res',res)
            if(typeof(res.data) != 'undefined'){
                console.log("read store",res.data);
                resolve( res.data );
            }else{
                const userInfo = getUserFromCloud();
                resolve( userInfo);
            }
            },
            fail(error){
                console.log('error',error);
                const userInfo = getUserFromCloud();
                resolve( userInfo);
            }
        })
    })
}

async function getUserFromCloud() {
    //获取用户并注册
    const res = await wx.cloud.callFunction({
        name: 'register',
    });
    console.log('res_fuc',res);
    // 缓存用户信息
    wx.setStorage({
        key:USER_STORAGE_KEY,
        data:res.result,
    })
    return res.result;
}

/**
 *
 * @param {{
 *   name,
 *   address,
 *   phone,
 *   _id,
 *   location
 * }} param0
 */
export async function updateUser({ uid, data }) {
    const res = await wx.cloud.callFunction({
        // 云函数名称
        name: 'o2o_user_edit',
        // 传给云函数的参数
        data: {
          uid,
          data,
        },
      });
    
    console.log("res",res.result);
    // { count: 1}
    if( res.result.data.count == 1 ){
        const up = await getUserFromCloud();
        return up;
    }else{
        return {'error':-1};
    }
}
// 获取配置信息包括店铺信息，运费模板等等
export async function getConfig(){
  const data = await model()['o2o_config'].list({
    filter: {
      where: {}
    },
    select:{
        $master: true,
    },
    // orderBy: [{ rank: 'desc' }],
    pageSize: 200, // 分页大小，建议指定，如需设置为其它值，需要和 pageNumber 配合使用，两者同时指定才会生效
    pageNumber: 1, // 第几页
    getCount: true, // 开启用来获取总数
  });
  return data.data.records;
}