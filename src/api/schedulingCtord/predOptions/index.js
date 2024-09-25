import request from '@/utils/request'

export function addPlan(data) {
    return request({
        url: '/bim/irrFlood/forecastPlan',
        method: 'post',
        data: data
    })
}

export function putPlan(caseCode,data){
    return request({
        url: `/bim/irrFlood/forecastPlan/${caseCode}`,
        method: 'put',
        data: data
    })
}

export function getSchemeCalculation(query) {
    return request({
        url: '/bim/irrFlood/realForecast/getSchemeCalculationBtn',
        method: 'get',
        params: query
    })
}

// 获取流域
export function getRiverBasin(query) {
    return request({
            url: '/bim/irrFlood/attWatershed/list',
            method: 'get',
            params: query
        })
}

// 产流参数
export function postClParameters(data) {
    return request({
        url: '/bim/irrFlood/parmApiBasinsRunoffCal',
        method: 'post',
        data: data
    })
}

//查询产流参数
export function getClParameters1(query) {
    return request({
        url: `/bim/irrFlood/parmApiBasinsRunoffCal/page`,
        method: 'get',
        params: query,
    })
}

//删除产流参数
export function deleteClParameters1(wshCode) {
    return request({
        url: `/bim/irrFlood/parmApiBasinsRunoffCal/${wshCode}`,
        method: 'delete',
    })
}

//修改产流参数
export function updateClParameters1(wshCode,data) {
    return request({
        url: `/bim/irrFlood/parmApiBasinsRunoffCal/${wshCode}`,
        method: 'update',
        data:data
    })
}



//时段单位线m1相关参数
export function postM1Parameters(data) {
    return request({
            url: '/bim/irrFlood/parmApiUhCalM1',
            method: 'post',
            data: data
        })
}

//查询时段单位线m1相关参数
export function getM1Parameters(query) {
    return request({
        url: `/bim/irrFlood/parmApiUhCalM1/page`,
        method: 'get',
        params: query,
    })
}

//删除时段单位线m1相关参数
export function deleteM1Parameters(id) {
    return request({
        url: `/bim/irrFlood/parmApiUhCalM1/${id}`,
        method: 'delete',
    })
}

//修改时段单位线m1相关参数
export function updateM1Parameters(id,data) {
    return request({
        url: `/bim/irrFlood/parmApiUhCalM1/${id}`,
        method: 'delete',
        data:data
    })
}

//非线性修正系数Lambda1关系
export function postLambda1Parameters(data) {
    return request({
        url: '/bim/irrFlood/parmApiRelThetaLambda1',
        method: 'post',
        data: data
    })
}

//查询非线性修正系数Lambda1关系
export function getLambda1Parameters(query) {
    return request({
        url: `/bim/irrFlood/parmApiRelThetaLambda1/page`,
        method: 'get',
        params: query,
    })
}

//删除非线性修正系数Lambda1关系
export function deleteLambda1Parameters(id,data) {
    return request({
        url: `/bim/irrFlood/parmApiRelThetaLambda1/${id}`,
        method: 'post',
        data: data
    })
}

//修改非线性修正系数Lambda1关系
export function updateLambda1Parameters(id,data) {
    return request({
        url: `/bim/irrFlood/parmApiRelThetaLambda1/${id}`,
        method: 'post',
        data: data
    })
}

//非线性修正系数Lambda2关系
export function postLambda2Parameters(data) {
    return request({
        url: '/bim/irrFlood/parmApiRelFLambda2',
        method: 'post',
        data: data
    })
}

//查询非线性修正系数Lambda2关系
export function getLambda2Parameters(query) {
    return request({
        url: `/bim/irrFlood/parmApiRelFLambda2/page`,
        method: 'get',
        params: query,
    })
}

//删除非线性修正系数Lambda2关系
export function deleteLambda2Parameters(id,data) {
    return request({
        url: `/bim/irrFlood/parmApiRelFLambda2/${id}`,
        method: 'post',
        data: data
    })
}

//修改非线性修正系数Lambda2关系
export function updateLambda2Parameters(id,data) {
    return request({
        url: `/bim/irrFlood/parmApiRelFLambda2/${id}`,
        method: 'post',
        data: data
    })
}

// 时段单位线n相关参数
export function postTimeNParameters(data) {
    return request({
        url: '/bim/irrFlood/parmApiUhCalN',
        method: 'post',
        data: data
    })
}

//查询时段单位线n相关参数
export function getTimeNParameters(query) {
    return request({
        url: `/bim/irrFlood/parmApiUhCalN/page`,
        method: 'get',
        params: query,
    })
}

//删除时段单位线n相关参数
export function deleteTimeNParameters(id,data) {
    return request({
        url: `/bim/irrFlood/parmApiUhCalN/${id}`,
        method: 'post',
        data: data
    })
}

//修改时段单位线n相关参数
export function updateTimeNParameters(id,data) {
    return request({
        url: `/bim/irrFlood/parmApiUhCalN/${id}`,
        method: 'post',
        data: data
    })
}





