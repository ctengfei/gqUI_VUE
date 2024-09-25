import request from '@/utils/request'

export function addVideo(data) {
    return request({
        url: '/business/warning/rvSlyj/save',
        method: 'post',
        data: data
    })
}

export function getVideo(query) {
    return request({
        url: '/business/warning/rvSlyj/page',
        method: 'get',
        params: query
    })
}

export function delVideo(Id) {
    return request({
        url: `/business/base/wmstBase/${Id}`,
        method: 'delete',
    })
}

export function updateVideo(Id,data) {
    return request({
        url: `/business/warning/rvSlyj/${Id}`,
        method: 'PUT',
        data: data
    })
}

