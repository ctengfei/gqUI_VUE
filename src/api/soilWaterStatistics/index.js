import request from '@/utils/request'

export function addRemoteSenseMapPrimage(data) {
    return request({
        url: '/business/droughtWarning/remoteSenseMapPrimage',
        method: 'post',
        data: data
    })
}

export function getRemoteSenseMapPrimage(query) {
    return request({
        url: '/business/droughtWarning/remoteSenseMapPrimage/page',
        method: 'get',
        params: query
    })
}

export function getRemoteSenseMapPrimageList(query) {
    return request({
        url: '/business/droughtWarning/remoteSenseMapPrimage/list',
        method: 'get',
        params: query
    })
}




export function delRemoteSenseMapPrimage(bzId) {
    return request({
        url: `/business/droughtWarning/remoteSenseMapPrimage/${bzId}`,
        method: 'delete'
    })
}

export function updateRemoteSenseMapPrimage(bzId,data) {
    return request({
        url: `/business/droughtWarning/remoteSenseMapPrimage/${bzId}`,
        method: 'put',
        data: data
    })
}
