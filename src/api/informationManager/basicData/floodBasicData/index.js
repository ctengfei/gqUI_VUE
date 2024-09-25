import request from '@/utils/request'

export function addFl(data) {
    return request({
        url: '/business/standard/fxTeam',
        method: 'post',
        data: data
    })
}

export function getFl(query) {
    return request({
        url: '/business/standard/fxTeam/page',
        method: 'get',
        params: query
    })
}


export function delFl(bzId) {
    return request({
        url: `/business/standard/fxTeam/${bzId}`,
        method: 'delete'
    })
}

export function updateFl(bzId,data) {
    return request({
        url: `/business/standard/fxTeam/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportFlExcel(query){
    return request({
        url: 'business/attBase/fxTeam/page/export',
        method: 'get',
        params: query
    })
}


