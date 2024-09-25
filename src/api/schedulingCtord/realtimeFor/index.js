import request from '@/utils/request'

export function getRainInfo(query) {
    return request({
        url: '/bim/irrFlood/realForecast/getForecastRainfall',
        method: 'get',
        params: query
    })
}

export function getRainTable(query) {
    return request({
        url: '/bim/irrFlood/realForecast/getBasinAreaRainfallList',
        method: 'get',
        params: query
    })
}

export function getRainShChart(query) {
    return request({
            url: '/bim/irrFlood/realForecast/getRealRainfallRunoffMapList',
            method: 'get',
            params: query
        })
}

export function getChanChart(query) {
    return request({
            url: '/bim/irrFlood/realForecast/getChanRealForecastResultList',
            method: 'get',
            params: query
        })
}

export function getBaseData(query) {
    return request({
        url: '/bim/irrFlood/apiBasinsAtt/list',
        method: 'get',
        params: query
    })
}

export function getReachInfo(query) {
    return request({
        url: '/bim/irrFlood/hydroParamSection/list',
        method: 'get',
        params: query
    })
}

export function getSluice(query) {
    return request({
            url: '/bim/irrFlood/hydroParamSluice/list',
            method: 'get',
            params: query
        })
}

export function getCardForecaset(query) {
    return request({
            url: '/bim/irrFlood/realForecast/getPlanForecastResult',
            method: 'get',
            params: query
        })
}

export function getBasinBachList(query) {
    return request({
            url: '/bim/irrFlood/realForecast/getBasinBachList',
            method: 'get',
            params: query
        })
}

export function getHydroSectionList(query) {
    return request({
            url: '/bim/irrFlood/realForecast/getHydroSectionList',
            method: 'get',
            params: query
        })
}

export function getForecastResultListByBnch(query) {
    return request({
        url: '/bim/irrFlood/realForecast/getForecastResultListByBnch',
        method: 'get',
        params: query
    })
}

export function getPlanForecastSectionList(query) {
    return request({
        url: '/bim/irrFlood/realForecast/getPlanForecastSectionList',
        method: 'get',
        params: query
    })
}

export function getFloodSlldModelForecast(query) {
    return request({
        url: '/bim/irrFlood/realForecast/floodSlldModelForecast',
        method: 'get',
        params: query
    })
}
export function getIrrFloodRollForecastDetails(query) {
    return request({
        url:'/bim/irrFlood/realForecast/getIrrFloodRollForecastDetails',
        method: 'get',
        params: query
    })
}

export function setIrrFloodRollForecastStatus(query) {
    return request({
        url:'/bim/irrFlood/realForecast/setIrrFloodRollForecastStatus',
        method: 'get',
        params: query
    })
}
// 山洪监测预警
export function floodDetectionAlarm(query) {
    return request({
        url:'/bim/irrFlood/realForecast/floodDetectionAlarm',
        method: 'get',
        params: query
    })
}
// 山洪预报预警
export function floodForecastAlarm(query) {
    return request({
        url:'/bim/irrFlood/realForecast/floodForecastAlarm',
        method: 'get',
        params: query
    })
}

// 实际检测断面列表 
export function parmAlarmStList(query) {
    return request({
        url:'/bim/irrFlood/realForecast/parmAlarmStList',
        method: 'get',
        params: query
    })
}

// 实际监测断面详情查看24小时水位趋势  
export function getRiverRBy(query) {
    return request({
        url:'/bim/irrFlood/realForecast/getRiverRBy',
        method: 'get',
        params: query
    })
}

// 预报断面列表 /irrFlood/parmAlarmFst/preBnchlist
export function preBnchlist(query) {
    return request({
        url:'/bim/irrFlood/parmAlarmFst/preBnchlist',
        method: 'get',
        params: query
    })
}

// 根据预报断面详情查看24小时水位趋势 
export function getResultBnchHydro(query) {
    return request({
        url:'/bim/irrFlood/resultBnchHydro/list',
        method: 'get',
        params: query
    })
}

//渠道糙率设置 断面列表
export function getChaneParmList(params) {
    return request({
        url:'/bim/irrFlood/parmRoughnessHydraulic/chaneParmList',
        method: 'get',
        params
    })
}

//渠道糙率设置 断面批量修改
export function updateBatch(data) {
    return request({
        url:'/bim/irrFlood/parmRoughnessHydraulic/batchUpdate',
        method: 'post',
        data
    })
}

//闸门静态属性设置-列表
export function getSluiceList(params) {
    return request({
        url:'/bim/irrFlood/parmSluiceInfo/page',
        method: 'get',
        params
    })
}

//闸门静态属性设置-编辑
export function updateSluiceList(data) {
    return request({
        url:'/bim/irrFlood/parmSluiceInfo/updateBy',
        method: 'post',
        data,
    })
}

// 渠道断面预报列表 
export function getPreAlarmList(params) {
    return request({
        url:'/bim/irrFlood/parmAlarmFst/preAlarmList',
        method: 'get',
        params,
    })
}

// 渠道纵剖面图 
export function getChannelProfile(params) {
    return request({
        url:'/bim/irrFlood/resultBnchHydro/getChannelProfile',
        method: 'get',
        params,
    })
}

// 获取糙率列表 
export function getRoughessList(params) {
    return request({
        url:'/bim/irrFlood/parmRoughnessHydraulic/page',
        method: 'get',
        params,
    })
}

// 获取实时水位
export function getRealWater() {
    return request({
        url:'/bim/irrFlood/parmAlarmFst/chaneRelaTimeZ',
        method: 'get',
    })
}

// 水位监测预警参数设置
export function getParmAlarmSt() {
    return request({
        url:'/bim/irrFlood/parmAlarmSt/list',
        method: 'get',
    })
}

// 

export function updateParmAlarmSt(id, data) {
    return request({
        url:'/bim/irrFlood/parmAlarmSt/' + id,
        method: 'put',
        data,
    })
}




