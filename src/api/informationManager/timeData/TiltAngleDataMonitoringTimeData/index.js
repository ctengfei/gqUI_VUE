import request from '@/utils/request'
export function gettblJcQj(query) {
    return request({
        url: '/business/huangtangMonitor/tblJcQj/page',
        method: 'get',
        params: query
    })
}