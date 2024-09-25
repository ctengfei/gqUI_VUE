import request from '@/utils/request'

export function getLimit(query) {
    return request({
        url: '/business/realData/rsvrfsrB/page',
        method: 'get',
        params: query
    })
}

export function addLimit(data) {
    return request({
        url: '/business/realData/rsvrfsrB',
        method: 'post',
        data: data
    })
}

export function updateLimit(bzId,data) {
    return request({
        url: `/business/realData/rsvrfsrB/${bzId}`,
        method: 'put',
        data: data
    })
}

export function deleteLimit(id) {
    return request({
        url: `/business/realData/rsvrfsrB/${id}`,
        method: 'delete',
    })
}
