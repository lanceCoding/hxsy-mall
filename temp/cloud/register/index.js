const cloud = require('wx-server-sdk');
const cloudbase = require("@cloudbase/node-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const app = cloudbase.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const models = app.models;
const USER_MODEL_KEY = 'o2o_user';

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  // const { orderId } = event;
  let user = await getUser(wxContext.OPENID);
  console.log('1',user);
  // 数据为空创建用户
  if(JSON.stringify(user) === '{}'){
    const { data } = await models[USER_MODEL_KEY].create({
      data: {
          openId: wxContext.OPENID,  // openId
          nickName: "微信用户"+wxContext.OPENID.slice(-6),  // 昵称截取前6位区分
          avatarUrl: "https://we-retail-static-1300977798.cos.ap-guangzhou.myqcloud.com/retail-ui/components-exp/avatar/avatar-1.jpg"
        }
    });
    
    // 返回创建的数据 id
    console.log('ct',data);
    // 成功返回用户信息
    if('id' in data){
      const new_user = await getUser(wxContext.OPENID);
      user = new_user;
    }

  }
  console.log('user-last',user);
  return user;
};

async function getUser(openId) {
  return (await models[USER_MODEL_KEY].get({
    filter: {
      where: {
        openId: {
          $eq: openId
        }
      }
    },
    select: {
      _id:true,
      openId: true,
      nickName:true,
      avatarUrl:true,
      gender:true,
      phoneNumber:true,
      wx_account:true,
    }
  })).data;
}