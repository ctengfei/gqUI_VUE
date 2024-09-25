/*灌区水量调度*/
import request from "@/utils/request";

//新增方案
export function addScenarios(data) {
  return request({
    url: "/bim/irrWaterResource/resultWirrSk",
    method: "post",
    data,
  });
}
//查询方案列表
export function getScenariosList(params) {
  return request({
    url: "/bim/irrWaterResource/resultWirrSk/page",
    method: "get",
    params,
  });
}
//查询渠道列表
export function getChannelList(params) {
  return request({
    url: "/bim/irrWaterResource/attChanTopology/list",
    method: "get",
    params,
  });
}
//删除方案
export function delScenarios(allocCode) {
  return request({
    url: `/bim/irrWaterResource/resultWirrSk/${allocCode}`,
    method: "delete",
  });
}

//更新需水量
export function updateWaterDemand(data) {
  return request({
    url: `/bim/irrWaterResource/tableWreqDetail/updateById`,
    method: "put",
    data,
  });
}

//查询方案对应需水量列表
export function getWaterDemandList(params) {
  return request({
    url: "/bim/irrWaterResource/resultIwrWraReal/list",
    method: "get",
    params,
  });
}

//查询需水填报历史表
export function gettableWreqDetail(params) {
  return request({
    url: "/bim/irrWaterResource/tableWreqDetail/page",
    method: "get",
    params,
  });
}

//更新轮灌组
export function updateStatic(allocCode, data) {
  return request({
    url: `/bim/irrWaterResource/staticIrrigationPriorityReal/${allocCode}`,
    method: "put",
    data,
  });
}

//查询方案对应轮灌组列表
export function getStaticList(params) {
  return request({
    url: "/bim/irrWaterResource/staticIrrigationPriorityReal/list",
    method: "get",
    params,
  });
}
//查询配水结果列表
export function getResultList(params) {
  return request({
    url: "/bim/irrWaterResource/resultIrrAllocationReal/list",
    method: "get",
    params,
  });
}

//查询灌溉量柱状图
export function getWaterResource(params) {
  return request({
    url: "/bim/irrWaterResource/resultIrrAllocationReal/wirrStatistics",
    method: "get",
    params,
  });
}
//查询灌溉流量图
export function getStatistics(params) {
  return request({
    url: "/bim/irrWaterResource/resultIrrAllocationReal/qirrStatistics",
    method: "get",
    params,
  });
}

//渠道纵剖面
export function getSection(params) {
  return request({
    url: "/bim/irrWaterResource/resultBnchQForecast/bnchStatistics",
    method: "get",
    params,
  });
}

//查询最大水位和最大流量
export function getWaterResults(params) {
  return request({
    url: "/bim/irrWaterResource/resultBnchQForecast/bnchResults",
    method: "get",
    params,
  });
}

//根据水位,流量列表
export function getWaterList(params) {
  return request({
    url: "/bim/irrWaterResource/resultBnchQForecast/list",
    method: "get",
    params,
  });
}

//水动力模型糙率参列表
export function getSectionList(params) {
  return request({
    url: "/bim/irrWaterResource/parmRoughnessChannelSection/page",
    method: "get",
    params,
  });
}

//水动力模型糙率新增
export function addChannelSection(data) {
  return request({
    url: "/bim/irrWaterResource/parmRoughnessChannelSection",
    method: "post",
    data,
  });
}
//水动力模型糙率修改
export function updateChannelSection(data) {
  return request({
    url: "/bim/irrWaterResource/parmRoughnessChannelSection/update",
    method: "put",
    data,
  });
}
//水动力模型糙率删除
export function delChannelSection(params) {
  return request({
    url: `/bim/irrWaterResource/parmRoughnessChannelSection/remove`,
    method: "delete",
    params,
  });
}
//水动力模型糙率删除
export function getChanlist(params) {
  return request({
    url: `/bim/irrWaterResource/parmRoughnessChannelSection/getChanlist`,
    method: "get",
    params,
  });
}
//渠道关系列表
export function getChannelPageList(params) {
  return request({
    url: "/bim/irrWaterResource/attChanTopology/page",
    method: "get",
    params,
  });
}

//渠道关系新增
export function addAttChanTopology(data) {
  return request({
    url: "/bim/irrWaterResource/attChanTopology",
    method: "post",
    data,
  });
}

//渠道关系修改
export function updateAttChanTopology(chanCode, data) {
  return request({
    url: `/bim/irrWaterResource/attChanTopology/${chanCode}`,
    method: "put",
    data,
  });
}

//渠道关系删除
export function delAttChanTopology(chanCode) {
  return request({
    url: `/bim/irrWaterResource/attChanTopology/${chanCode}`,
    method: "delete",
  });
}

export function getResultWirrSk(id) {
  return request({
    url: `/bim/irrWaterResource/resultWirrSk/${id}`,
    method: "get",
  });
}

export function putResultWirrSk(allocCode,data) {
  return request({
    url: `/bim/irrWaterResource/resultWirrSk/${allocCode}`,
    data,
    method: "put",
  });
}

export function getAllocationWraBtn(params) {
  return request({
    url: `/bim/irrWaterResource/resultIrrAllocationReal/getAllocationWraBtn`,
    method: "get",
    params
  });
}
// 有效蓄水量
export function getResultWirrStorge() {
  return request({
    url: '/bim/irrWaterResource/resultWirrSk/calculateEfWaterStorage',
    method: 'get',
  })
}

// 新增需水填报 
export function resultIwrWraReal(data) {
  return request({
    url: '/bim/irrWaterResource/resultIwrWraReal',
    method: 'post',
    data
  })
}
// 新增方案时，获取最大最小时间
export function getWreqDetailOpenMaxMinTime(query) {
  return request({
    url: '/bim/irrWaterResource/tableWreqDetail/getTableWreqDetailOpenMaMinVoBy',
    method: 'get',
    params: query
  })
}
// 删除需水填报 
export function removeWreqDetail(data) {
  return request({
    url: '/bim/irrWaterResource/tableWreqDetail/remove',
    method: 'delete',
    data: data
  })
}
// 批量删除需水填报 
export function removeBatchWreqDetail(data) {
  return request({
    url: '/bim/irrWaterResource/tableWreqDetail/removeBatch',
    method: 'delete',
    data: data
  })
}
