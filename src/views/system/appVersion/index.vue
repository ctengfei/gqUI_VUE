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
        :page-sizes="[10,20,30,40,50]"
        :total="total"
        @load="load"
        column="2"
        width="40%"
        align="center"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        label-width="130px"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
        @delete="deleteRow"
        @step-change="stepChange"
    >
      <template #form-menu-right="{ size }">
        <el-button
            :size="size"
            @click="crudRef.closeDialog()"
        >
          关闭
        </el-button>
      </template>
      <template #table-updateType="{ size, row, column, $index }">
        {{ formatterVal(row, 'app_update_type', 'updateType') }}
      </template>
      <template #table-clientType="{ size, row, column, $index }">
        {{ formatterVal(row, 'CLIENT_TYPE', 'clientType') }}
      </template>
      <template #table-isForce="{ size, row, column, $index }">
        {{ formatterisForce(row.isForce) }}
      </template>
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
      </template>
      <template #form-file>
        <el-upload
            ref="upload"
            drag
            :headers="headers"
            limit="1"
            style="width: 100%"
            :action="uploadFileUrl"
            :on-remove="handleUploadRemove"
            :on-exceed="handleExceed"
            :on-success="handleSuccess"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            单击或拖动文件到此区域进行上传
          </div>
        </el-upload>
      </template>
      <template #menu="{ size,row }" >
        <el-button :size="size" type="success"  link @click="handleDownload(row)">
          <el-icon><Download /></el-icon> 下载
        </el-button>
      </template>
    </pro-crud>
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
import {ref, reactive, onMounted, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox, genFileId} from "element-plus";
import dayjs from "dayjs";
import {getToken} from "@/utils/auth";
import {removeFile} from "@/api/tool/file";
import {addApp, delApp, updateApp,getApp} from "@/api/system/appVersion";
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed:'right',
  addText: '新增',
  detail:false,
  reset:false,
  width:'260',
  addProps: {
    type: 'primary',
    plain: true,
    icon:"Plus",
  },
  editProps:{
    link:true,
    type: 'primary',
    icon:'Edit'
  },
  delProps:{
    link:true,
    type: 'danger',
    icon:'Delete'
  },
  searchResetProps:{
    icon:"Refresh",
  },
  searchProps:{
    type: 'primary',
    icon:"Search",
  },
  delText:'删除',
  editText: '修改',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
  prevText:'上一步',
  nextText:'下一步'
});
const form = ref({filePath:'',fileSize:''});
const crudRef = ref();
const serachForm = ref({});
const upload = ref(null);
let data = ref([]);
let cols = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let fileList = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();

