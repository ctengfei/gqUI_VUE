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
        align="center"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        label-width="150px"
        width="40%"
        direction="horizontal"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
        @delete="deleteRow"
    >
      <template #form-menu-right="{ size }">
        <el-button
            :size="size"
            @click="crudRef.closeDialog()"
        >
          关闭
        </el-button>
      </template>
<!--      <template #menu="{ size,row }">-->
<!--        <el-button :size="size" v-if="row.attachment && row.attachment!='[]'" type="success" link @click="handlePreview(row)">-->
<!--          <el-icon><View /></el-icon> 预览-->
<!--        </el-button>-->
<!--        <el-button :size="size" v-if="row.attachment && row.attachment!='[]'" type="success" link @click="handleDownload(row)">-->
<!--          <el-icon><Download /></el-icon>-->
<!--          下载-->
<!--        </el-button>-->
<!--      </template>-->
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
      </template>
      <template #table-mainWainUse="{ size, row, column, $index }">
        {{ formatterVal(row, 'MAIN_WAIN_USE', 'mainWainUse') }}
      </template>
      <template #form-attachment>
        <AlUpload v-model:fileList="fileList"
                  limit="1"
                  accept=".pdf"
        />
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        >
          <template #form-attachment>
            <AlUpload v-model:fileList="fileList"
                      limit="1"
                      :disabled="true"
                      accept=".pdf"
            />
          </template>
        </pro-form>
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
  defineTableIndexColumns,
  defineCrudBeforeOpen, defineFormColumns, defineCrudBeforeClose,
} from 'element-pro-components';
import {nextTick, onMounted, ref, watch} from "vue";
import {formatterVal} from '@/utils';
import useDictionaryStore from "@/store/modules/dictionary";
import {addDec, delDec, getDec, updateDec} from "@/api/waterManager/waterDecMananger";
import {ElMessage, ElMessageBox, genFileId} from "element-plus";
import { Download,View } from '@element-plus/icons-vue';
import dayjs from "dayjs";
import {getToken} from "@/utils/auth";
import {downloadFile, removeFile} from "@/api/tool/file";

