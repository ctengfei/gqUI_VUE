
import request from '@/utils/request'

export function addCle(data) {
    return request({
        url: '/business/base/culvBase',
        method: 'post',
        data: data
    })
}

export function getCle(query) {
    return request({
        url: '/business/base/culvBase/page',
        method: 'get',
        params: query
    })
}


export function delCle(bzId) {
    return request({
        url: `/business/base/culvBase/${bzId}`,
        method: 'delete'
    })
}

export function updateCle(bzId,data) {
    return request({
        url: `/business/base/culvBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportCleExcel(query){
    return request({
        url: 'business/base/culvBase/page/export',
        method: 'get',
        params: query
    })
}


