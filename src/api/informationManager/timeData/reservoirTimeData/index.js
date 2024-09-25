import request from '@/utils/request'

export function addRes(data) {
    return request({
        url: '/business/realData/rsvrR',
        method: 'post',
        data: data
    })
}

export function getRes(query) {
    return request({
        url: '/business/realData/rsvrR/page',
        method: 'get',
        params: query
    })
}

export function exportResExcel(query){
    return request({
        url: '/business/realData/rsvrR/page/export',
        method: 'get',
        params: query
    })
}