const columns = defineCrudColumns([
  {
    label: 'APP名称',
    prop: 'appName',
    component: 'el-input',
    props:{
      placeholder:'请输入APP名称',
    },
    form: true,
    search: true,
  },
  {
    label: '应用客户端类型',
    prop: 'clientType',
    component: 'pro-select',
    props:{
      clearable:true,
      placeholder:'请选择应用客户端类型',
      config:{value: 'value', label: 'label'},
      data:dictStore.getDict('CLIENT_TYPE'),
    },
    form: true,
    search: true,
  },
  {
    label: '更新说明',
    prop: 'content',
    search: false,
    form: true,
  },
  {
    label: 'APP文件路径',
    hide:true,
    prop: 'filePath',
    search: false,
    form: true,
  },
  {
    label: 'APP文件大小',
    prop: 'fileSize',
    hide:true,
    search: false,
    form: true,
  },
  {
    label: '是否强制更新',
    prop: 'isForce',
    component: 'pro-select',
    props:{
      style:{width:'100%'},
      placeholder:'请选择是否强制更新',
      data:[{label:'否',value:'0'},{label:'是',value: '1'}],
      config:{value: 'value', label: 'label'},
      },
    search: false,
    form: true,
  },
  {
    label: '更新类型',
    prop: 'updateType',
    component: 'pro-select',
    props:{
      clearable:true,
      placeholder:'请选择更新类型',
      data:dictStore.getDict('app_update_type'),
      config:{value: 'value', label: 'label'},
    },
    search: true,
    form: true,
  },
  {
    label:'版本号',
    prop: 'versionCode',
    search: false,
    form: true,
  },
  {
    label:'版本名称',
    prop: 'versionName',
    search: false,
    form: true,
  },
  {
    label:'备注',
    prop: 'remark',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns(computed(()=>cols.value));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if(type === 'add'){
    cols.value = [
      {
        label:'上传APP文件',
        type: 'steps',
        children:[
          {
            prop: 'file',
            md: 24,
            'label-width':50
          }
        ]
      },
      {
        label:'文件信息',
        type: 'steps',
        children:[
          {
            label: 'APP名称',
            prop: 'appName',
            component: 'el-input',
            props:{
              placeholder:'请输入APP名称',
            },
            rules:[{ required: true, message: '请输入APP名称' }],
            md: 12,
          },
          {
            label: '应用客户端类型',
            prop: 'clientType',
            component: 'pro-select',
            props:{
              clearable:true,
              style:{width:'100%'},
              placeholder:'请选择应用客户端类型',
              config:{value: 'value', label: 'label'},
              data:dictStore.getDict('CLIENT_TYPE'),
            },
            rules:[{ required: true, message: '请输入APP名称' }],
            md: 12,
          },
          {
            label: 'APP文件路径',
            prop: 'filePath',
            component: 'el-input',
            props:{
              disabled:true,
              placeholder:'请输入APP文件路径',
            },
            md: 12,
          },
          {
            label: 'APP文件大小',
            prop: 'fileSize',
            component: 'el-input',
            hide:true,
            props:{
              disabled:true,
              placeholder:'请输入APP文件大小',
            },
            md: 12,
          },
          {
            label: '是否强制更新',
            prop: 'isForce',
            component: 'pro-select',
            rules:[{ required: true, message: '请选择是否强制更新' }],
            props:{
              style:{width:'100%'},
              placeholder:'请选择是否强制更新',
              data:[{label:'否',value:'0'},{label:'是',value: '1'}],
              config:{value: 'value', label: 'label'},
            },
            md: 12,
          },
          {
            label: '更新类型',
            prop: 'updateType',
            component: 'pro-select',
            rules:[{ required: true, message: '请选择更新类型' }],
            props:{
              clearable:true,
              style:{width:'100%'},
              placeholder:'请选择更新类型',
              data:dictStore.getDict('app_update_type'),
              config:{value: 'value', label: 'label'},
            },
            md: 12,
          },
          {
            label:'版本号',
            prop: 'versionCode',
            component: 'el-input',
            rules:[{ required: true, message: '请输入版本号' }],
            props:{
              placeholder:'请输入版本号',
            },
            md: 12,
          },
          {
            label:'版本名称',
            prop: 'versionName',
            component: 'el-input',
            props:{
              placeholder:'请输入版本名称',
            },
            md: 12,
          },
          {
            label: '更新说明',
            prop: 'content',
            component: 'el-input',
            props:{
              autosize:{minRows:2},
              type:'textarea',
              placeholder: '请输入更新说明',
            },
            md: 12,
          },
          {
            label:'备注',
            prop: 'remark',
            component: 'el-input',
            props:{
              autosize:{minRows:2},
              type:'textarea',
              placeholder: '请输入备注',
            },
            md: 12,
          }
        ]
      }
    ];
  }
  if (type === 'edit') {
    cols.value = [
      {
        label: 'APP名称',
        prop: 'appName',
        component: 'el-input',
        props:{
          placeholder:'请输入APP名称',
        },
        rules:[{ required: true, message: '请输入APP名称' }],
        md: 12,
      },
      {
        label: '应用客户端类型',
        prop: 'clientType',
        component: 'pro-select',
        props:{
          clearable:true,
          style:{width:'100%'},
          placeholder:'请选择应用客户端类型',
          config:{value: 'value', label: 'label'},
          data:dictStore.getDict('CLIENT_TYPE'),
        },
        rules:[{ required: true, message: '请输入APP名称' }],
        md: 12,
      },
      {
        label: 'APP文件路径',
        prop: 'filePath',
        component: 'el-input',
        props:{
          disabled:true,
          placeholder:'请输入APP文件路径',
        },
        md: 12,
      },
      {
        label: 'APP文件大小',
        prop: 'fileSize',
        component: 'el-input',
        props:{
          disabled:true,
          placeholder:'请输入APP文件大小',
        },
        md: 12,
      },
      {
        label: '是否强制更新',
        prop: 'isForce',
        component: 'pro-select',
        rules:[{ required: true, message: '请选择是否强制更新' }],
        props:{
          clearable:true,
          style:{width:'100%'},
          placeholder:'请选择是否强制更新',
          data:[{label:'否',value:'0'},{label:'是',value: '1'}],
          config:{value: 'value', label: 'label'},
        },
        md: 12,
      },
      {
        label: '更新类型',
        prop: 'updateType',
        component: 'pro-select',
        rules:[{ required: true, message: '请选择更新类型' }],
        props:{
          clearable:true,
          style:{width:'100%'},
          placeholder:'请选择更新类型',
          data:dictStore.getDict('app_update_type'),
          config:{value: 'value', label: 'label'},
        },
        md: 12,
      },
      {
        label:'版本号',
        prop: 'versionCode',
        component: 'el-input',
        rules:[{ required: true, message: '请输入版本号' }],
        props:{
          placeholder:'请输入版本号',
        },
        md: 12,
      },
      {
        label:'版本名称',
        prop: 'versionName',
        component: 'el-input',
        props:{
          placeholder:'请输入版本名称',
        },
        md: 12,
      },
      {
        label: '更新说明',
        prop: 'content',
        component: 'el-input',
        props:{
          autosize:{minRows:2},
          type:'textarea',
          placeholder: '请输入更新说明',
        },
        md: 12,
      },
      {
        label:'备注',
        prop: 'remark',
        component: 'el-input',
        props:{
          autosize:{minRows:2},
          type:'textarea',
          placeholder: '请输入备注',
        },
        md: 12,
      }
    ];
    form.value = row || {};
  } else {
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

const formatterisForce = (id) => {
  return id == 1 ? '是' : '否'
}

const handleSuccess = (res) =>{
  if (res.success) {
    const img = res.data;
    form.value.filePath = img.storagePath;
    form.value.fileSize = img.size;
    form.value.id =img.id ;
  }
}

const handleExceed = (files) => {
  upload.value?.clearFiles();
  const file = files[0];
  file.uid = genFileId();
  upload.value?.handleStart(file);
}

const handleDownload = (row) => {
  const link = document.createElement('a')
  link.setAttribute('href', `${import.meta.env.VITE_FILE_URL}${row.filePath}`);
  link.click();
}

const handleUploadRemove = (rawFile) => {
  removeFile(rawFile.id || rawFile.response.data.id)
}

const stepChange = (active) =>{
  if(active == 1){

  }
}

onMounted(() => {
  getData()
})

const getData = () => {
  getApp({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
    if (res.code == 200) {
      data.value = res.rows;
      total.value = res.total
    }
  })
}

const searchSubmit = defineCrudSearch((done, isValid, invalidFields) => {
  getData()
  done();
});

const searchReset = () => {
  currentPage.value = 1;
  getData();
}

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == 'add') {
      const { file } = form.value;
      addApp({...form.value}).then(res => {
        if (res.code == 200) {
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    } else {
      updateApp(form.value).then(res => {
        if (res.code == 200) {
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
  getData();
}

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    delApp(row.id).then(res => {
      if (res.code == 200) {
        getData()
        removeFile(row.id)
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    });
  })
};

const exportData = () => {

}
</script>

<style scoped lang="scss">

</style>