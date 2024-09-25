import request from '@/utils/request'


export function getLoginCount(query) {
    return request({
        url: '/system/logininfor/loginStatistics',
        method: 'get',
        params: query
    })
}

export function getSystemUseCount(query) {
    return request({
        url: '/system/operlog/operTitleStatistics',
        method: 'get',
        params: query
    })
}

export function getOnlineUser(query) {
    return request({
        url: '/system/online/statistics',
        method: 'get',
        params: query
    })
}