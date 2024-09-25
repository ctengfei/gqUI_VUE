import request from '@/utils/request'

export function addHl(data) {
    return request({
        url: '/bim/resFlood/prediction/runResForecast',
        method: 'post',
        data: data
    })
}

export function postSw(data) {
    return request({
        url: '/business/realData/rsvrR/getRsveRDataByTime',
        method: 'post',
        data: data
    })
}

