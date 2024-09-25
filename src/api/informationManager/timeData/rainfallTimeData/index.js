import request from '@/utils/request'

export function addRain(data) {
    return request({
        url: '/business/realData/pptnR',
        method: 'post',
        data: data
    })
}

export function getRaine(query) {
    return request({
        url: '/business/realData/pptnR/page',
        method: 'get',
        params: query
    })
}

export function exportRainExcel(query){
    return request({
        url: '/business/realData/pptnR/page/export',
        method: 'get',
        params: query
    })
}