const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
const menu = defineCrudMenuColumns({
  label: '操作',
  width: 290,
  add: false,
  fixed:'right',
  detail: true,
  reset: false,
  addText: '新增',
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
  editText: '修改',
  delText: '删除',
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
const form = ref({attachment: ''});
const crudRef = ref();
const serachForm = ref({});
const detail = ref({});
const data = ref([]);
const currentPage = ref(1)
const pageSize = ref(10)
let total = ref(0);
let fileList = ref([]);
const upload = ref(null);
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {

    label: '申请单名称',
    prop: 'applyName',
    component: 'el-input',
    props: {
      placeholder: '请输入申请单名称',
    },
    form: true,
    search: false,
  },
  {
    label: '申请事项',
    prop: 'applyItem',
    component: 'el-input',
    props: {
      placeholder: '请输入申请事项',
    },
    form: true,
    search: true,
  },
  {
    label: '管理单位编码',
    prop: 'admDep',
    component: 'el-input',
    props: {
      placeholder: '请输入管理单位编码',
    },
    form: true,
    search: true,
  },
  {
    label: '申请单位',
    prop: 'unitName',
    component: 'el-input',
    props: {
      placeholder: '请输入申请单位',
    },
    search: true,
    form: true,
  },
  {
    label: '申请操作时间',
    prop: 'applyTime',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type: 'daterange',
      'start-placeholder': "开始时间",
      'end-placeholder': "结束时间",
      'value-format': "YYYY-MM-DD"
    },
    search: true,
    form: true,
  },
  {
    label: '涉及闸门',
    prop: 'wagaId',
    search: false,
    form: true,
  },
  // {
  //   label: '闸门单孔开启高度(m)',
  //   prop: 'name6',
  //   search: false,
  //   form: true,
  // },
  {
    label: '申请时长(h)',
    prop: 'applyDuration',
    search: false,
    form: true,
  },
  {
    label: '申请流量(m³/s)',
    prop: 'applyFlow',
    search: false,
    form: true,
  },
  {
    label: '申请水量(万m³)',
    prop: 'waterAmount',
    search: false,
    form: true,
  },
  {
    label: '取水用途',
    prop: 'mainWainUse',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('MAIN_WAIN_USE'), // run_status.value
      config: {value: 'value', label: 'label'},
      placeholder: '请选择取水用途',
      clearable: true
    },
    search: true,
    form: true,
  },
  {
    label: '用水单位',
    prop: 'waterUseUnit',
    component: 'el-input',
    props: {
      placeholder: '请输入用水单位',
    },
    search: true,
    form: true,
  },
  {
    label: '申报人',
    prop: 'createBy',
  },
  {
    label: '申报时间',
    prop: 'createTime',
  }
]);
const formColumns = defineFormColumns([
  {
    label: '申请单名称',
    prop: 'applyName',
    component: 'el-input',
    rules: [{required: true, message: '请输入申请单名称'}],
    props: {
      placeholder: '请输入申请单名称',
    },
    md: 12
  },
  {
    label: '申请事项',
    prop: 'applyItem',
    component: 'el-input',
    rules: [{required: true, message: '请输入申请事项'}],
    props: {
      placeholder: '请输入申请事项',
    },
    md: 12
  },
  {
    label: '管理单位编码',
    prop: 'admDep',
    component: 'el-input',
    rules: [{required: true, message: '请输入管理单位编码'}],
    props: {
      placeholder: '请输入管理单位编码',
    },
    md: 12
  },
  {
    label: '申请单位',
    prop: 'unitName',
    component: 'el-input',
    rules: [{required: true, message: '请输入申请单位'}],
    props: {
      placeholder: '请输入申请单位',
    },
    md: 12
  },
  {
    label: '申请操作时间',
    prop: 'applyTime',
    component: 'el-date-picker',
    rules: [{required: true, message: '申请操作时间'}],
    props: {
      clearable:true,
      type: 'date',
      placeholder: "申请操作时间",
      'value-format': "YYYY-MM-DD"
    },
    md: 12
  },
  {
    label: '涉及闸门',
    prop: 'wagaId',
    component: 'el-input',
    props: {
      placeholder: '请输入涉及闸门',
    },
    md: 12
  },
  // {
  //   label: '闸门单孔开启高度(m)',
  //   prop: 'name6',
  //   component: 'el-input',
  //   md:12
  // },
  {
    label: '申请时长(h)',
    prop: 'applyDuration',
    component: 'el-input',
    props: {
      placeholder: '请输入申请时长',
    },
    md: 12
  },
  {
    label: '申请流量(m³/s)',
    prop: 'applyFlow',
    component: 'el-input',
    props: {
      placeholder: '请输入申请流量',
    },
    md: 12
  },
  {
    label: '申请水量(万m³)',
    prop: 'waterAmount',
    component: 'el-input',
    props: {
      placeholder: '请输入申请水量',
    },
    md: 12
  },
  {
    label: '取水用途',
    prop: 'mainWainUse',
    component: 'pro-select',
    rules: [{required: true, message: '请选择取水用途'}],
    props: {
      data: dictStore.getDict('MAIN_WAIN_USE'), // run_status.value
      config: {value: 'value', label: 'label'},
      placeholder: '请选择取水用途',
      clearable: true
    },
    md: 12
  },
  {
    label: '用水单位',
    prop: 'waterUseUnit',
    component: 'el-input',
    rules: [{required: true, message: '请输入用水单位'}],
    props: {
      placeholder: '请输入用水单位',
    },
    md: 12
  },
  {
    label: '附件',
    prop: 'attachment',
    md: 24
  }
])
const detailColumns = defineFormColumns([
  {
    label: '申请单名称',
    prop: 'applyName',
    component: 'el-input',
    rules: [{required: true, message: '请输入申请单名称'}],
    props: {
      disabled:true,
      placeholder: '请输入申请单名称',
    },
    md: 12
  },
  {
    label: '申请事项',
    prop: 'applyItem',
    component: 'el-input',
    rules: [{required: true, message: '请输入申请事项'}],
    props: {
      disabled:true,
      placeholder: '请输入申请事项',
    },
    md: 12
  },
  {
    label: '管理单位编码',
    prop: 'admDep',
    component: 'el-input',
    rules: [{required: true, message: '请输入管理单位编码'}],
    props: {
      disabled:true,
      placeholder: '请输入管理单位编码',
    },
    md: 12
  },
  {
    label: '申请单位',
    prop: 'unitName',
    component: 'el-input',
    rules: [{required: true, message: '请输入申请单位'}],
    props: {
      disabled:true,
      placeholder: '请输入申请单位',
    },
    md: 12
  },
  {
    label: '申请操作时间',
    prop: 'applyTime',
    component: 'el-date-picker',
    rules: [{required: true, message: '申请操作时间'}],
    props: {
      clearable:true,
      disabled:true,
      type: 'date',
      placeholder: "申请操作时间",
      'value-format': "YYYY-MM-DD"
    },
    md: 12
  },
  {
    label: '涉及闸门',
    prop: 'wagaId',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入涉及闸门',
    },
    md: 12
  },
  // {
  //   label: '闸门单孔开启高度(m)',
  //   prop: 'name6',
  //   component: 'el-input',
  //   md:12
  // },
  {
    label: '申请时长(h)',
    prop: 'applyDuration',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入申请时长',
    },
    md: 12
  },
  {
    label: '申请流量(m³/s)',
    prop: 'applyFlow',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入申请流量',
    },
    md: 12
  },
  {
    label: '申请水量(万m³)',
    prop: 'waterAmount',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入申请水量',
    },
    md: 12
  },
  {
    label: '取水用途',
    prop: 'mainWainUse',
    component: 'pro-select',
    rules: [{required: true, message: '请选择取水用途'}],
    props: {
      disabled:true,
      data: dictStore.getDict('MAIN_WAIN_USE'), // run_status.value
      config: {value: 'value', label: 'label'},
      placeholder: '请选择取水用途',
      clearable: true
    },
    md: 12
  },
  {
    label: '用水单位',
    prop: 'waterUseUnit',
    component: 'el-input',
    rules: [{required: true, message: '请输入用水单位'}],
    props: {
      disabled:true,
      placeholder: '请输入用水单位',
    },
    md: 12
  },
  {
    label: '附件',
    prop: 'attachment',
    md: 24
  }
])
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.attachment
    form.value = {...row }
  } else {
    fileList.value = []
    form.value = {};
  }
  done();
});

