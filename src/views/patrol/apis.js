import request from "@/utils/request";


//查询巡查列表
export function getPatrolPlanApi(query) {
  return request({
    url: "/business/patrol/patrolPlan/page",
    method: "get",
    params: query,
  });
}
//查询巡查统计
export function getStatisticsApi(query) {
  return request({
    url: "/business/patrol/patrolPlan/statistics",
    method: "get",
    params: query,
  });
}
//查询巡查范围列表
export function getPatrolRangeApi(query) {
  return request({
    url: "/business/patrol/patrolAddr/page",
    method: "get",
    params: query,
  });
}
//新增巡查范围
export function addPatrolRangeApi(data) {
  return request({
    url: "/business/patrol/patrolAddr",
    method: "post",
    data,
  });
}
//修改巡查范围
export function editPatrolRangeApi(id, data) {
  return request({
    url: `/business/patrol/patrolAddr/${id}`,
    method: "put",
    data,
  });
}

//查询巡查范围详情
export function detailPatrolRangeApi(id) {
  return request({
    url: `/business/patrol/patrolAddr/${id}`,
    method: "get",
  });
}
//删除巡查范围
export function delPatrolRangeApi(id) {
  return request({
    url: `/business/patrol/patrolAddr/${id}`,
    method: "delete",
  });
}
//根据ID查询结果
export function getResultApi(id) {
  return request({
    url: `/business/patrol/patrolPlan/result/${id}`,
    method: "get",
  });
}
//根据ID查询结果
export function getLogLatListApi(query) {
  return request({
    url: `/business/patrol/patrolLoglat/list`,
    method: "get",
    params: query,
  });
}
//查询异常检查部位信息
export function getAbnormalPartListApi(id) {
  return request({
    url: `/business/patrol/patrolPlan/getAbnormalPartList/${id}`,
    method: "get",
  });
}
//根据ID查询部位详情
export function getPatrolDetailApi(id) {
  return request({
    url: `/business/patrol/patrolCheckpointRecords/${id}`,
    method: "get",
  });
}
// 查询问题列表 
export function getPatrolProblem(params) {
  return request({
    url: `/business/patrol/patrolProblem/page`,
    method: "get",
    params
  });
}
// 问题上报详情
export function getPatrolProblemDetail(id) {
  return request({
    url: `/business/patrol/patrolProblem/${id}`,
    method: "get",
  });
}
//dev-api