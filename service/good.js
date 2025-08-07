import { model } from './model';

export const SPU_SELLING_STATUS = 'ENABLED';

export async function getCate() {
// 查询店铺首页了列表
const data  = await model()['o2o_cate'].list({
    select:{
      _id: true,
      name: true,
      rank: true
    },
    orderBy: [{ rank: 'desc' }],
    pageSize: 200, // 分页大小，建议指定，如需设置为其它值，需要和 pageNumber 配合使用，两者同时指定才会生效
    pageNumber: 1, // 第几页
    getCount: true, // 开启用来获取总数
  });
  console.log('d',data.data);
  return data.data;
}

export async function listGood({ pageSize, pageNumber, cate_id }) {
    console.log('cate_id',cate_id);
    const select = {
      _id:true,
      name: true,
      cover: true,
      price:true,
      desc:true,
      count:true,
      details:true
    };
    const filter = {
      where: {
        status: { $eq: SPU_SELLING_STATUS },
      },
    };
    if (cate_id) {
        filter.relateWhere = {
            cate: {
              where: {
                _id: {
                  $eq: cate_id,
                },
              },
            },
        };
    }
    console.log('filter',filter);
    const data = await model()['o2o_spu'].list({
      filter,
      select,
      pageSize,
      pageNumber,
      getCount: true,
      orderBy: [{ rank: 'desc' }],
    });
    return data.data;
  }
