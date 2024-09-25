import request from '@/utils/request'

export function getCapacityCurve(query) {
    return request({
        url: '/business/realData/zvarlB/page',
        method: 'get',
        params: query
    })
}
