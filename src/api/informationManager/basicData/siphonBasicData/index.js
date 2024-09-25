import request from '@/utils/request'

export function addSiphon(data) {
    return request({
        url: '/business/base/insiBase',
        method: 'post',
        data: data
    })
}

export function getSiphon(query) {
    return request({
        url: '/business/base/insiBase/page',
        method: 'get',
        params: query
    })
}

export function delSiphon(skId) {
    return request({
        url: `/business/base/insiBase/${skId}`,
        method: 'delete'
    })
}

export function updateSiphon(skId,data) {
    return request({
        url: `/business/base/insiBase/${skId}`,
        method: 'put',
        data: data
    })
}


