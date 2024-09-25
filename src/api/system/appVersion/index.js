import request from '@/utils/request'

export function addApp(data) {
    return request({
        url: '/system/mobileApp',
        method: 'post',
        data: data
    })
}

export function getApp(query) {
    return request({
        url: '/system/mobileApp/list',
        method: 'get',
        params: query
    })
}

export function delApp(appIds) {
    return request({
        url: `/system/mobileApp/${appIds}`,
        method: 'delete'
    })
}

export function updateApp(data) {
    return request({
        url: `/system/mobileApp`,
        method: 'put',
        data: data
    })
}

