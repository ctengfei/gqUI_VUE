import request from '@/utils/request'

export function getMonthEco(query) {
    return request({
        url: '/bim/resWaterResource/demand/getEcoForecastYearChart',
        method: 'get',
        params: query
    })
}

export function getCalcEcoEqBtr(query) {
    return request({
            url: '/bim/resWaterResource/demand/calcEcoEqBtn',
            method: 'get',
            params: query
        })
}