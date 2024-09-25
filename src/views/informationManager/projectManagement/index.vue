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
      <template #form-menu-right="{ size }">
        <el-button
            :size="size"
            @click="crudRef.closeDialog()"
        >
          关闭
        </el-button>
      </template>
      <template #table-engLevel="{ size, row, column, $index }">
        {{ formatterVal(row, 'ENG_GRAD', 'engLevel') }}
      </template>
      <template #table-engType="{ size, row, column, $index }">
        {{ formatterVal(row, 'project_type', 'engType') }}
      </template>
      <template #table-engStage="{ size, row, column, $index }">
        {{ formatterVal(row, 'project_step', 'engStage') }}
      </template>
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
      <template #form-attachment>
        <AlUpload v-model:fileList="fileList"/>
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
                      :disabled="true"
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
  defineFormColumns,
  defineTableIndexColumns,
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
import {formatterVal, loopTree} from '@/utils';
import {ref, reactive, onMounted, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {addProject, delProject, getProject, updateProject} from "@/api/informationManager/projectManagement";
import {deptTreeSelect} from "@/api/system/user";
import {getToken} from "@/utils/auth";
import {downloadFile, removeFile} from "@/api/tool/file";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed:'right',
  addText: '新增',
  detail:true,
  reset:false,
  width:'250',
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
  detailProps:{
    link:true,
    type: 'primary',
    icon:'View'
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
  detailText:'查看'
});
const detailMenu = defineCrudMenuColumns({
  submit:false,
  reset:true,
  resetText:'关闭'
});
const form = ref({attachment:[]});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let fileList = ref([]);
let department = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '工程编码',
    prop: 'engCode',
    component: 'el-input',
    props:{
      placeholder:'请输入工程编码',
    },
    search: true,
  },
  {
    label: '工程名称',
    prop: 'engName',
    component: 'el-input',
    props:{
      placeholder:'请输入工程名称',
    },
    search: true,
  },
  {
    label: '工程等别',
    prop: 'engLevel',
    component: 'pro-select',
    props:{
      clearable:true,
      data:dictStore.getDict('ENG_GRAD'),
      placeholder:'请选择工程等别',
    },
    search: true,
  },
  {
    label: '工程概况',
    prop: 'engOverview',
  },
  {
    label: '工程简称',
    prop: 'engShortName',
  },
  {
    label: '工程阶段',
    prop: 'engStage',
  },
  {
    label: '工程类型',
    prop: 'engType',
    component: 'pro-select',
    props:{
      clearable:true,
      data:dictStore.getDict('project_type'),
      placeholder:'请选择工程类型',
    },
    search: true,
  },
  {
    label:'备注',
    prop: 'remark',
  },
]));
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '工程编码',
    prop: 'engCode',
    component: 'el-input',
    props:{
      placeholder:'请输入工程编码',
    },
    md:12,
    rules: [{required: true, message: '请输入工程编码'}],
  },
  {
    label: '工程名称',
    prop: 'engName',
    component: 'el-input',
    props:{
      placeholder:'请输入工程名称',
    },
    rules: [{required: true, message: '请输入工程名称'}],
    md:12
  },
  {
    label: '工程等别',
    prop: 'engLevel',
    component: 'pro-select',
    props:{
      clearable:true,
      data:dictStore.getDict('ENG_GRAD'),
      placeholder:'请选择工程等别',
      style:{width:'100%'}
    },
    md:12
  },
  {
    label: '工程概况',
    prop: 'engOverview',
    component: 'el-input',
    props:{
      placeholder:'请输入工程概况',
    },
    md:12
  },
  {
    label: '工程简称',
    prop: 'engShortName',
    component: 'el-input',
    props:{
      placeholder:'请输入工程简称',
    },
    md:12
  },
  {
    label: '工程阶段',
    prop: 'engStage',
    component: 'pro-select',
    props:{
      clearable:true,
      data:dictStore.getDict('project_step'),
      style:{width:'100%'},
      placeholder:'请输入工程阶段',
    },
    md:12
  },
  {
    label: '工程类型',
    prop: 'engType',
    component: 'pro-select',
    props:{
      clearable:true,
      data:dictStore.getDict('project_type'),
      placeholder:'请选择工程类型',
      style:{width:'100%'}
    },
    md:12
  },
  {
    label:'管理单位',
    prop: 'manUnitId',
    component: 'el-tree-select',
    props:{
      data:department.value,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
      checkStrictly: true,
      placeholder:'请选择管理单位',
    },
    md:12
  },
  {
    label: '计划工期',
    prop: 'planDuration',
    component: 'el-input',
    props:{
      placeholder:'请输入计划工期',
      slots: {
        suffix: () => '月',
      },
    },
    md:12
  },
  {
    label: '总投资',
    prop: 'totalInvestment',
    component: 'el-input',
    props:{
      placeholder:'请输入总投资',
      slots: {
        suffix: () => '万',
      },
    },
    md:12
  },
  {
    label: '计划开工日期',
    prop: 'planStartDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择计划开工日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '计划完工日期',
    prop: 'planFinishDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择计划完工日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '实际开工日期',
    prop: 'actualStartDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择实际开工日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '实际完工日期',
    prop: 'actualFinishDate',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择实际完工日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label:'划界确权成果概述',
    prop: 'demarcation',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder: '请输入划界确权成果概述',
    },
    md: 24,
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
    md: 24,
  },
  {
    label: '附件',
    prop: 'attachment',
  }
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '工程编码',
    prop: 'engCode',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入工程编码',
    },
    md:12,
    rules: [{required: true, message: '请输入工程编码'}],
  },
  {
    label: '工程名称',
    prop: 'engName',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入工程名称',
    },
    rules: [{required: true, message: '请输入工程名称'}],
    md:12
  },
  {
    label: '工程等别',
    prop: 'engLevel',
    component: 'pro-select',
    props:{
      disabled:true,
      clearable:true,
      data:dictStore.getDict('ENG_GRAD'),
      placeholder:'请选择工程等别',
      style:{width:'100%'}
    },
    md:12
  },
  {
    label: '工程概况',
    prop: 'engOverview',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入工程概况',
    },
    md:12
  },
  {
    label: '工程简称',
    prop: 'engShortName',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入工程简称',
    },
    md:12
  },
  {
    label: '工程阶段',
    prop: 'engStage',
    component: 'pro-select',
    props:{
      disabled:true,
      clearable:true,
      data:dictStore.getDict('project_step'),
      style:{width:'100%'},
      placeholder:'请输入工程阶段',
    },
    md:12
  },
  {
    label: '工程类型',
    prop: 'engType',
    component: 'pro-select',
    props:{
      disabled:true,
      clearable:true,
      data:dictStore.getDict('project_type'),
      placeholder:'请选择工程类型',
      style:{width:'100%'}
    },
    md:12
  },
  {
    label:'管理单位',
    prop: 'manUnitId',
    component: 'el-tree-select',
    props:{
      disabled:true,
      data:department.value,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
      checkStrictly: true,
      placeholder:'请选择管理单位',
    },
    md:12
  },
  {
    label: '计划工期',
    prop: 'planDuration',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入计划工期',
      slots: {
        suffix: () => '月',
      },
    },
    md:12
  },
  {
    label: '总投资',
    prop: 'totalInvestment',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入总投资',
      slots: {
        suffix: () => '万',
      },
    },
    md:12
  },
  {
    label: '计划开工日期',
    prop: 'planStartDate',
    component: 'el-date-picker',
    props:{
      disabled:true,
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择计划开工日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '计划完工日期',
    prop: 'planFinishDate',
    component: 'el-date-picker',
    props:{
      disabled:true,
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择计划完工日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '实际开工日期',
    prop: 'actualStartDate',
    component: 'el-date-picker',
    props:{
      disabled:true,
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择实际开工日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label: '实际完工日期',
    prop: 'actualFinishDate',
    component: 'el-date-picker',
    props:{
      disabled:true,
      clearable:true,
      type:'date',
      style: {width: '100%'},
      placeholder:'请选择实际完工日期',
      'value-format':'YYYY-MM-DD',
    },
    md:12
  },
  {
    label:'划界确权成果概述',
    prop: 'demarcation',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder: '请输入划界确权成果概述',
    },
    md: 24,
  },
  {
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      disabled:true,
      autosize:{minRows:2},
      type:'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  },
  {
    label: '附件',
    prop: 'attachment',
  }
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.attachment;
    form.value = {...row};
  } else {
    fileList.value = [];
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
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
})

const getData = () => {
  getProject({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
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
      addProject({
        ...form.value,
        attachment:JSON.stringify(fileList.value)
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
      updateProject(form.value.id, {
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
    delProject(row.id).then(res => {
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
  proxy.download("/business/standard/engBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`工程基础数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">
:deep(.pro-form:not(.el-form--inline) .pro-form-menu){
  display: flex;
  .el-form-item__content{
    justify-content: end;
    margin-right: 40px;
  }
}
</style>