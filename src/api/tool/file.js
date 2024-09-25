import request from '@/utils/request'
import {ElLoading, ElMessage} from "element-plus";
let downloadLoadingInstance = null
// 删除文科
export function removeFile(id) {
    return request({
        url: `/file/eos/${id}`,
        method: 'DELETE',
    })
}

// 下载文件
export function downloadFile(id) {
    downloadLoadingInstance = ElLoading.service({ text: "正在下载数据，请稍候", background: "rgba(0, 0, 0, 0.7)", })
    return request({
        url: `/file/eos/download/${id}`,
        method: 'get',
        responseType:'blob'
    }).then(res=>{
        downloadLoadingInstance.close();
        return res
    }).catch(e=>{
        ElMessage.error('下载文件出现错误，请联系管理员！')
        downloadLoadingInstance.close();
    })
}

// 上传
export function uploadFile(data) {
    return request({
        url:'/file/eos/upload',
        method: 'post',
        data
    })
}