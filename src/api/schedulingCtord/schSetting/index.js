import request from '@/utils/request'

export function getPlanList(query) {
    return request({
        url: '/bim/irrFlood/planManage/getPlanList',
        method: 'get',
        params: query
    })
}

export function deletePlan(caseCode) {
    return request({
        url: `/bim/irrFlood/planManage/${caseCode}`,
        method: 'delete',
    })
}

export function getShList() {
    return request({
        url: '/bim/irrFlood/planManage/getBasinWshList',
        method: 'get',
    })
}

export function getShTable(query) {
    return request({
        url: '/bim/irrFlood/planManage/getBasinCalculateResultList',
        method: 'get',
        params: query
    })

}

export function getHdList() {
    return request({
        url: '/bim/irrFlood/planManage/getForecastRiverList',
        method: 'get',
    })
}

export function getHdTable(query) {
    return request({
        url: '/bim/irrFlood/planManage/getChanCalculateResultList',
        method: 'get',
        params: query
    })
}

// 水动力方案列表  
export function getParamHydrostartList(params){
    return request({
        url: '/bim/irrFlood/hydroParamHydrostart/page',
        method: 'get',
        params: params
    })
}

// 新增水动力方案
export function addParamHydrostart(data){
    return request({
        url: '/bim/irrFlood/hydroParamHydrostart',
        method: 'post',
        data,
    })
}

// 水动力方案详情 /bim/irrFlood/hydroParamHydrostart/{id}
export function detailParamHydrostart(id){
    return request({
        url: '/bim/irrFlood/hydroParamHydrostart/'+ id,
        method: 'get',
    })
}

// 编辑水动力方案
export function editParamHydrostart(data){
    return request({
        url: '/bim/irrFlood/hydroParamHydrostart',
        method: 'put',
        data,
    })
}

// 删除水动力方案
export function delParamHydrostart(id){
    return request({
        url: '/bim/irrFlood/hydroParamHydrostart/' + id,
        method: 'delete',
    })
}

// 闸门名称列表
export function getGateList(id){
    return request({
        url: '/bim/irrFlood/parmSluiceInfo/list',
        method: 'get',
    })
}

// 获取闸门设置默认值
export function getGateListDefault(params){
    return request({
        url: '/bim/irrFlood/hydroSluiceStatus/getByCaseCodeAndWraRepCd',
        method: 'get',
        params,
    })
}

// 修改闸门设置默认值
export function updateGateListDefault(data){
    return request({
        url: '/bim/irrFlood/hydroSluiceStatus/updateByCaseCodAndWarpCode',
        method: 'post',
        data,
    })
}

// 水动力方案详情（渠道演进结果）
export function getBnchHydroList(params){
    return request({
        url: '/bim/irrFlood/resultBnchHydro/list',
        method: 'get',
        params,
    })
}
// 水动力方案详情（闸门水位、流量结果）
export function getBnchHydroSluiceList(params){
    return request({
        url: '/bim/irrFlood/resultSluiceHydro/page',
        method: 'get',
        params,
    })
}

// 渠道演进结果 
export function getChanFloodReultBy(params){
    return request({
        url: '/bim/irrFlood/resultBnchHydro/chanFloodReultBy',
        method: 'get',
        params,
    })
}

// 获取渠道列表 
export function getChanList(params){
    return request({
        url: '/bim/irrFlood/hydroParamHydrostart/getChans',
        method: 'get',
        params,
    })
}

// 获取面雨量
export function getIrrAreaRainfallList(params){
    return request({
        url: '/bim/irrFlood/hisBasinsPareal/list',
        method: 'get',
        params,
    })
}
