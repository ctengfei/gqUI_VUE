import request from '@/utils/request'

export function addIntakeUser(data) {
    return request({
        url: '/business/base/wiuBase',
        method: 'post',
        data: data
    })
}

export function getIntakeUser(query) {
    return request({
        url: '/business/base/wiuBase/page',
        method: 'get',
        params: query
    })
}


export function delIntakeUser(bzId) {
    return request({
        url: `/business/base/wiuBase/${bzId}`,
        method: 'delete'
    })
}

export function updateIntakeUser(bzId,data) {
    return request({
        url: `/business/base/wiuBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportIntakeUserExcel(query){
    return request({
        url: 'business/base/wiuBase/page/export',
        method: 'get',
        params: query
    })
}


