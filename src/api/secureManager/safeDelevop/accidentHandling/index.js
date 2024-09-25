import request from '@/utils/request'

export function addAccident(data) {
    return request({
        url: '/business/standard/safetyAccident',
        method: 'post',
        data: data
    })
}

export function getAccident(query) {
    return request({
        url: '/business/standard/safetyAccident/page',
        method: 'get',
        params: query
    })
}

export function delAccident(bzId) {
    return request({
        url: `/business/standard/safetyAccident/${bzId}`,
        method: 'delete'
    })
}

export function updateAccident(bzId,data) {
    return request({
        url: `/business/standard/safetyAccident/${bzId}`,
        method: 'put',
        data: data
    })
}