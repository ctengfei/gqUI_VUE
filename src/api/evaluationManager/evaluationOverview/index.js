
import request from '@/utils/request'

export function getQuarter(query) {
    return request({
        url: '/business/standard/examStatistics/quarter',
        method: 'get',
        params: query,
    })
}

export function getMonth(query) {
    return request({
        url: '/business/standard/examStatistics/month',
        method: 'get',
        params: query,
    })
}

export function getYear(query) {
    return request({
        url: '/business/standard/examStatistics/year',
        method: 'get',
        params: query,
    })
}