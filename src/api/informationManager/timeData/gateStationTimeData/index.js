import request from '@/utils/request'

export function addWas(data) {
    return request({
        url: '/business/realData/wasR',
        method: 'post',
        data: data
    })
}

export function getWas(query) {
    return request({
        url: '/business/realData/wasR/page',
        method: 'get',
        params: query
    })
}

export function exportWasExcel(query){
    return request({
        url: '/business/realData/wasR/page/export',
        method: 'get',
        params: query
    })
}



