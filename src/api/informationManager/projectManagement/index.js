import request from '@/utils/request'

export function addProject(data) {
    return request({
        url: '/business/standard/engBase',
        method: 'post',
        data: data
    })
}

export function getProject(query) {
    return request({
        url: '/business/standard/engBase/page',
        method: 'get',
        params: query
    })
}


export function delProject(id) {
    return request({
        url: `/business/standard/engBase/${id}`,
        method: 'delete'
    })
}

export function updateProject(bzId,data) {
    return request({
        url: `/business/standard/engBase/${bzId}`,
        method: 'put',
        data: data
    })
}

export function getProjectList(query) {
    return request({
            url: '/business/standard/engBase/list',
            method: 'get',
            params: query
        })
}


