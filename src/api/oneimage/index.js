import request from '@/utils/request'


export function getTimeSite(query) {
    return request({
        url: '/business/bigScreen/home/getSiteInfoList',
        method: 'get',
        params: query
    })
}

export function getStructure(query) {
    return request({
        url: '/business/bigScreen/home/getWaterBuildingList',
        method: 'get',
        params: query
    })
}

export function getSwMonitor(query) {
    return request({
        url: '/business/oneMap/getWater24hMonitor',
        method: 'get',
        params: query
    })
}

export function getSzMonitor(query) {
    return request({
        url: '/business/oneMap/getDam24hMonitor',
        method: 'get',
        params: query
    })
}

export function getBzMonitor(query) {
    return request({
        url: '/business/oneMap/getPump24hMonitor',
        method: 'get',
        params: query
    })
}

export function getSzhiMonitor(query) {
    return request({
        url: '/business/oneMap/getWaterQuality24hMonitor',
        method: 'get',
        params: query
    })
}

export function getHdMonitor(query) {
    return request({
        url: '/business/oneMap/getRiver24hDatalist',
        method: 'get',
        params: query
    })
}

export function getQdMonitor(query) {
    return request({
        url: '/business/oneMap/getChannel24hDatalist',
        method: 'get',
        params: query
    })
}

export function getYlMonitor(query) {
    return request({
        url: '/business/oneMap/getRain24hMonitor',
        method: 'get',
        params: query
    })
}

export function getWaterUseTotal(query) {
    return request({
            url: '/business/oneMap/getWaterUseStatistics',
            method: 'get',
            params: query
        })
}

export function getWaterUseTypeTotal(query) {
    return request({
            url: '/business/oneMap/getWaterMonthTypeStatistics',
            method: 'get',
            params: query
        })
}

export function unFollow(data) {
    return request({
            url: '/business/attBase/myFollowSite/unfollowSite',
            method: 'put',
            data: data
        })
}

export function addFollow(data) {
    return request({
            url: '/business/attBase/myFollowSite/followSite',
            method: 'post',
            data: data
        })
}

export function getSk(query) {
    return request({
        url: '/business/oneMap/getResSpecialTopics',
        method: 'get',
        params: query
    })
}

export function getResTotal(query) {
    return request({
            url: '/business/oneMap/getResTotal',
            method: 'get',
            params: query
        })
}

export function getDutyPersonNum(query) {
    return request({
            url: '/business/oneMap/getDutyPersonNum',
            method: 'get',
            params: query
        })
}

export function getFxObject(query) {
    return request({
            url: '/business/standard/fxObject/list',
            method: 'get',
            params: query
        })

}

export function getRescueTeamNum(query) {
    return request({
        url: '/business/oneMap/getRescueTeamNum',
        method: 'get',
        params: query
    })
}

export function getSafetyDangerNum(query) {
    return request({
            url: '/business/oneMap/getSafetyDangerNum',
            method: 'get',
            params: query
        })
}

export function getDamCzwyMaxTmList(query) {
    return request({
            url: '/business/oneMap/getDamCzwyMaxTmList',
            method: 'get',
            params: query
        })
}

export function getDamSpgMaxTmList(query) {
    return request({
            url: '/business/oneMap/getDamSpgMaxTmList',
            method: 'get',
            params: query
        })
}

export function getDamSpwyMaxTmList(query) {
    return request({
        url: '/business/oneMap/getDamSpwyMaxTmList',
        method: 'get',
        params: query
    })
}

