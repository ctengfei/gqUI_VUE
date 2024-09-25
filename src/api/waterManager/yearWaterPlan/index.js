import request from '@/utils/request'

export function addPlan(data) {
    return request({
        url: '/business/waterUse/waterPlan',
        method: 'post',
        data: data
    })
}

// 查询灌区
export function getPlan(query) {
    return request({
        url: '/business/waterUse/waterPlan/page',
        method: 'get',
        params: query
    })
}

export function delPlan(gqId) {
    return request({
        url: `/business/waterUse/waterPlan/${gqId}`,
        method: 'delete'
    })
}


export function updatePlan(gqId,data) {
    return request({
        url: `/business/waterUse/waterPlan/${gqId}`,
        method: 'put',
        data: data
    })
}


