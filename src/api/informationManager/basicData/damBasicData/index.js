import request from '@/utils/request'

export function addDam(data) {
    return request({
        url: '/business/base/damBase',
        method: 'post',
        data: data
    })
}

export function getDam(query) {
    return request({
        url: '/business/base/damBase/page',
        method: 'get',
        params: query
    })
}


export function delDam(bzId) {
    return request({
        url: `/business/base/damBase/${bzId}`,
        method: 'delete'
    })
}

export function updateDam(bzId,data) {
    return request({
        url: `/business/base/damBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportDamExcel(query){
    return request({
        url: 'business/base/damBase/page/export',
        method: 'get',
        params: query
    })
}


