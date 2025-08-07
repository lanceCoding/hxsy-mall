import { model } from './model';
import { PROVINCE } from '../utils/province';

// 获取用户全部地址
export async function getAllAddress(uid) {
    const data = await model()['o2o_address'].list({
        filter: {
            relateWhere: {
                user: {
                    where: {
                      _id: {
                        $eq: uid,
                      },
                    },
                  },
            },
        },
        select:{
            _id: true,
            phone: true,
            address: true,
            name: true,
            location: true,
            longitude: true,
            latitude: true,
            user: {
              _id: true,
            }
        },
        // orderBy: [{ rank: 'desc' }],
        pageSize: 200, // 分页大小，建议指定，如需设置为其它值，需要和 pageNumber 配合使用，两者同时指定才会生效
        pageNumber: 1, // 第几页
        getCount: true, // 开启用来获取总数
      });
      return data.data;
}

// 创建地址
export function createAddress({ name, address, phone,location,uid,latitude,longitude }) {
    console.log(location.split('/').includes("省") );
    
  if(  location.split('/').includes("省") ){
    const result = PROVINCE.find(item => address.includes(item.name));
    console.log('result',result);
    if( result != null ){
        location = result.name;
    }else{
        return;
    }
  }
  return model()['o2o_address'].create({
    data: {
      name,
      address,
      phone,
      location,
      longitude,
      latitude,
      user:{
          _id: uid,
      }
    },
  });
}

// 更新地址
export function updateAddress({ name, address, phone, _id,location,latitude,longitude }) {
    const result = PROVINCE.find(item => address.includes(item.name));
    console.log(result);
    if( result != null ){
        location = result.name;
    }
  return model()['o2o_address'].update({
    data: {
      name,
      address,
      phone,
      location,
      longitude,
      latitude
    },
    filter: {
      where: {
        _id: { $eq: _id },
      },
    },
  });
}

// 删除地址
export function deleteAddress({ id }) {
  return model()['o2o_address'].delete({
    filter: {
      where: {
        _id: {
          $eq: id,
        },
      },
    },
  });
}

// 获取单条地址
export async function getAddress({ id }) {
  return (
    await model()[DELIVERY_INFO_MODEL_KEY].get({
      filter: {
        where: {
          _id: {
            $eq: id,
          },
        },
      },
    })
  ).data;
}
