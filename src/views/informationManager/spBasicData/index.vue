<template>
  <div class="app-container">
    <pro-crud
        ref="crudRef"
        v-model="form"
        v-model:search="serachForm"
        :columns="columns"
        :form-columns="formColumns"
        :gutter="20"
        :menu="menu"
        :data="data"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        layout="->,total,sizes,prev, pager, next, jumper"
        background
        draggable
        :page-sizes="[10,20,30,40,50]"
        :total="total"
        @load="load"
        column="2"
        width="50%"
        align="center"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        label-width="155px"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
        @delete="deleteRow"
    >
      <template #table-dataSource="{ size, row, column, $index }">
        {{ row.dataSource == 1 ? '灌区' : '水库' }}
      </template>
      <template #table-delFlag="{ size, row, column, $index }">
        <a-switch :checked="row?.delFlag" :checked-value="0" :un-checked-value="1" @click="changeStatus(row)"/>
      </template>
      <template #table-status="{ size, row, column, $index }">
        {{ formatterVal(row,'video_status','status') }}
      </template>
      <template #table-protocol="{ size, row, column, $index }">
        {{ formatterVal(row,'PROTOCOL_TYPE','protocol') }}
      </template>
      <template #table-wmstType="{ size, row, column, $index }">
        {{ formatterVal(row,'CAMERA_TYPE','wmstType') }}
      </template>
      <template #table-channelType="{ size, row, column, $index }">
        {{ formatterVal(row,'CHANNEL_TYPE','channelType') }}
      </template>
      <template #form-menu-right="{ size }">
        <el-button
            :size="size"
            @click="crudRef.closeDialog()"
        >
          关闭
        </el-button>
      </template>
      <template #menu="{ size,row }">
        <el-button
            :size="size"
            type="success"
            icon="VideoPlay"
            link
            @click="handlePlayVideo(row)"
        >
          播放
        </el-button>
      </template>
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
        <el-button type="warning" plain icon="Refresh" @click="handleRefreshVideo">同步视频数据</el-button>
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        ></pro-form>
      </template>
    </pro-crud>
    <el-dialog
        v-model="dialogVisible"
        width="50%"
        :title="title"
        draggable
        @close="dialogVisible = false"
        class="camera-dialog"
        append-to-body
    >
      <div id="mv" ref="cameraDialog">
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineFormColumns,
  defineTableIndexColumns,
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
import { formatterVal } from '@/utils';
import {ref, reactive, onMounted, watch} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {getVideoList, exportSpExcel, addSp, updateSp, delSp,syncVideoList, updateSpStatus} from "@/api/informationManager/spBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {getPlayUrl} from "@/api/digitization";
import DPlayer from "dplayer";
import Hls from "hls.js";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: true,
  reset: false,
  width: '290',
  addProps: {
    type: 'primary',
    plain: true,
    icon: 'Plus'
  },
  editProps: {
    link: true,
    type: 'primary',
    icon: 'Edit'
  },
  detailProps:{
    link:true,
    type: 'primary',
    icon:'View'
  },
  delProps: {
    link: true,
    type: 'danger',
    icon: 'Delete'
  },
  searchResetProps:{
    icon:"Refresh",
  },
  searchProps:{
    type: 'primary',
    icon:"Search",
  },
  delText: '删除',
  editText: '修改',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
  detailText:'查看'
});
const detailMenu = defineCrudMenuColumns({
  submit:false,
  reset:true,
  resetText:'关闭'
});
let dialogVisible = ref(false);
const DP = ref(null);
const cameraDialog = ref(null);
let playUrl = ref('');
let title = ref('');
const form = ref({});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '监控点名称',
    prop: 'wmstName',
    component: 'el-input',
    props:{
      placeholder:'请输入监控点名称',
    },
    form: true,
    search: true,
  },
  {
    label: '摄像头类型',
    prop: 'wmstType',
    search: false,
    form: true,
    component: 'pro-select',
    props: {
      data: dictStore.getDict('CAMERA_TYPE'),
      config: {value: 'value', label: 'label'},
      clearable:true
    },
  },
  // {
  //   label: '监控对象',
  //   prop: 'wmstObj',
  //   search: false,
  //   form: true,
  // },
  {
    label: '接入协议',
    prop: 'protocol',
    search: false,
    form: true,
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('PROTOCOL_TYPE'),
      config: {value: 'value', label: 'label'},
      clearable:true
    },
    rules:[{ required: true, message: '请选择接入协议' }],
    md: 12,
  },
  {
    label: '通道类型',
    prop: 'channelType',
    search: true,
    form: true,
    component: 'pro-select',
    props: {
      data: dictStore.getDict('CHANNEL_TYPE'),
      config: {value: 'value', label: 'label'},
      style: { width: "100px" },
      clearable:true
    },
  },
  {
    label: '经度',
    prop: 'wmstLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'wmstLat',
    search: false,
    form: true,
  },
  {
    label: '所在位置',
    prop: 'dataSource',
    search: false,
    form: true,
  },
  {
    label: "是否可用",
    prop: "delFlag",
    search: true,
    form: true,
  },
  {
    label: '状态',
    prop: 'status',
    search: true,
    form: true,
    component: 'pro-select',
    props: {
      data: dictStore.getDict('video_status'),
      config: {value: 'value', label: 'label'},
      style: { width: "100px" },
      clearable:true
    },
  },
  {
    label: '备注',
    prop: 'remark',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns([
  {
    label: '监控点名称',
    prop: 'wmstName',
    component: 'el-input',
    props:{
      placeholder:'请输入监控点名称',
    },
    md: 12,
  },
  {
    label: '摄像头类型',
    prop: 'wmstType',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('CAMERA_TYPE'),
      config: {value: 'value', label: 'label'},
      clearable:true
    },
    md: 12,
  },
  {
    label: '通道类型',
    prop: 'channelType',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('CHANNEL_TYPE'),
      config: {value: 'value', label: 'label'},
      clearable:true
    },
    md: 12,
  },
  {
    label: '端口',
    prop: 'equPort',
    component: 'el-input-number',
    props: {
      style:{width:'100%'},
      placeholder: '请输入端口',
    },
    md: 12,
  },
  {
    label: 'IP地址',
    prop: 'ipAddr',
    component: 'el-input',
    props: {
      placeholder: '请输入IP地址',
    },
    md: 12,
  },
  {
    label: '接入协议',
    prop: 'protocol',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('PROTOCOL_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择接入协议',
      clearable:true
    },
    rules:[{ required: true, message: '请选择接入协议' }],
    md: 12,
  },
  {
    label: '经度',
    prop: 'wmstLong',
    component: 'el-input',
    props: {
      placeholder: '请输入经度',
    },
    md: 12,
  },
  {
    label: '纬度',
    prop: 'wmstLat',
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'wmstLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label: '监控对象',
    prop: 'wmstObj',
    component: 'el-input',
    props: {
      placeholder: '请输入监控对象',
    },
    md: 12,
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('video_status'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择状态',
      clearable:true
    },
    md: 12,
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  }
]);
const detailColumns = defineFormColumns([
  {
    label: '监控点名称',
    prop: 'wmstName',
    component: 'el-input',
    props:{
      placeholder:'请输入监控点名称',
    },
    md: 12,
  },
  {
    label: '摄像头类型',
    prop: 'wmstType',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('CAMERA_TYPE'),
      config: {value: 'value', label: 'label'},
      clearable:true
    },
    md: 12,
  },
  {
    label: '通道类型',
    prop: 'channelType',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('CHANNEL_TYPE'),
      config: {value: 'value', label: 'label'},
      clearable:true
    },
    md: 12,
  },
  {
    label: '端口',
    prop: 'equPort',
    component: 'el-input-number',
    props: {
      style:{width:'100%'},
      placeholder: '请输入端口',
    },
    md: 12,
  },
  {
    label: 'IP地址',
    prop: 'ipAddr',
    component: 'el-input',
    props: {
      placeholder: '请输入IP地址',
    },
    md: 12,
  },
  {
    label: '接入协议',
    prop: 'protocol',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('PROTOCOL_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择接入协议',
      clearable:true
    },
    rules:[{ required: true, message: '请选择接入协议' }],
    md: 12,
  },
  {
    label: '经度',
    prop: 'wmstLong',
    component: 'el-input',
    props: {
      placeholder: '请输入经度',
    },
    md: 12,
  },
  {
    label: '纬度',
    prop: 'wmstLat',
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'wmstLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label: '监控对象',
    prop: 'wmstObj',
    component: 'el-input',
    props: {
      placeholder: '请输入监控对象',
    },
    md: 12,
  },
  {
    label: '状态',
    prop: 'status',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('video_status'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择状态',
      clearable:true
    },
    md: 12,
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  }
].map(r=>({...r,props:{...r.props,disabled:true}})));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = {...row,status:JSON.stringify(row.status)} || {};
  } else {
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

onMounted(() => {
  getData()
})

function handlePlayVideo(row) {
  title.value = row.wmstName;
  getPlayUrl({
    protocol:'hls',
    dataSource:row.dataSource,
    wmstCode: row.wmstCode
  }).then(res=>{
    dialogVisible.value = true;
    playUrl.value = res.data;
  })
}

watch([cameraDialog,dialogVisible,playUrl],([dialogRef,vis,url])=>{
  if( dialogRef && vis && url){
    let hls = new Hls();
    DP.value = new DPlayer({
      container: dialogRef,
      autoplay:true,
      live:true,
      screenshot: true, 
      preload: 'auto',
      video: {
        url: url,
        type: 'customHls',
        customType: {
          customHls: function (video, player) {
            hls.loadSource(video.src);
            hls.attachMedia(video);
          },
        },
      },
    });
    DP.value.on('pause', function () {
      hls && hls.stopLoad();
    });
    DP.value.on('play', function () {
      hls && hls.startLoad();
    });
    DP.value.on('destroy', function () {
      hls && hls.destroy();
    });
  }else{
    DP.value && DP.value.destroy();
    DP.value = null;
  }
})

const getData = () => {
  getVideoList({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  })
}
const handleRefreshVideo=()=> {
  syncVideoList().then((res) => {
    if (res.success) {
      proxy.$modal.msgSuccess(res.data);
    }
  });
} 
const searchSubmit = defineCrudSearch((done, isValid, invalidFields) => {
  getData()
  done();
});

const searchReset = () => {
  currentPage.value = 1;
  getData();
}
function changeStatus(e){
  e.delFlag = e.delFlag == 0 ? 1 : 0;
  updateSpStatus({status: e.delFlag, wmstCode: e.wmstCode}).then((res) => {
    if(res.success){
      getData();
    }
  })
}


const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == 'add') {
      addSp({...form.value,wmstType:1,delFlag: 0,}).then(res => {
        if (res.success) {
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    } else {
      updateSp(form.value.wmstCode, form.value).then(res => {
        if (res.success) {
          ElMessage({
            message: '修改成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    }
  }
  done()
});


// 分页选择
const load = () => {
  getData()
}

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    delSp(row.wmstCode).then(res => {
      if (res.success) {
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    });
  })
};
const exportData = () => {
  proxy.download("business/base/wmstBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`监控视频基础数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

</script>
<style lang="scss">
.camera-dialog{
  .el-dialog__body{
    padding: 0;
  }
}
</style>
<style scoped lang="scss">
#mv{
  height: 500px;
}
:deep(.pro-form:not(.el-form--inline) .pro-form-menu) {
  display: flex;

  .el-form-item__content {
    justify-content: end;
    margin-right: 40px;
  }
}
</style>