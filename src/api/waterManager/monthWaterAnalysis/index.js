import request from '@/utils/request'

export function getMonth(query) {
    return request({
        url: '/business/waterUse/waterApply/getWaterUseMonthStatistics',
        method: 'get',
        params: query
    })
}
