import request from '@/utils/request'

// 添加灌区
export function addGq(data) {
    return request({
        url: '/business/base/irrBase',
        method: 'post',
        data: data
    })
}

// 查询灌区
export function getGq(query) {
    return request({
        url: '/business/base/irrBase/page',
        method: 'get',
        params: query
    })
}

// 查询灌区
export function getGqList(query) {
    return request({
        url: '/business/base/irrBase/list',
        method: 'get',
        params: query
    })
}



//批量删除灌区
export function delAllGq(gqId) {
    return request({
        url: '/business/base/irrBase' + gqId,
        method: 'delete'
    })
}

export function delGq(gqId) {
    return request({
        url: `/business/base/irrBase/${gqId}`,
        method: 'delete'
    })
}

export function updateGq(gqId,data) {
    return request({
        url: `/business/base/irrBase/${gqId}`,
        method: 'put',
        data: data
    })
}

export function exportExcel(query){
    return request({
        url: 'business/base/irrBase/page/export',
        method: 'get',
        params: query
    })
}

