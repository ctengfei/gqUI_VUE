import request from "@/utils/request";

// 配水方案名称
export function getResultList() {
    return request({
      url: "/bim/irrWaterResource/resultWirrSk/list",
      method: "get",
    });
}
// 渠首闸流量值回显
export function getIwrWraRealBy(params) {
    return request({
      url: "/bim/irrWaterResource/resultIwrWraReal/getIwrWraRealBy",
      method: "get",
      params
    });
}
// 获取渠首闸设计流量
export function getChanBase() {
  return request({
    url: '/business/base/chanBase/CT42120001',
    method: 'get',
  })
}
// 闸门名称下拉列表
export function getChanBaseList() {
  return request({
    url: '/bim/irrWaterResource/parmSluiceInfo/list',
    method: 'get',
  })
}
// 获取演进方案列表
export function getIwrWraReal(params) {
  return request({
    url: "/bim/irrWaterResource/parmSysHydraulic/page",
    method: "get",
    params
  });
}
// 获取演进方案详情 {id}
export function getCaseDetail(id) {
  return request({
    url: "/bim/irrWaterResource/parmSysHydraulic/" + id,
    method: "get",
  });
}

// 新增演进方案
export function addIwrWraReal(data) {
  return request({
    url: "/bim/irrWaterResource/parmSysHydraulic",
    method: "post",
    data,
  });
}
// 修改演进方案
export function updateIwrWraReal(id, data) {
  return request({
    url: "/bim/irrWaterResource/parmSysHydraulic/" + id,
    method: "put",
    data,
  });
}
// 删除演进方案
export function deleteIwrWraReal(id) {
  return request({
    url: "/bim/irrWaterResource/parmSysHydraulic/" + id,
    method: "delete",
  });
}
// 获取渠道纵剖面
export function getChannelProfile(params) {
  return request({
    url: "/bim/irrWaterResource/resultBnchHydro/getChannelProfile",
    method: "get",
    params
  });
}
// 运行模型 
export function runExcute(params) {
  return request({
    url: "/bim/irrWaterResource/parmSysHydraulic/excute",
    method: "get",
    params
  });
}
// 断面预报预警信息统计 
export function preAlarmList(params) {
  return request({
    url: "/bim/irrWaterResource/parmAlarmFcst/preAlarmList",
    method: "get",
    params
  });
}

// 预警参数列表 
export function getParmAlarmFcstList(params) {
  return request({
    url: "/bim/irrWaterResource/parmAlarmFcst/list",
    method: "get",
    params
  });
}

// 新增预警参数
export function addParmAlarmFcst(data) {
  return request({
    url: "/bim/irrWaterResource/parmAlarmFcst",
    method: "post",
    data
  });
}

// 编辑预警参数  
export function upDateParmAlarmFcst(data) {
  return request({
    url: "/bim/irrWaterResource/parmAlarmFcst/updateById",
    method: "put",
    data
  });
}

// 删除预警参数设置 
export function delParmAlarmFcst(bnch, rvskCode) {
  return request({
    url: "/bim/irrWaterResource/parmAlarmFcst/remove?bnch=" + bnch + "&rvskCode" + rvskCode,
    method: "delete",
  });
}

// 获取方案时间最大最小值 

export function getResultBnchHydroTimes(caseCode) {
  return request({
    url: "/bim/irrWaterResource/resultBnchHydro/getResultBnchHydroTimes?chanCode=CT42120001&caseCode=" + caseCode,
    method: "get",
  });
}

// 方案结果段位水位 /bim/irrWaterResource/parmAlarmFcst/branNewZist
export function getBranNewZist(params) {
  return request({
    url: "/bim/irrWaterResource/parmAlarmFcst/branNewZist",
    method: "get",
    params
  });
}

