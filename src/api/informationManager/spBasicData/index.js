import request from '@/utils/request'

export function addSp(data) {
    return request({
        url: '/business/base/wmstBase',
        method: 'post',
        data: data
    })
}

export function getVideoList(query) {
    return request({
        url: '/business/base/wmstBase/page',
        method: 'get',
        params: query
    })
}

// 同步刷新视频信息
export function syncVideoList(query) {
    return request({
        url: '/business/base/wmstBase/getSyncVideoList',
        method: 'get',
        params: query
    })
}
export function delSp(spId) {
    return request({
        url: `/business/base/wmstBase/${spId}`,
        method: 'delete',
    })
}

export function updateSp(spId,data) {
    return request({
        url: `/business/base/wmstBase/${spId}`,
        method: 'PUT',
        data: data
    })
}

export function exportSpExcel(query){
    return request({
        url: 'business/base/wmstBase/page/export',
        method: 'get',
        params: query
    })
}
// 视频状态修改

export function updateSpStatus(params) {
    return request({
        url: `/business/base/wmstBase/changeStatus`,
        method: 'get',
        params
    })
}