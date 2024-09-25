import request from '@/utils/request'
export function gettblJcZt(query) {
    return request({
        url: '/business/huangtangMonitor/tblJcZt/deviceStatepage',
        method: 'get',
        params: query
    })
}

export function getdetailtblJcZt(query) {
    return request({
        url: '/business/huangtangMonitor/tblJcZt/list',
        method: 'get',
        params: query
    })
}