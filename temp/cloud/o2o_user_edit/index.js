const cloud = require('wx-server-sdk');
const cloudbase = require("@cloudbase/node-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const app = cloudbase.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const models = app.models;
const USER_MODEL_KEY = 'o2o_user';

// 云函数入口函数
exports.main = async (event) => {
  const { uid, data } = event
  return models[USER_MODEL_KEY].update({
    data,
    filter: {
      where: {
        _id: {
          $eq: uid,
        },
      },
    },
  });
}