import request from '@/utils/request'
export function gettblJcJsd(query) {
    return request({
        url: '/business/huangtangMonitor/tblJcJsd/page',
        method: 'get',
        params: query
    })
}