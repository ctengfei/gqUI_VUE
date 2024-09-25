import request from '@/utils/request'

export function addHyd(data) {
    return request({
        url: '/business/base/hystBase',
        method: 'post',
        data: data
    })
}

export function getHyd(query) {
    return request({
        url: '/business/base/hystBase/page',
        method: 'get',
        params: query
    })
}


export function delHyd(bzId) {
    return request({
        url: `/business/base/hystBase/${bzId}`,
        method: 'delete'
    })
}

export function updateHyd(bzId,data) {
    return request({
        url: `/business/base/hystBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportHydExcel(query){
    return request({
        url: 'business/base/hystBase/page/export',
        method: 'get',
        params: query
    })
}


