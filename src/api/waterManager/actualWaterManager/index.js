import request from '@/utils/request'

export function addActua(data) {
    return request({
        url: '/business/waterUse/resInflowWreqMonth',
        method: 'post',
        data: data
    })
}

export function getActua(query) {
    return request({
        url: '/business/waterUse/resInflowWreqMonth/page',
        method: 'get',
        params: query
    })
}

//年用水
export function getYearStatistics(query) {
    return request({
        url: '/business/waterUse/resInflowWreqMonth/yearStatistics',
        method: 'get',
        params: query
    })
}

//月用水
export function getMonthStatistics(query) {
    return request({
        url: '/business/waterUse/resInflowWreqMonth/monthStatistics\n',
        method: 'get',
        params: query
    })
}


export function delActua(bzId) {
    return request({
        url: `/business/waterUse/resInflowWreqMonth/${bzId}`,
        method: 'delete'
    })
}

export function updateActua(bzId,data) {
    return request({
        url: `/business/waterUse/resInflowWreqMonth/${bzId}`,
        method: 'put',
        data: data
    })
}


