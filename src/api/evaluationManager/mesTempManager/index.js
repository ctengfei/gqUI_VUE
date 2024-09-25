
import request from '@/utils/request'

export function addMesTemp(data) {
    return request({
        url: '/business/standard/examTemplate',
        method: 'post',
        data: data
    })
}

export function getMesTemp(query) {
    return request({
        url: '/business/standard/examTemplate/page',
        method: 'get',
        params: query
    })
}

export function getIdMesTemp(id) {
    return request({
        url: `/business/standard/examTemplate/${id}`,
        method: 'get',
    })
}

export function delMesTemp(bzId) {
    return request({
        url: `/business/standard/examTemplate/${bzId}`,
        method: 'delete'
    })
}

export function updateStatus(bzId,data) {
    return request({
            url: `/business/standard/examTemplate/editStatus/${bzId}`,
            method: 'put',
            params: data
        })
}

export function updateMesTemp(bzId,data) {
    return request({
        url: `/business/standard/examTemplate/${bzId}`,
        method: 'put',
        data: data
    })
}


