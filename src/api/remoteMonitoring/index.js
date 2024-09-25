import request from '@/utils/request'

export function getRemoteSelect(query) {
    return request({
        url: '/business/drought/remoteSense/list',
        method: 'get',
        params: query
    })
}

export function getSense(query) {
    return request({
        url: `/business/drought/remoteSense/getMapSenseListByMapId`,
        method: 'get',
        params: query
    })
}

export function getPlant(query) {
    return request({
            url: `/business/drought/remoteSenseMapPlantArea/list`,
            method: 'get',
        params: query
        })
}