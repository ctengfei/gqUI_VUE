import request from '@/utils/request'
export function addPerson(data) {
    return request({
        url: '/business/standard/dutyPerson',
        method: 'post',
        data: data,
    })
}

export function getPerson(query) {
    return request({
        url: '/business/standard/dutyPerson/page',
        method: 'get',
        params: query
    })
}

export function delPerson(bzId) {
    return request({
        url: `/business/standard/dutyPerson/${bzId}`,
        method: 'delete'
    })
}

export function getDutPerson(id) {
    return request({
        url: `/business/standard/dutyPerson/${id}`,
        method: 'get',
    })
}

export function deltDutPerson(query) {
    return request({
        url: `/business/standard/dutyPerson/delPersonById`,
        method: 'get',
        params: query
    })
}
export function updatePerson(bzId, data) {
    return request({
        url: `/business/standard/dutyPerson/${bzId}`,
        method: 'put',
        data: data,
    })
}