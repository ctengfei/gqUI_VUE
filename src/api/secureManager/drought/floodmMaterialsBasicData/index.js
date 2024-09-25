import request from '@/utils/request'

export function addFx(data) {
    return request({
        url: '/business/standard/fxObject',
        method: 'post',
        data: data
    })
}

export function getFx(query) {
    return request({
        url: '/business/standard/fxObject/page',
        method: 'get',
        params: query
    })
}

export function delFx(bzId) {
    return request({
        url: `/business/standard/fxObject/${bzId}`,
        method: 'delete'
    })
}

export function updateFx(bzId,data) {
    return request({
        url: `/business/standard/fxObject/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportFxExcel(query){
    return request({
        url: 'business/attBase/fxObject/page/export',
        method: 'get',
        params: query
    })
}


