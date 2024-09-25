import request from '@/utils/request'



export function getBz(query) {
    return request({
        url: '/business/realData/pumpR/page',
        method: 'get',
        params: query
    })
}

