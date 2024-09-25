import request from '@/utils/request'

export function addInst(data) {
    return request({
        url: '/business/waterUse/waterApplyDl',
        method: 'post',
        data: data
    })
}

export function getInst(query) {
    return request({
        url: '/business/waterUse/waterApplyDl/page',
        method: 'get',
        params: query
    })
}

export function getInstList(query) {
    return request({
        url: '/business/waterUse/waterApply/list',
        method: 'get',
        params: query
    })
}

export function delInst(gqId) {
    return request({
        url: `/business/waterUse/waterApplyDl/${gqId}`,
        method: 'delete'
    })
}

export function updateInst(gqId, data) {
    return request({
        url: `/business/waterUse/waterApplyDl/${gqId}`,
        method: 'put',
        data: data
    })
}

export function getTransfer() {
    return request({
        url: '/business/waterUse/waterApplyDl/getOrderCode',
        method: 'get',
    })
}

export function getUserList(query) {
    return request({
        url: '/system/user/getUserList',
        method: 'get',
        params: query
    })
}

