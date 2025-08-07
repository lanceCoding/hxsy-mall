# 说明

外卖电商模版包含：前端电商小程序，和管理后台，可以快速实现商品录入，上下架，订单发货，微信支付等功能；

不仅适用于外卖场景，也同样适用于小型零售电商，以及到店消费；

[![pEtuahF.jpg](https://s21.ax1x.com/2025/03/07/pEtuahF.jpg)](https://imgse.com/i/pEtuahF)

# 功能特性

1. 性能优化：根据云开发的特点保证基本功能的情况下，对项目代码做了优化，保证流畅性；

2. 功能完善：实现基本的选购商品，下单支付以及后续订单管理；

3. 快速搭建：通过小程序端的配合，结合本项目，可以在1小时之内搭建一个小型外卖电商系统，降低开发周期；

4. 扩展性好：用户可以基于基本功能，跟进业务通过云开发低代码工具进行二次开发；

5. 微信生态丰富：集成丰富的微信工具接口，便捷对接微信生态；



# 功能列表

[![pEtuDXR.jpg](https://s21.ax1x.com/2025/03/07/pEtuDXR.jpg)](https://imgse.com/i/pEtuDXR)



# 快速上手

安装的流程和另外一个项目的流程很相似，我做了说明教程，大家可以在视频号或者抖音观看。

![输入图片说明](temp/WX20250417-154053@2x.png)


## 准备工作

开始前需要完成小程序注册，微信支付申请等相关工作，注意**此时不要注册云开发账号，也不要付费**，后面通过微信开发工具注册；

![输入图片说明](temp/data/1.PNG)



## 小程序安装

打开网站https://gitee.com/rioshyb/tcb-takeout-basic，

有开发能力的可以选择git（推荐），不擅长git可以直接下载压缩包并且解压；下载后解压，微信开发工具导入解压文件夹，并填写appid；

[![pEtu2tO.jpg](https://s21.ax1x.com/2025/03/07/pEtu2tO.jpg)](https://imgse.com/i/pEtu2tO)


## 模版安装

进入模版中心，选择对应模版；如果可视化开发出现应用，说明安装成功，注意应用的名称是：**外卖电商管理后台**；

进入应用编辑，选择右上角的应用。发布成功后 即可通过账号密码登录后台管理订单商品；

[![pAWBQPI.png](https://s21.ax1x.com/2024/11/20/pAWBQPI.png)](https://imgse.com/i/pAWBQPI)


## 云函数安装

项目需要4个云函数：o2o\_pay，o2o\_refund，o2o\_user\_edit，register；

如果没有安装，需要云函数点击新建-输入函数名，创建index.js和package.js文件。再把项目里面，\temp\cloud下面对应的文件贴入，具体操作可以参考二维码视频。

[![pEtKSun.jpg](https://s21.ax1x.com/2025/03/07/pEtKSun.jpg)](https://imgse.com/i/pEtKSun)


![输入图片说明](temp/data/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20250307163425.jpg)


## 支付配置

如果已安装微信支付模板，并且完成配置，这个步骤忽略；

前往小程序微信支付模版，填入该模版所需参数（页面链接有具体说明怎么获取）。**若未填入，将无法使用支付功能，其他功能可正常体验**

[![pAWd2dA.png](https://s21.ax1x.com/2024/11/20/pAWd2dA.png)](https://imgse.com/i/pAWd2dA)

[![pEtK88e.jpg](https://s21.ax1x.com/2025/03/07/pEtK88e.jpg)](https://imgse.com/i/pEtK88e)

## 权限配置

数据模型的权限和云存储权限必须全部被勾选第一个，不然数据无法正确加载；

注意：云存储免费试用期是无法开启全部可读，需要付费使用，建议大家先买2个月

[![pEtKUbt.jpg](https://s21.ax1x.com/2025/03/07/pEtKUbt.jpg)](https://imgse.com/i/pEtKUbt)



# 后台配置

首先录入店铺信息，店铺名称，地址，营业时间，头图必须配置，否则显示异常；

商标和轮播图可选，demo数据在项目文件夹下，**\temp\data**

[![pEtMEIf.jpg](https://s21.ax1x.com/2025/03/07/pEtMEIf.jpg)](https://imgse.com/i/pEtMEIf)



# 其他

## 1.高级功能

本项目包含最基本的功能，另外提供高级版，标黄是高级版新增功能，需要可加微信联系：

[![pEtKDPS.jpg](https://s21.ax1x.com/2025/03/07/pEtKDPS.jpg)](https://imgse.com/i/pEtKDPS)

## 2.联系方式

![输入图片说明](temp/data/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20250307182451.jpg)


**本人从事互联网产品设计开发工作超过12年，曾在东方财富，百安居，齐家等公司担任产品技术等职务；**

**涉及的领域包括：**

* 小程序/app开发设计；

* 业务后台开发设计（工单系统，电商系统，crm系统，cms系统等）；

* 大数据产品设计开发（数据治理，数仓搭建等）；

* AI产品开发设计（agent/chat bot）；

* 产品设计咨询等；

**目前通过云开发实施了将近数十个项目。欢迎大家前来咨询。**