const handlePreview = (row) => {
  const atta = JSON.parse(row.attachment)[0];
  window.open( `${import.meta.env.VITE_FILE_URL}${atta.url}`)
}

const handleDownload = (row) => {
  const atta = JSON.parse(row.attachment)[0];
  downloadFile(atta.id).then(res=>{
    const url = window.URL.createObjectURL(new Blob([res]))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', atta.name)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

onMounted(() => {
  getData()
})

const getData = () => {
  getDec({
    ...serachForm.value,
    startTime: serachForm.value.applyTime ? serachForm.value.applyTime[0] : '',
    endTime: serachForm.value.applyTime ? serachForm.value.applyTime[1] : '',
    applyTime: null,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  }).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  })
}

const searchSubmit = defineCrudSearch((done, isValid, invalidFields) => {
  getData();
  done();
});

const searchReset = () => {
  currentPage.value = 1;
  getData();
}

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == 'add') {
      addDec({
        ...form.value,
        attachment: JSON.stringify(fileList.value)
      }).then(res => {
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
      updateDec(form.value.id, {
        ...form.value,
        attachment: JSON.stringify(fileList.value)
      }).then(res => {
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
  getData();
}

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    delDec(row.id).then(res => {
      if (res.success) {
        getData();
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
        if(row.attachment){
          const attachment = JSON.parse(row.attachment);
          attachment.forEach(r=>{
            removeFile(r.id)
          })
        }
      }
    });
  })
};

const exportData = () => {
  proxy.download("/business/waterUse/waterApply/page/export", {
    ...serachForm.value,
    startTime: serachForm.value.applyTime ? serachForm.value.applyTime[0] : '',
    endTime: serachForm.value.applyTime ? serachForm.value.applyTime[1] : '',
    applyTime: null,
    pageNum: currentPage.value, pageSize: pageSize.value
  }, `用水申报管理_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">
:deep(.pro-form:not(.el-form--inline) .pro-form-menu) {
  display: flex;

  .el-form-item__content {
    justify-content: end;
    margin-right: 40px;
  }
}
</style>