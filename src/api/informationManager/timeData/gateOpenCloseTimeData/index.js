import request from '@/utils/request'

export function getGateOpenClose(query) {
    return request({
        url: '/business/realData/gateR/page',
        method: 'get',
        params: query
    })
}
