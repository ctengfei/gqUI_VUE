import request from "@/utils/request";

// 预警查看列表
export function getAlarmList(query) {
    return request({
      url: "/bim/irrWaterResource/parmAlarmSt/page",
      method: "get",
      params: query,
    });
}
// 新增预警
 export function addAlarm(data) {
    return request({
      url: "/bim/irrWaterResource/parmAlarmSt",
      method: "post",
      data,
    });
}
// 删除预警参数
export function deleteAlarm(id) {
    return request({
      url: "/bim/irrWaterResource/parmAlarmSt/" + id,
      method: "delete",
    });
}
// 修改预警参数
export function updateAlarm(id, data) {
    return request({
      url: "/bim/irrWaterResource/parmAlarmSt/" + id,
      method: "put",
      data,
    });
}
// 监测站列表
 export function getMonitorList() {
    return request({
      url: "/business/base/stBase/list?stType=ZZ&type=0",
      method: "get",
    });
}