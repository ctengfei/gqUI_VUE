import request from '@/utils/request'

export function addPlatform(data) {
    return request({
        url: '/business/standard/appPlatform',
        method: 'post',
        data: data
    })
}

export function getPlatform(query) {
    return request({
        url: '/business/standard/appPlatform/list',
        method: 'get',
        params: query
    })
}

export function getPlatformInfo(id) {
    return request({
        url: `/business/standard/appPlatform/${id}`,
        method: 'get',
    })
}


export function delPlatform(bzId) {
    return request({
        url: `/business/standard/appPlatform/${bzId}`,
        method: 'delete'
    })
}

export function updatePlatform(bzId,data) {
    return request({
        url: `/business/standard/appPlatform/${bzId}`,
        method: 'put',
        data: data
    })
}