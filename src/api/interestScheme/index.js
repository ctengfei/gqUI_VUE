import request from '@/utils/request'

export function getMonthScn(query) {
    return request({
        url: '/bim/resWaterResource/allocation/getMonthPlanDetails',
        method: 'get',
        params: query
    })
}

export function getYearStatistics(query) {
    return request({
            url: '/bim/resWaterResource/allocation/getWaterStatistics',
            method: 'get',
            params: query
        })
}

export function getYearTable(query) {
    return request({
            url: '/bim/resWaterResource/allocation/getWaterList',
            method: 'get',
            params: query
        })
}

export function getYearStatement(query) {
    return request({
        url: '/bim/resWaterResource/allocation/getWaterReportForms',
        method: 'get',
        params: query
    })
}
export function getAllocationBtnApi(params) {
    return request({
        url: '/bim/resWaterResource/allocation/getAllocationBtn',
        method: 'get',
        params
    })
}

export function getParmAllocationList(params) {
    return request({
            url: '/bim/resWaterResource/allocation/parmAllocationList',
            method: 'get',
            params
        })
}

export function putParmAllocation(data) {
    return request({
            url: '/bim/resWaterResource/allocation/parmAllocation',
            method: 'put',
            data
        })
}