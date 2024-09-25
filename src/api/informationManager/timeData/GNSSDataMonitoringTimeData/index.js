import request from '@/utils/request'
export function gettblJcGnss(query) {
    return request({
        url: '/business/huangtangMonitor/tblJcGnss/page',
        method: 'get',
        params: query
    })
}