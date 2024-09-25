import request from '@/utils/request'

export function getRegulationsList(query) {
    return request({
        url: '/business/standard/gzzdInfo/page',
        method: 'get',
        params: query
    })
}

export function postRegulations(data) {
    return request({
        url: '/business/standard/gzzdInfo',
        method: 'post',
        data: data
    })
}

export function deleteRegulations(id) {
    return request({
        url: `/business/standard/gzzdInfo/${id}`,
        method: 'delete'
    })
}

export function updateRegulations(id,data) {
    return request({
        url: `/business/standard/gzzdInfo/${id}`,
        method: 'put',
        data: data
    })
}