import request from '@/utils/request'

export function addSens(data) {
    return request({
        url: '/business/drought/remoteSense',
        method: 'post',
        data: data
    })
}

export function getSens(query) {
    return request({
        url: '/business/drought/remoteSense/page',
        method: 'get',
        params: query
    })
}

export function delSens(id) {
    return request({
        url: `/business/drought/remoteSense/${id}`,
        method: 'delete'
    })
}

export function updateSens(id,data) {
    return request({
        url: `/business/drought/remoteSense/${id}`,
        method: 'put',
        data: data
    })
}

export function addSubSens(data) {
    return request({
            url: '/business/drought/remoteSenseMapPlantArea',
            method: 'post',
            data: data
        })
}

export function getSubSensList(query){
    return request({
            url: '/business/drought/remoteSenseMapPlantArea/list',
            method: 'get',
            params: query
        })
}

export function updateSubSens(id,data) {
    return request({
            url: `/business/drought/remoteSenseMapPlantArea/${id}`,
            method: 'put',
            data: data
        })
}

export function deleteSubSens(id){
    return request({
        url: `/business/drought/remoteSenseMapPlantArea/${id}`,
        method: 'delete'
    })
}


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
