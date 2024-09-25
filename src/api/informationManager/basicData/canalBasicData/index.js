import request from '@/utils/request'

export function addCan(data) {
    return request({
        url: '/business/base/chanBase',
        method: 'post',
        data: data
    })
}

export function getCan(query) {
    return request({
        url: '/business/base/chanBase/page',
        method: 'get',
        params: query
    })
}

export function getCanList(query) {
    return request({
        url: '/business/base/chanBase/list',
        method: 'get',
        params: query
    })
}

export function getGqList(query){
    return request({
            url: '/business/base/irrBase/list',
            method: 'get',
            params: query
        })
}

export function delCan(bzId) {
    return request({
        url: `/business/base/chanBase/${bzId}`,
        method: 'delete'
    })
}

export function updateCan(bzId,data) {
    return request({
        url: `/business/base/chanBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportCanExcel(query){
    return request({
        url: 'business/base/chanBase/page/export',
        method: 'get',
        params: query
    })
}


