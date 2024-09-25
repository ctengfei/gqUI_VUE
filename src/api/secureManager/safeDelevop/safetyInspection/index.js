import request from '@/utils/request'

export function addInsper(data) {
    return request({
        url: '/business/standard/safetyCheck',
        method: 'post',
        data: data
    })
}

export function getInsper(query) {
    return request({
        url: '/business/standard/safetyCheck/page',
        method: 'get',
        params: query
    })
}


export function delInsper(bzId) {
    return request({
        url: `/business/standard/safetyCheck/${bzId}`,
        method: 'delete'
    })
}

export function updateInsper(bzId,data) {
    return request({
        url: `/business/standard/safetyCheck/${bzId}`,
        method: 'put',
        data: data
    })
}