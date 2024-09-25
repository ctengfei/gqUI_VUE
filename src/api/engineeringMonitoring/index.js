import request from '@/utils/request'


export function getCz(query) {
    return request({
        url: '/business/standard/damCzwyR/page',
        method: 'get',
        params: query
    })
}

export function getSl(query) {
    return request({
        url: '/business/standard/damSpgR/page',
        method: 'get',
        params: query
    })
}

export function getSp(query) {
    return request({
        url: '/business/standard/damSpwyR/page',
        method: 'get',
        params: query
    })
}

export function getDb(query) {
    return request({
        url: '/business/standard/damStBase/page',
        method: 'get',
        params: query
    })
}


export function postDamManualReportWyR(data) {
    return request({
            url: '/business/standard/damManualReportWyR',
            method: 'post',
            data: data
        })
}

export function getDamManualReportWyR(query) {
    return request({
        url: '/business/standard/damManualReportWyR/page',
        method: 'get',
        params: query
    })
}

export function putDamManualReportWyR(id,data) {
    return request({
            url: `/business/standard/damManualReportWyR/${id}`,
            method: 'put',
            data: data
        })
}

export function deleteDamManualReportWyR(id) {
    return request({
            url: `/business/standard/damManualReportWyR/${id}`,
            method: 'delete'
        })
}


export function postDamManualReportSpgR(data) {
    return request({
            url: '/business/standard/damManualReportSpgR',
            method: 'post',
            data: data
        })
}

export function getDamManualReportSpgR(query) {
    return request({
            url: '/business/standard/damManualReportSpgR/page',
            method: 'get',
            params: query
        })
}

export function putDamManualReportSpgR(id,data) {
    return request({
        url: `/business/standard/damManualReportSpgR/${id}`,
        method: 'put',
        data: data
    })
}

export function deleteDamManualReportSpgR(id) {
    return request({
            url: `/business/standard/damManualReportSpgR/${id}`,
            method: 'delete'
        })
}

export function getDamBaseList(query) {
    return request({
            url: '/business/base/damBase/list',
            method: 'get',
            params: query
        })
}

export function getDamStBase(query) {
    return request({
            url: '/business/standard/damStBase/list',
            method: 'get',
            params: query
        })
}


