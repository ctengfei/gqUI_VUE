import request from '@/utils/request'

export function addDocument(data) {
    return request({
        url: '/business/waterUse/waterManager',
        method: 'post',
        data: data
    })
}

export function getDocument(query) {
    return request({
        url: '/business/waterUse/waterManager/page',
        method: 'get',
        params: query
    })
}

export function delDocument(skId) {
    return request({
        url: `/business/waterUse/waterManager/${skId}`,
        method: 'delete'
    })
}

export function updateDocument(skId,data) {
    return request({
        url: `/business/waterUse/waterManager/${skId}`,
        method: 'put',
        data: data
    })
}


