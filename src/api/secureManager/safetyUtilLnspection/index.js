import request from '@/utils/request'

export function getSecurityUntil(query) {
    return request({
        url: '/business/standard/safetyTool/page',
        method: 'get',
        params: query
    })
}

export function postSecurityUntil(data) {
    return request({
        url: '/business/standard/safetyTool',
        method: 'post',
        data: data
    })
}

export function deleteSecurityUntil(id) {
    return request({
        url: `/business/standard/safetyTool/${id}`,
        method: 'delete'
    })
}

export function updateSecuritUntil(id,data) {
    return request({
        url: `/business/standard/safetyTool/${id}`,
        method: 'put',
        data: data
    })
}