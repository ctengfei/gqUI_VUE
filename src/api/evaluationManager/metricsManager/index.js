
import request from '@/utils/request'

export function addEvaluation(data) {
    return request({
        url: '/business/standard/examIndex',
        method: 'post',
        data: data
    })
}

export function getEvaluation(query) {
    return request({
        url: '/business/standard/examIndex/page',
        method: 'get',
        params: query
    })
}

export function getEvaluationId(id) {
    return request({
        url: `/business/standard/examIndex/${id}`,
        method: 'get',
    })
}

export function delEvaluation(bzId) {
    return request({
        url: `/business/standard/examIndex/${bzId}`,
        method: 'delete'
    })
}

export function updateEvaluation(bzId,data) {
    return request({
        url: `/business/standard/examIndex/${bzId}`,
        method: 'put',
        data: data
    })
}


