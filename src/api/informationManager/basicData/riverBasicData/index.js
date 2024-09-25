import request from '@/utils/request'

export function addRiver(data) {
    return request({
        url: '/business/base/rvBase',
        method: 'post',
        data: data
    })
}

export function getRiver(query) {
    return request({
        url: '/business/base/rvBase/page',
        method: 'get',
        params: query
    })
}


export function delRiver(bzId) {
    return request({
        url: `/business/base/rvBase/${bzId}`,
        method: 'delete'
    })
}

export function updateRiver(bzId,data) {
    return request({
        url: `/business/base/rvBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportRiverExcel(query){
    return request({
        url: 'business/base/rvBase/page/export',
        method: 'get',
        params: query
    })
}



