import request from '@/utils/request'

export function getDitch(query) {
    return request({
        url: '/business/bigScreen/home/getIrrInfo',
        method: 'get',
        params: query
    })
}

export function getSk(query) {
    return request({
        url: '/business/bigScreen/home/getResBaseDataList',
        method: 'get',
        params: query
    })
}

export function getTopTotal(query) {
    return request({
            url: '/business/bigScreen/home/getBusinessInfo',
            method: 'get',
            params: query
        })
}

export function getSkRealTime(query) {
    return request({
        url: '/business/oneMap/getResSpecialTopics',
        method: 'get',
        params: query
    })
}

export function getSite(query) {
    return request({
        url: '/business/bigScreen/home/getSiteInfoList',
        method: 'get',
        params: query
    })
}

export function getWaterStatistics(query) {
    return request({
            url: '/business/bigScreen/home/getWaterUseStatistics',
            method: 'get',
            params: query
        })
}

export function getActualWaterUseStatistics(query) {
    return request({
        url: '/business/bigScreen/home/getActualWaterUseStatistics',
        method: 'get',
        params: query
    })
}

export function getPlayUrl(query) {
    return request({
            url: '/business/base/wmstBase/getPlayUrlByWmstCode',
            method: 'get',
            params: query,
        })
}

export function getRealTimeSk(query) {
    return request({
        url: '/business/bigScreen/home/getResRealDataList',
        method: 'get',
        params: query
    })
}

export function getResRain(query) {
    return request({
        url: '/business/bigScreen/home/getResRain',
        method: 'get',
        params: query
    })
}

export function getWaterUseSupplyContrast(query) {
    return request({
            url: '/business/bigScreen/home/getWaterUseSupplyContrast',
            method: 'get',
            params: query
        })
}

// 获取图片路径

export function getRadarImage(params) {
    return request({
        url: '/business/base/wmstBase/getImageStationPicture',
        method: 'get',
        params,
    })
}