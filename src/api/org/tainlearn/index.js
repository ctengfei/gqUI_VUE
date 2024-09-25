import request from '@/utils/request'

export function addTain(data) {
    return request({
        url: '/business/standard/trainRecords',
        method: 'post',
        data: data
    })
}

export function getTain(query) {
    return request({
        url: '/business/standard/trainRecords/page',
        method: 'get',
        params: query
    })
}

export function delTain(spId) {
    return request({
        url: `/business/standard/trainRecords/${spId}`,
        method: 'delete',
    })
}

export function updateTain(spId,data) {
    return request({
        url: `/business/standard/trainRecords/${spId}`,
        method: 'PUT',
        data: data
    })
}
