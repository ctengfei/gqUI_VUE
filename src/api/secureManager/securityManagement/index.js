import request from '@/utils/request'

export function getSecurity(query) {
    return request({
        url: '/business/standard/safetySigns/page',
        method: 'get',
        params: query
    })
}

// 获取危险源管理
export function getDangerList(query) {
    return request({
        url: '/business/standard/dangerousSource/list',
        method: 'get',
        params: query
    })
}

export function postSecurity(data) {
    return request({
        url: '/business/standard/safetySigns',
        method: 'post',
        data: data
    })
}

export function deleteSecurity(id) {
    return request({
        url: `/business/standard/safetySigns/${id}`,
        method: 'delete'
    })
}

export function updateSecurity(id,data) {
    return request({
        url: `/business/standard/safetySigns/${id}`,
        method: 'put',
        data: data
    })
}