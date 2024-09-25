import request from '@/utils/request'

export function addDng(data) {
    return request({
        url: '/business/base/dpdsBase',
        method: 'post',
        data: data
    })
}

export function getDng(query) {
    return request({
        url: '/business/base/dpdsBase/page',
        method: 'get',
        params: query
    })
}


export function delDng(bzId) {
    return request({
        url: `/business/base/dpdsBase/${bzId}`,
        method: 'delete'
    })
}

export function updateDng(bzId,data) {
    return request({
        url: `/business/base/dpdsBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportDngExcel(query){
    return request({
        url: 'business/base/dpdsBase/page/export',
        method: 'get',
        params: query
    })
}


