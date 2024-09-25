import request from '@/utils/request'

export function addTeam(data) {
    return request({
        url: '/business/standard/rescueTeam',
        method: 'post',
        data: data
    })
}

export function getTeam(query) {
    return request({
        url: '/business/standard/rescueTeam/page',
        method: 'get',
        params: query
    })
}

export function getTeamList(id) {
    return request({
        url: `/business/standard/rescueTeam/${id}`,
        method: 'get',
    })
}


export function delTeam(id) {
    return request({
        url: `/business/standard/rescueTeam/${id}`,
        method: 'delete'
    })
}

export function delTeamUser(query) {
    return request({
        url: `/business/standard/rescueTeam/delLaborById`,
        method: 'get',
        params: query
    })
}

export function updateTeam(id, data) {
    return request({
        url: `/business/standard/rescueTeam/${id}`,
        method: 'put',
        data: data
    })
}

