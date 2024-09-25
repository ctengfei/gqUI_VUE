import request from '@/utils/request'

export function addTraining(data) {
    return request({
        url: '/business/standard/emergencyDrill',
        method: 'post',
        data: data
    })
}

export function getTraining(query) {
    return request({
        url: '/business/standard/emergencyDrill/page',
        method: 'get',
        params: query
    })
}


export function delTraining(bzId) {
    return request({
        url: `/business/standard/emergencyDrill/${bzId}`,
        method: 'delete'
    })
}

export function updateTraining(bzId,data) {
    return request({
        url: `/business/standard/emergencyDrill/${bzId}`,
        method: 'put',
        data: data
    })
}