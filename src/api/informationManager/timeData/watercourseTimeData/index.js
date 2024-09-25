import request from '@/utils/request'

export function getWatercourse(query) {
    return request({
        url: '/business/realData/riverR/page',
        method: 'get',
        params: query
    })
}

