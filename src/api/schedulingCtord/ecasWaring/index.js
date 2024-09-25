import request from '@/utils/request'

export function addEasc(data) {
    return request({
        url: '/bim/irrFlood/parmBnchWarning/saveOrUpdateBatch',
        method: 'post',
        data: data
    })
}

export function getEasc(query) {
    return request({
        url: `/bim/irrFlood/parmBnchWarning/list`,
        method: 'get',
        params: query
    })
}

export function getEascList(query) {
    return request({
            url: `/business/base/stBase/list`,
            method: 'get',
            params: query
        })
}

export function getRainLevel(query) {
    return request({
            url: `/business/bigScreen/home/getLastRainfallLevel`,
            method: 'get',
            params: query
        })
}