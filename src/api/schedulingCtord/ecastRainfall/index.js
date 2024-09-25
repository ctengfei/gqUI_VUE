import request from '@/utils/request'

export function getEcast(query) {
    return request({
        url: '/bim/irrFlood/rainfallForecast/getLayerList',
        method: 'get',
        params: query,
    })
}
