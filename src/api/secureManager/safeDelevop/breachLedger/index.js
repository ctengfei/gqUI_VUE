import request from '@/utils/request'

export function addBreach(data) {
    return request({
        url: '/business/standard/safetyYhtz',
        method: 'post',
        data: data
    })
}

export function getBreach(query) {
    return request({
        url: '/business/standard/safetyYhtz/page',
        method: 'get',
        params: query
    })
}


export function delBreach(bzId) {
    return request({
        url: `/business/standard/safetyYhtz/${bzId}`,
        method: 'delete'
    })
}

export function updateBreach(bzId,data) {
    return request({
        url: `/business/standard/safetyYhtz/${bzId}`,
        method: 'put',
        data: data
    })
}