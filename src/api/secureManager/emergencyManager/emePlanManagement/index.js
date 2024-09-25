import request from '@/utils/request'

export function addEme(data) {
    return request({
        url: '/business/standard/safetyEmergencyPlan',
        method: 'post',
        data: data
    })
}

export function getEme(query) {
    return request({
        url: '/business/standard/safetyEmergencyPlan/page',
        method: 'get',
        params: query
    })
}

export function getEmeList(query) {
    return request({
            url: '/business/standard/safetyEmergencyPlan/list',
            method: 'get',
            params: query
        })
}


export function delEme(bzId) {
    return request({
        url: `/business/standard/safetyEmergencyPlan/${bzId}`,
        method: 'delete'
    })
}

export function updateEme(bzId,data) {
    return request({
        url: `/business/standard/safetyEmergencyPlan/${bzId}`,
        method: 'put',
        data: data
    })
}

