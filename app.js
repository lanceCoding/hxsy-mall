
import { getUser } from './service/user';

const { init } = require('@cloudbase/wx-cloud-client-sdk')
const client = init(wx.cloud)
const models = client.models
globalThis.dataModel = models;

App({
  globalData: {
    config: null,
    isNeedClearCart:false
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: '', // 指定云开发环境 ID
        traceUser: true
      });
    }
    getUser();    
  }
});
