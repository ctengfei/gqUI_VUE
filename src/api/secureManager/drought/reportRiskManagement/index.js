import request from '@/utils/request'

export function addRepDanger(data) {
    return request({
        url: '/business/standard/safetyDangerManage',
        method: 'post',
        data: data
    })
}

export function getRepDanger(query) {
    return request({
        url: '/business/standard/safetyDangerManage/page',
        method: 'get',
        params: query
    })
}
// 获取抢险队伍
export function getTeams(query) {
    return request({
            url: '/business/standard/rescueTeam/list',
            method: 'get',
            params: query
        })
}


export function delRepDanger(bzId) {
    return request({
        url: `/business/standard/safetyDangerManage/${bzId}`,
        method: 'delete'
    })
}

export function updateRepDanger(bzId,data) {
    return request({
        url: `/business/standard/safetyDangerManage/${bzId}`,
        method: 'put',
        data: data
    })
}

