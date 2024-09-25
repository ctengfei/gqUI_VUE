import request from '@/utils/request'

export function getYear(query) {
    return request({
        url: '/business/waterUse/waterApply/getWaterUseYearStatistics',
        method: 'get',
        params: query
    })
}
