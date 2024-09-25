import request from '@/utils/request'

export function addHazard(data) {
    return request({
        url: '/business/standard/dangerousSource',
        method: 'post',
        data: data
    })
}

export function getHazard(query) {
    return request({
        url: '/business/standard/dangerousSource/page',
        method: 'get',
        params: query
    })
}


export function delHazard(bzId) {
    return request({
        url: `/business/standard/dangerousSource/${bzId}`,
        method: 'delete'
    })
}

export function updateHazard(bzId,data) {
    return request({
        url: `/business/standard/dangerousSource/${bzId}`,
        method: 'put',
        data: data
    })
}