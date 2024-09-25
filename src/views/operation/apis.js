import request from "@/utils/request";

//新增文件
export function addOperateApi(data) {
  return request({
    url: "/business/standard/operateRule",
    method: "post",
    data,
  });
}
//查询文件列表
export function getOperateListApi(params) {
  return request({
    url: "/business/standard/operateRule/page",
    method: "get",
    params,
  });
}
//删除文件
export function delOperateApi(id) {
  return request({
    url: `/business/standard/operateRule/${id}`,
    method: "delete",
  });
}
//修改文件
export function editOperateApi(id, data) {
  return request({
    url: `/business/standard/operateRule/${id}`,
    method: "put",
    data,
  });
}

//查询操作记录列表
export function getOperateLogApi(params) {
  return request({
    url: "/business/standard/operateLog/page",
    method: "get",
    params,
  });
}
//删除操作记录
export function delOperateLogApi(id) {
  return request({
    url: `/business/standard/operateLog/${id}`,
    method: "delete",
  });
}

//新增操作记录
export function addOperateLogApi(data) {
  return request({
    url: "/business/standard/operateLog",
    method: "post",
    data,
  });
}
//修改操作记录
export function editOperateLogApi(id, data) {
  return request({
    url: `/business/standard/operateLog/${id}`,
    method: "put",
    data,
  });
}
