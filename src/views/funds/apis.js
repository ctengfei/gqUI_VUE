import request from "@/utils/request";

//统计项目类型数量
export function getProjectStatisticsApi(params) {
  return request({
    url: "/business/standard/fundManage/projectStatistics",
    method: "get",
    params,
  });
}
//经费支付管理在建项目信息统计
export function getPayManageStatisticsApi(params) {
  return request({
    url: "/business/standard/fundPayManage/projectStatistics",
    method: "get",
    params,
  });
}
//根据条件查询列表
export function getFundManageDataApi(params) {
  return request({
    url: "/business/standard/fundManage/list",
    method: "get",
    params,
  });
}
//根据资金项目管理ID查询信息
export function getFundManageInfoApi(manageId) {
  return request({
    url: `/business/standard/fundPayManage/fundManageInfo/${manageId}`,
    method: "get",
  });
}

//查询项目列表
export function getFundManageListApi(params) {
  return request({
    url: "/business/standard/fundManage/page",
    method: "get",
    params,
  });
}
//查询经费支付项目列表
export function getFundPayManageListApi(params) {
  return request({
    url: "/business/standard/fundPayManage/page",
    method: "get",
    params,
  });
}
//新增资金项目
export function addFundManageApi(data) {
  return request({
    url: "/business/standard/fundManage",
    method: "post",
    data,
  });
}
//新增经费支付项目
export function addFundPayManageApi(data) {
  return request({
    url: "/business/standard/fundPayManage",
    method: "post",
    data,
  });
}
//修改资金项目
export function editFundManageApi(id, data) {
  return request({
    url: `/business/standard/fundManage/${id}`,
    method: "put",
    data,
  });
}
//修改经费支付项目
export function editFundPayManageApi(id, data) {
  return request({
    url: `/business/standard/fundPayManage/${id}`,
    method: "put",
    data,
  });
}
//删除资金项目
export function delFundManageApi(id) {
  return request({
    url: `/business/standard/fundManage/${id}`,
    method: "delete",
  });
}
//删除经费支付项目
export function delFundPayManageApi(id) {
  return request({
    url: `/business/standard/fundPayManage/${id}`,
    method: "delete",
  });
}

//查询经费统计列表
export function getFundStatisticsApi(params) {
  return request({
    url: "/business/standard/fundStatistics/list",
    method: "get",
    params,
  });
}

//查询经费统计列表
export function detailFundStatisticsApi(id) {
  return request({
    url: `/business/standard/fundStatistics/${id}`,
    method: "get",
  });
}

//查询金额统计
export function getAmountApi(params) {
  return request({
    url: "/business/standard/fundStatistics/amount",
    method: "get",
    params,
  });
}
//获取管理单位经费统计数据
export function getUnitApi(params) {
  return request({
    url: "/business/standard/fundStatistics/unit",
    method: "get",
    params,
  });
}
