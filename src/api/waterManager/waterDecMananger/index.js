import request from '@/utils/request'

export function addDec(data) {
    return request({
        url: '/business/waterUse/waterApply',
        method: 'post',
        data: data
    })
}

export function getDec(query) {
    return request({
        url: '/business/waterUse/waterApply/page',
        method: 'get',
        params: query
    })
}

export function delDec(skId) {
    return request({
        url: `/business/waterUse/waterApply/${skId}`,
        method: 'delete'
    })
}

export function updateDec(skId,data) {
    return request({
        url: `/business/waterUse/waterApply/${skId}`,
        method: 'put',
        data: data
    })
}

