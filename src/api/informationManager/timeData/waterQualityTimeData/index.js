import request from '@/utils/request'


export function getQuality(query) {
    return request({
        url: '/business/realData/awqmdD/page',
        method: 'get',
        params: query
    })
}



