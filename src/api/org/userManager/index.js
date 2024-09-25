import request from '@/utils/request'

export function addUserInner(data) {
    return request({
        url: '/business/standard/personnel',
        method: 'post',
        data: data
    })
}

export function getUserInner(query) {
    return request({
        url: '/business/standard/personnel/page',
        method: 'get',
        params: query
    })
}

export function delUserInner(id) {
    return request({
        url: `/business/standard/personnel/${id}`,
        method: 'delete'
    })
}

export function updateUserInner(skId,data) {
    return request({
        url: `/business/standard/personnel/${skId}`,
        method: 'put',
        data: data
    })
}

export function getTemp(query) {
    return request({
            url: '/business/standard/personnel/importTemplate',
            method: 'get',
            params: query
        })
}

export function getUserOutList(query) {
    return request({
        url: '/business/standard/personnel/getPersonCount',
        method: 'get',
        params: query
    })
}


