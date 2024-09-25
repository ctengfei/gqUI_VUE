import request from '@/utils/request'

export function addIntake(data) {
    return request({
        url: '/business/base/wainBase',
        method: 'post',
        data: data
    })
}

export function getIntake(query) {
    return request({
        url: '/business/base/wainBase/page',
        method: 'get',
        params: query
    })
}


export function delIntake(bzId) {
    return request({
        url: `/business/base/wainBase/${bzId}`,
        method: 'delete'
    })
}

export function updateIntake(bzId,data) {
    return request({
        url: `/business/base/wainBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function exportIntakeExcel(query){
    return request({
        url: 'business/base/wainBase/page/export',
        method: 'get',
        params: query
    })
}


