import request from '@/utils/request'

export function getTopStatistics(query) {
    return request({
        // url: '/bim/resWaterResource/inflow/getWaterFlow',
        url: '/business/waterUse/resInflowWreqMonth/getYearWaterAmount',
        method: 'get',
        params: query
    })
}

export function getInc(query) {
    return request({
        url: '/bim/resWaterResource/inflow/getPlanPageList',
        method: 'get',
        params: query
    })
}

export function postOptions(data) {
    return request({
        url: '/bim/resWaterResource/inflow/savePlan',
        method: 'post',
        data: data
    })
}

export function getAreaList(query) {
    return request({
            url: '/bim/resWaterResource/inflow/getRegionList',
            method: 'get',
            params: query
        })
}

export function deleteInc(query) {
    return request({
        url: '/bim/resWaterResource/inflow/removePlan',
        method: 'get',
        params: query
    })
}
//保存左侧配置参数
export function postPlan(data) {
    return request({
        url: '/bim/resWaterResource/inflow/savePlanParameter',
        method: 'post',
        data: data
    })
}
//操作降雨计算按钮，并获取优选相似年和雨量预测结果数据
export function getRaveYear(query) {
    return request({
            url: '/bim/resWaterResource/inflow/getTypicalYear',
            method: 'get',
            params: query
        })
}

export function getRainResult(query) {
    return request({
            url: '/bim/resWaterResource/inflow/getForecastRainfallList',
            method: 'get',
            params: query
        })
}
//更新权重
export function postUpdateWeight(data) {
    return request({
            url: '/bim/resWaterResource/inflow/saveTypicalYears',
            method: 'post',
            data: data
        })
}
// 获取来水计算数据
export function postCompute(data) {
    return request({
            url: '/bim/resWaterResource/inflow/calForecastRunoff',
            method: 'post',
            data: data
        })
}
//查询人工干预列表数据
export function getIntervention(query) {
    return request({
            url: '/bim/resWaterResource/inflow/getWaterUserIntervene',
            method: 'get',
            params: query
        })

}

export function postInflow(data) {
    return request({
            url: '/bim/resWaterResource/inflow/saveForecastDataList',
            method: 'post',
            data: data
        })
}

export function getPlanCodeList(query) {
    return request({
        url: '/bim/resWaterResource/inflow/getPlanCodeList',
        method: 'get',
        params: query
    })
}
export function getParmEcoList(query) {
    return request({
        url: '/bim/resWaterResource/demand/parmEcoList',
        method: 'get',
        params: query
    })
}
export function editFlowEcoApi(data) {
    return request({
            url: '/bim/resWaterResource/demand/parmEco',
            method: 'put',
            data
        })
}
//预测方案-来水计算按钮
export function inflowWaterBtn(params) {
    return request({
            url: '/bim/resWaterResource/inflow/getIncomingWaterBtn',
            method: 'get',
            params
        })
}
//预测方案-降雨计算按钮及优选相似年
export function fallCalculationBtn(params) {
    return request({
        url: '/bim/resWaterResource/inflow/getRainfallCalculationBtn',
        method: 'get',
        params
    })
}

export function getParmRpRatioList(params) {
    return request({
            url: '/bim/resWaterResource/inflow/parmRpRatioList',
            method: 'get',
            params
        })
}
export function getParmRpRatioGroupList(params) {
    return request({
            url: '/bim/resWaterResource/inflow/parmRpRatioGroupList',
            method: 'get',
            params
        })
}
export function putParmRpRatio(data) {
    return request({
            url: '/bim/resWaterResource/inflow/parmRpRatio',
            method: 'put',
            data
        })
}


//查询径流计算参数
export function getParmYearRpRatioListt(params) {
    return request({
            url: '/bim/resWaterResource/inflow/parmYearRpRatioList',
            method: 'get',
            params
        })
}


//径流系数参数修改
export function putParmYeatRpRatio(data) {
    return request({
            url: '/bim/resWaterResource/inflow/updateParmYeatRpRatio',
            method: 'put',
            data
        })
}
//新增径流系数参数添加 
export function postParmYeatRpRatio(data) {
    return request({
            url: '/bim/resWaterResource/inflow/addParmYeatRpRatio',
            method: 'post',
            data: data
        })
}