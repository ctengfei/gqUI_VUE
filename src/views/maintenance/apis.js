import request from "@/utils/request";

//查询设备列表
export function getDeviceBaseApi(params) {
  return request({
    url: "/business/attBase/deviceBase/list",
    method: "get",
    params,
  });
}
//查询工程养护列表
export function getProtectEngRecordsApi(params) {
  return request({
    url: "/business/standard/protectEngRecords/page",
    method: "get",
    params,
  });
}
//新增查询工程养护
export function addProtectEngRecordsApi(data) {
  return request({
    url: "/business/standard/protectEngRecords",
    method: "post",
    data,
  });
}
//修改查询工程养护
export function editProtectEngRecordsApi(id, data) {
  return request({
    url: `/business/standard/protectEngRecords/${id}`,
    method: "put",
    data,
  });
}
//删除工程养护
export function delProtectEngRecordsApi(id) {
  return request({
    url: `/business/standard/protectEngRecords/${id}`,
    method: "delete",
  });
}

//查询设备维护列表
export function getProtectRecordsApi(params) {
  return request({
    url: "/business/attBase/protectRecords/page",
    method: "get",
    params,
  });
}

//新增设备维护
export function addProtectRecordsApi(data) {
  return request({
    url: "/business/attBase/protectRecords",
    method: "post",
    data,
  });
}
//删除设备维护
export function delProtectRecordsApi(id) {
  return request({
    url: `/business/attBase/protectRecords/${id}`,
    method: "delete",
  });
}

//修改设备维护
export function editProtectRecordsApi(id, data) {
  return request({
    url: `/business/attBase/protectRecords/${id}`,
    method: "put",
    data,
  });
}
