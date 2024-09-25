import request from '@/utils/request'

export function getTimeRain(query) {
    return request({
        url: '/business/bigScreen/home/getSiteInfoList',
        method: 'get',
        params: query
    })
}