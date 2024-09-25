
import request from '@/utils/request'

export function addNetworkSafety(data) {
    return request({
        url: '/business/standard/networkSafety',
        method: 'post',
        data: data
    })
}

export function getNetworkSafety(query) {
    return request({
        url: '/business/standard/networkSafety/page',
        method: 'get',
        params: query
    })
}


export function delNetworkSafety(bzId) {
    return request({
        url: `/business/standard/networkSafety/${bzId}`,
        method: 'delete'
    })
}

export function updateNetworkSafety(bzId,data) {
    return request({
        url: `/business/standard/networkSafety/${bzId}`,
        method: 'put',
        data: data
    })
}

