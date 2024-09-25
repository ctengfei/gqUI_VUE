import request from '@/utils/request'

export function getRwWater(query) {
    return request({
        // url: '/bim/resWaterResource/demand/getWaterStatistics',
        url: '/business/waterUse/resInflowWreqMonth/getWaterStatistics',
        method: 'get',
        params: query
    })
}

export function getChart(query) {
    return request({
            url: '/bim/resWaterResource/demand/getHisWaterChart',
            method: 'get',
            params: query
        })
}

export function getArg(query) {
    return request({
            url: '/bim/resWaterResource/demand/getArgUnitList',
            method: 'get',
            params: query
        })
}

export function getArgUnitList(){
    ///resWaterResource/demand/getAttwaterUrbanunits
    return request({
        url: '/bim/resWaterResource/demand/getAttwaterUrbanunits',
        method: 'get',
    })
}
//查询王英水用水比例分析-参考蓄保水量
export function getCapacityList(query) {
    return request({
        url: '/bim/resWaterResource/demand/getArgWaterCapacityList',
        method: 'get',
        params: query
    })
}

export function postCrop(data) {
    return request({
            url: '/bim/resWaterResource/demand/getArgCropList',
            method: 'POST',
            data: data
        })
}

export function getInitCrop(data) {
    return request({
            url: '/bim/resWaterResource/demand/getArgCropParam',
            method: 'POST',
            data: data
        })
}
//查询预测灌溉需水列表数据
export function getTrr(query) {
    return request({
            url: '/bim/resWaterResource/demand/getArgForecastIrrigateList',
            method: 'get',
            params: query
        })
}

export function getAFA(query) {
    return request({
            url: '/bim/resWaterResource/demand/getArgForecastArgist',
            method: 'get',
            params: query
        })
}
//相似年选取 表格数据
export function getRaveListSimilarYears(query) {
    return request({
            url: '/bim/resWaterResource/demand/listSimilarYears',
            method: 'get',
            params: query
        })
}

///bim/resWaterResource/demand/updateSimilarYears
//更新权重
export function postUpdateSimilarYears(data) {
    return request({
            url: '/bim/resWaterResource/demand/updateSimilarYears',
            method: 'post',
            data: data
        })
}


export function postXiShu(data) {
    return request({
        url: '/bim/resWaterResource/demand/saveArgWaterCapacityList',
        method: 'post',
        data: data
    })
}
export function getArgWaterBtn(params) {
    return request({
        url: '/bim/resWaterResource/demand/getArgWaterBtn',
        method: 'get',
        params
    })
}

export function parmArgList(params) {
    return request({
            url: '/bim/resWaterResource/demand/parmArgList',
            method: 'get',
            params
        })
}

export function putParmArg(data) {
    return request({
            url: '/bim/resWaterResource/demand/parmArg',
            method: 'put',
            data: data
        })
}

export function getCurrentFrequency(params) {
    return request({
            url: '/bim/resWaterResource/demand/currentFrequency',
            method: 'get',
            params
        })
}

export function postSaveCropArea(data) {
    return request({
            url: '/bim/resWaterResource/demand/saveCropArea',
            method: 'post',
            data: data
        })

}

//相似年方案同比日期灌溉量查询
///bim/resWaterResource/demand/similarYearsArgByUnicoeAndAllocde
export function getsimilarYearsArgByUnicoeAndAllocde(params) {
    return request({
            url: '/bim/resWaterResource/demand/similarYearsArgByUnicoeAndAllocde',
            method: 'get',
            params
        })
}