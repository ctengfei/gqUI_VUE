import request from '@/utils/request'

export function getSatelliteImage(query) {
    return request({
        url: '/business/bigScreen/home/getCloudChart',
        method: 'get',
        params: query,
    })
}
