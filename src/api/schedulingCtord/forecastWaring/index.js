import request from "@/utils/request";

// 查询阈值
export function getAreaRainfallWaring(query) {
    return request({
        url: '/business/forecast/areaRainfallWaring/list',
        method: 'get',
        params: query
    })
}

//新增阈值
export function addAreaRainfallWaring(data) {
    return request({
        url: '/business/forecast/areaRainfallWaring',
        method: 'post',
        data: data
    })
}

// 修改阈值
export function putAreaRainfallWaring(id,data) {
    return request({
        url: `/business/forecast/areaRainfallWaring/${id}`,
        method: 'PUT',
        data: data
    })
}

//查询面雨量
export function getAreaRainfallWaringList(query) {
    return request({
        url: '/business/forecast/areaRainfallWaring/areaRainfallList',
        method: 'get',
        params: query
    })
}




