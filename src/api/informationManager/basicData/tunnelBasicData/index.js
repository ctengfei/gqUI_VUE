import request from '@/utils/request'

export function addTunnel(data) {
    return request({
        url: '/business/attBase/tunnelBase',
        method: 'post',
        data: data
    })
}

export function getTunnel(query) {
    return request({
        url: '/business/attBase/tunnelBase/page',
        method: 'get',
        params: query
    })
}

export function delTunnel(skId) {
    return request({
        url: `/business/attBase/tunnelBase/${skId}`,
        method: 'delete'
    })
}

export function updateTunnel(skId,data) {
    return request({
        url: `/business/attBase/tunnelBase/${skId}`,
        method: 'put',
        data: data
    })
}


