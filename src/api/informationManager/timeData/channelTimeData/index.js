import request from '@/utils/request'

export function getChannel(query) {
    return request({
        url: '/business/realData/rvfcchB/page',
        method: 'get',
        params: query
    })
}

export function addChannel(data) {
    return request({
        url: '/business/realData/rvfcchB',
        method: 'post',
        data: data
    })
}

export function updateChannel(id,data) {
    return request({
        url: `/business/realData/rvfcchB/${id}`,
        method: 'put',
        data: data
    })
}

export function deleteChannel(id) {
    return request({
        url: `/business/realData/rvfcchB/${id}`,
        method: 'delete',
    })
}
