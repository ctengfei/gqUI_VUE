import request from '@/utils/request'

export function getLakeIndicator(query) {
    return request({
        url: '/business/realData/rsvrfcchB/page',
        method: 'get',
        params: query
    })
}

export function addLakeIndicator(data) {
    return request({
        url: '/business/realData/rsvrfcchB',
        method: 'post',
        data: data
    })
}

export function updateLakeIndicator(bzId,data) {
    return request({
        url: `/business/realData/rsvrfcchB/${bzId}`,
        method: 'put',
        data: data
    })
}

export function getSkList(query) {
    return request({
        url: '/business/base/stBase/list',
        method: 'get',
        params: query
    })
}

export function deleteLakeIndicator(id) {
    return request({
        url: `/business/realData/rsvrfcchB/${id}`,
        method: 'delete',
    })
}



