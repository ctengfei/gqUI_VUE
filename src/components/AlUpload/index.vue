<template>
  <el-upload
      ref="upload"
      style="width: 100%"
      v-model:file-list="filelist"
      :action="uploadFileUrl"
      :headers="headers"
      multiple
      :limit="props.limit"
      list-type="picture"
      :on-preview="handleStart"
      :accept="props.accept"
      :before-upload="beforeChange"
      :on-success="handleSuccess"
      :on-error="handleError"
  >
    <el-button type="primary" :disabled=" props.disabled || filelist.length >= props.limit">上传附件</el-button>
    <template #tip>
      <span style="color: #DE4841;margin-left: 15px">支持{{ props.accept }}文件，最多上传 {{ props.limit }} 份文件</span>
    </template>
    <template #file="{ file }">
      <div v-loading="uid == file.uid"  class="file-box">
        <el-icon v-show="!props.disabled" class="file-delete" @click="handleUploadRemove(file)">
          <Delete/>
        </el-icon>
        <img v-if="checkSuffix(file)" class="el-upload-list__item-thumbnail" :src="getFileUrl(file)"/>
        <el-tooltip
            effect="dark"
            :content="file.name"
            placement="top"
        >
          <el-text class="file-name"  @click="handleStart(file)" type="primary" truncated>
            <span ref="text">{{ file.name }}</span>
          </el-text>
        </el-tooltip>
      </div>
    </template>
  </el-upload>
</template>

<script setup>
import {
  defineProps,
  defineEmits,
  nextTick,
  onMounted,
  ref,
  watch,
  onUnmounted,
  onBeforeUnmount,
  watchEffect
} from "vue";
import {getToken} from "@/utils/auth";
import {checkSuffix} from '@/utils';
import {downloadFile, removeFile} from "@/api/tool/file";
import {ElLoading} from "element-plus";
const {proxy} = getCurrentInstance();
const emit = defineEmits(["update:fileList"]);
const props = defineProps({
  fileList: { // 文件列表
    type: Array,
    default: [],
    required:true
  },
  accept: {  // 支持文件
    type: String,
    default: ".pdf, .xlsx, .xls, .doc, .docx, .txt, .png, .jpg, .jpeg"
  },
  limit:{ // 最大上传数量
    type: String,
    default: 2
  },
  disabled:{ //是否禁止上传
    type:Boolean,
    default:false
  }
});
const box = ref();
let uid = ref(false);
let cloneList = ref(props.fileList ? (Array.isArray(props.fileList) ? props.fileList : JSON.parse(props.fileList)) : []);
let filelist =  ref(props.fileList ? (Array.isArray(props.fileList) ? props.fileList : JSON.parse(props.fileList)) : []);
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
watchEffect(()=>{
  emit('update:fileList',cloneList.value)
})

const handleSuccess = (res,file,files) => {
  const arr = files.map(r => {
    if (r.response?.data) {
      const imgs = r.response?.data;
      return {
        id: imgs.id,
        name: imgs.name,
        url: imgs.storagePath
      }
    } else {
      return {
        id: r.id,
        name: r.name,
        url: r.url
      }
    }
  })
  uid.value = false;
  cloneList.value = arr;
}

const handleError = () => {
  uid.value = false;
}

const beforeChange = (rawFile) => {
  uid.value = rawFile.uid;
  return true
}

const getFileUrl = (file) => {
  if(file.url.startsWith('blob:')){
    return file.url
  } else{
    return `${import.meta.env.VITE_FILE_URL}${file.url}`;
  }
};

const handleStart = (file) => {
  const ext = file.name.split('.')[1]
  if ((ext == 'pdf')) {
    if(file.url.startsWith('blob:')){
      window.open(`${file.url}`)
    } else{
      window.open(`${import.meta.env.VITE_FILE_URL}${file.url}`)
    }
  } else if (ext == 'jpg' || ext == 'jpeg' || ext == 'png') {
    if(file.url.startsWith('blob:')){
      proxy.$v3ImgPreviewFn(file.url);
    } else{
      proxy.$v3ImgPreviewFn(`${import.meta.env.VITE_FILE_URL}${file.url}`);
    }
  } else {
    downloadFile(file.id).then(res => {
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', file.name)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }
}

const handleUploadRemove = (rawFile) => {
  const id = rawFile.id || rawFile.response.data.id;
  const uid = rawFile.uid;
  filelist.value = filelist.value.filter(r => r.uid != uid);
  cloneList.value = cloneList.value.filter(r => r.id != id);
  removeFile(rawFile.id || rawFile.response.data.id)
}

</script>

<style scoped>

</style>