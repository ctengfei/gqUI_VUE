import request from '@/utils/request'

export function addInves(data) {
    return request({
        url: '/business/standard/safetyYhpc',
        method: 'post',
        data: data
    })
}

export function getInves(query) {
    return request({
        url: '/business/standard/safetyYhpc/page',
        method: 'get',
        params: query
    })
}


export function delInves(bzId) {
    return request({
        url: `/business/standard/safetyYhpc/${bzId}`,
        method: 'delete'
    })
}

export function updateInves(bzId,data) {
    return request({
        url: `/business/standard/safetyYhpc/${bzId}`,
        method: 'put',
        data: data
    })
}