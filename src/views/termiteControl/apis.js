import request from "@/utils/request";

//查询白蚁防治列表
export function getControlRecordsApi(params) {
  return request({
    url: "/business/standard/termiteControlRecords/page",
    method: "get",
    params,
  });
}

//新增白蚁防治
export function addControlRecordsApi(data) {
  return request({
    url: "/business/standard/termiteControlRecords",
    method: "post",
    data,
  });
}

//查询白蚁防治列表
export function getControlByIdApi(id) {
  return request({
    url: `/business/standard/termiteControlRecords/${id}`,
    method: "get",
  });
}

//修改查询工程养护
export function editControlRecordsApi(id, data) {
  return request({
    url: `/business/standard/termiteControlRecords/${id}`,
    method: "put",
    data,
  });
}
//删除工程养护
export function delControlRecordsApi(id) {
  return request({
    url: `/business/standard/termiteControlRecords/${id}`,
    method: "delete",
  });
}
//查询白蚁防治情况统计列表
export function getStatisticsApi(params) {
  return request({
    url: "/business/standard/termiteControlRecords/page/statistics",
    method: "get",
    params,
  });
}
