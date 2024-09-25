import request from '@/utils/request'

export function addSve(data) {
    return request({
        url: '/business/base/stBase',
        method: 'post',
        data: data
    })
}

export function getSve(query) {
    return request({
        url: '/business/base/stBase/page',
        method: 'get',
        params: query
    })
}


export function delSve(bzId) {
    return request({
        url: `/business/base/stBase/${bzId}`,
        method: 'delete'
    })
}

export function updateSve(bzId,data) {
    return request({
        url: `/business/base/stBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportSveExcel(query){
    return request({
        url: 'business/base/stBase/page/export',
        method: 'get',
        params: query
    })
}

