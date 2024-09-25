import request from '@/utils/request'

export function addEquipment(data) {
    return request({
        url: '/business/attBase/deviceBase',
        method: 'post',
        data: data
    })
}

export function getEquipment(query) {
    return request({
        url: '/business/attBase/deviceBase/page',
        method: 'get',
        params: query
    })
}


export function delEquipment(bzId) {
    return request({
        url: `/business/attBase/deviceBase/${bzId}`,
        method: 'delete'
    })
}

export function updateEquipment(bzId, data) {
    return request({
        url: `/business/attBase/deviceBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function createCode(id) {
    return request({
        url: `/business/attBase/deviceBase/getDeviceQrCode/${id}`,
        method: 'get',
        responseType: 'blob',
    })
}


