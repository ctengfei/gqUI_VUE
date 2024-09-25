import request from '@/utils/request'
export function gettblJcLfwy(query) {
    return request({
        ///business/huangtangMonitor/tblJcLfwy/page
        url: '/business/huangtangMonitor/tblJcLfwy/list',
        method: 'get',
        params: query
    })
}