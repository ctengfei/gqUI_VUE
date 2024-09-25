import request from '@/utils/request'

export function addDefaultSetting(data) {
    return request({
        url: '/bim/resWaterResource/demand/queryUrbanPlanData',
        method: 'post',
        data
    })
}

export function getMonthData(query) {
    return request({
            url: '/bim/resWaterResource/demand/getUrbanPlanData',
            method: 'get',
            params: query
        })
}


export function getYearUseWater(query) {
    return request({
            url: '/bim/resWaterResource/demand/getForecastDemandList',
            method: 'get',
            params: query
        })
}
//获取城镇年份
export function getResultTypical(params) {
    return request({
        url: '/bim/resWaterResource/demand/resultTypicalYearWeightUrbanList',
        method: 'get',
        params
    })
}
//城乡需水计算
export function getCalUrbanPlanData(data) {
    return request({
        url: '/bim/resWaterResource/demand/calUrbanPlanData',
        method: 'post',
        data
    })
}
//城乡需水计算结果
export function getCalcUrbanResult(data) {
    return request({
        url: '/bim/resWaterResource/demand/calcUrbanResult',
        method: 'post',
        data
    })
}

export function postSaveForecastDemandList(data) {
    return request({
            url: '/bim/resWaterResource/demand/saveForecastDemandList',
            method: 'post',
            data
        })
}