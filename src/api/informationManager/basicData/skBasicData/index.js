import request from '@/utils/request'

export function addSk(data) {
    return request({
        url: '/business/base/resBase',
        method: 'post',
        data: data
    })
}

export function getSk(query) {
    return request({
        url: '/business/base/resBase/page',
        method: 'get',
        params: query
    })
}
export function getResList(query) {
    return request({
        url: '/business/base/resBase/list',
        method: 'get',
        params: query
    })
}
export function delSk(skId) {
    return request({
        url: `/business/base/resBase/${skId}`,
        method: 'delete'
    })
}

export function updateSk(skId,data) {
    return request({
        url: `/business/base/resBase/${skId}`,
        method: 'put',
        data: data
    })
}

export function exportSkExcel(query){
    return request({
        url: 'business/base/resBase/page/export',
        method: 'get',
        params: query
    })
}
