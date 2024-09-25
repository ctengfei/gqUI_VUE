
import request from '@/utils/request'

export function addTask(data) {
    return request({
        url: '/business/standard/examTask',
        method: 'post',
        data: data,
    })
}

export function getTask(query) {
    return request({
        url: '/business/standard/examTask/page',
        method: 'get',
        params: query,
    })
}

export function getTempList(query) {
    return request({
            url: '/business/standard/examTemplate/list',
            method: 'get',
            params: query,
        })
}

export function getScoringObjId(id) {
    return request({
            url: `/business/standard/examTask/examUserScoreResult/${id}`,
            method: 'get',
        })

}

export function postBatchScoring(data) {
    return request({
            url: '/business/standard/examObjScore/createBatch',
            method: 'post',
            data: data,
        })
}

export function getScoringResult(id) {
    return request({
            url: `/business/standard/examTask/examObjScoreResult/${id}`,
            method: 'get',
        })
}