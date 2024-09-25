

import request from '@/utils/request'

export function addSli(data) {
    return request({
        url: '/business/base/wagaBase',
        method: 'post',
        data: data
    })
}

export function getSli(query) {
    return request({
        url: '/business/base/wagaBase/page',
        method: 'get',
        params: query
    })
}


export function delSli(bzId) {
    return request({
        url: `/business/base/wagaBase/${bzId}`,
        method: 'delete'
    })
}

export function updateSli(bzId,data) {
    return request({
        url: `/business/base/wagaBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportSliExcel(query){
    return request({
        url: 'business/base/wagaBase/page/export',
        method: 'get',
        params: query
    })
}

