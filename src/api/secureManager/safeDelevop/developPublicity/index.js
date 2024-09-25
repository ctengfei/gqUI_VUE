import request from '@/utils/request'
export function addPublicty(data) {
    return request({
        url: '/business/standard/safetyProduction',
        method: 'post',
        data: data,
    })
}

export function getPublicty(query) {
    return request({
        url: '/business/standard/safetyProduction/page',
        method: 'get',
        params: query
    })
}

export function delPublicty(bzId) {
    return request({
        url: `/business/standard/safetyProduction/${bzId}`,
        method: 'delete'
    })
}

export function updatePublicty(bzId, data) {
    return request({
        url: `/business/standard/safetyProduction/${bzId}`,
        method: 'put',
        data: data,
    })
}
