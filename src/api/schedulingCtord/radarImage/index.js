import request from '@/utils/request'

export function getRadarImage(query) {
    return request({
        url: '/business/bigScreen/home/getRadarChart',
        method: 'get',
        params: query,
    })
}