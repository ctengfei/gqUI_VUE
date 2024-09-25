import request from '@/utils/request'

export function getSoil(query) {
    return request({
        url: '/business/realData/soilR/page',
        method: 'get',
        params: query
    })
}
