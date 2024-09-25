import request from "@/utils/request";

export function getFlood(query) {
    return request({
        url: '/bim/resFlood/prediction/page',
        method: 'get',
        params: query
    })
}

export function geFoceData(query) {
    return request({
            url: '/bim/resFlood/prediction/getFloodForecastPageListByGLId',
            method: 'get',
            params: query
        })
}

export function deleteFoc(gqId) {
    return request({
        url: `/bim/resFlood/prediction/${gqId}`,
        method: 'delete'
    })
}