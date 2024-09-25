
import request from '@/utils/request'

export function addBz(data) {
    return request({
        url: '/business/base/pustBase',
        method: 'post',
        data: data
    })
}

export function getBz(query) {
    return request({
        url: '/business/base/pustBase/page',
        method: 'get',
        params: query
    })
}


export function delBz(bzId) {
    return request({
        url: `/business/base/pustBase/${bzId}`,
        method: 'delete'
    })
}

export function updateBz(bzId,data) {
    return request({
        url: `/business/base/pustBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportBzExcel(query){
    return request({
        url: 'business/base/pustBase/page/export',
        method: 'get',
        params: query
    })
}

