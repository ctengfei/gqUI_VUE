import request from '@/utils/request'

export function addAqu(data) {
    return request({
        url: '/business/base/flumBase',
        method: 'post',
        data: data
    })
}

export function getAqu(query) {
    return request({
        url: '/business/base/flumBase/page',
        method: 'get',
        params: query
    })
}


export function delAqu(bzId) {
    return request({
        url: `/business/base/flumBase/${bzId}`,
        method: 'delete'
    })
}

export function updateAqu(bzId,data) {
    return request({
        url: `/business/base/flumBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportAquExcel(query){
    return request({
        url: 'business/base/flumBase/page/export',
        method: 'get',
        params: query
    })
}

