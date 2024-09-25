/**
 * 水雨情报表接口API
 */
import request from '@/utils/request'

export function getStationList(query){ //查询站点信息
    return request({
        url: '/business/base/stBase/list',
        method: 'get',
        params: query
    })
}


export function getStpptnRYearOrMonthReport(query){ //通过时间获取降雨量年报
    return request({
        url: '/business/realData/pptnR/getStpptnRYearOrMonthReport',
        method: 'get',
        params: query
    })
}


export function getStrsvrRYearOrMonthReport(query){ //通过时间获取库水位年报
    return request({
        url: '/business/realData/rsvrR/getStrsvrRYearOrMonthReport',
        method: 'get',
        params: query
    })
}

//查询区域列表
export function getAreaList(query){ 
    return request({
        url: '/bim/resWaterResource/hisBasinPareal/getAreaRainfallUnitList',
        method: 'get',
        params: query
    })
}

//通过时间查询区域面雨量年报列表
export function getAreaRainfallYearOrMonthList(query){ 
    return request({
        url: '/bim/resWaterResource/hisBasinPareal/getAreaRainfallYearOrMonthList',
        method: 'get',
        params: query
    })
}
 //通过时间查询区域面雨量年报表
export function getAreaRainfallYearOrMonthReport(query){
    return request({
        url: '/bim/resWaterResource/hisBasinPareal/getAreaRainfallYearOrMonthReport',
        method: 'get',
        params: query
    })
}
