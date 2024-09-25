import request from '@/utils/request'

export function addReform(data) {
    return request({
        url: '/business/standard/waterPriceReform',
        method: 'post',
        data: data
    })
}

export function getReform(query) {
    return request({
        url: '/business/standard/waterPriceReform/page',
        method: 'get',
        params: query
    })
}

export function delReform(skId) {
    return request({
        url: `business/standard/waterPriceReform/${skId}`,
        method: 'delete'
    })
}

export function updateReform(skId,data) {
    return request({
        url: `business/standard/waterPriceReform/${skId}`,
        method: 'put',
        data: data
    })
}

