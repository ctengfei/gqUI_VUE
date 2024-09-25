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
        width="40%"
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
      <template #search-menu-right="{ size }">
<!--        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>-->
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
      <template #form-menu-right="{ size }">
        <el-button
            :size="size"
            @click="crudRef.closeDialog()"
        >
          关闭
        </el-button>
      </template>
      <template #table-level="{ size, row, column, $index }">
        {{ formatterVal(row,'RISK_LEVEL','level') }}
      </template>
      <template #table-img="{row}">
        <el-image
            :src="row.img"
            :preview-teleported="true"
            :preview-src-list="[row.img]"
            style="width: 50px; height: 50px"
            fit="cover"
        />
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
import {ref, reactive, onMounted} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage,ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {addVideo, delVideo, getVideo, updateVideo} from "@/api/informationManager/videoWarning";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  edit:false,
  del:false,
  fixed:'right',
  // addText: '新增',
  detail:true,
  reset:false,
  width:'250',
  // addProps: {
  //   type: 'primary',
  //   plain: true,
  //   icon:"Plus",
  // },
  // editProps:{
  //   link:true,
  //   type: 'primary',
  //   icon:'Edit'
  // },
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
  // editText: '修改',
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
    label: '摄像头名称',
    prop: 'cameraName',
    component: 'el-input',
    props:{
      placeholder:'请输入摄像头名称',
    },
    form: true,
    search: true,
  },
  {
    label: '预警时间',
    prop: 'alarmTime',
    component: 'el-date-picker',
    props: {
      clearable:true,
      type: 'daterange',
      'start-placeholder':"开始时间",
      'end-placeholder':'结束时间',
      'range-separator':'-',
      'value-format':"YYYY-MM-DD"
    },
    search: true,
  },
  {
    label: '风险等级',
    prop: 'level',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('RISK_LEVEL'),
      placeholder: '请选择风险等级',
      clearable:true,
    },
    search: true,
    form: true,
  },
  {
    label: '模型名称',
    prop: 'modelName',
    component: 'el-input',
    props:{
      placeholder:'请输入模型名称',
    },
    search: true,
    form: true,
  },
  {
    label: '区域名称',
    prop: 'region',
    search: false,
    form: true,
  },
  {
    label: '处理内容',
    prop: 'content',
    search: false,
    form: true,
  },
  {
    label: '备注',
    prop: 'remark',
    search: false,
    form: true,
  }
]);
const formColumns = defineFormColumns([
  {
    label: '摄像头名称',
    prop: 'cameraName',
    component: 'el-input',
    props:{
      placeholder:'请输入摄像头名称',
    },
    md: 12,
  },
  {
    label: '风险等级',
    prop: 'level',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('RISK_LEVEL'),
      placeholder: '请选择风险等级',
      clearable:true,
    },
    md: 12,
  },
  {
    label: '模型名称',
    prop: 'modelName',
    component: 'el-input',
    props:{
      placeholder:'请输入模型名称',
    },
    md: 12,
  },
  {
    label: '区域名称',
    prop: 'region',
    component: 'el-input',
    props:{
      placeholder:'请输入区域名称',
    },
    md: 12,
  },
  {
    label:'图片地址',
    prop: 'img',
    component: 'el-image',
    props:{
      placeholder:'请输入图片地址',
    },
    md: 12,
  },
  {
    label: '处理内容',
    prop: 'content',
    component: 'el-input',
    props:{
      placeholder:'请输入处理内容',
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
    label: '摄像头名称:',
    prop: 'cameraName',
    component: 'el-input',
    props:{
      readonly:true,
    },
    md: 12,
  },
  {
    label: '预警时间:',
    prop: 'alarmTime',
    component: 'el-date-picker',
    props: {
      clearable:true,
      readonly:true,
      type: 'datetime',
      'value-format': "YYYY-MM-DD hh:mm:ss"
    },
    md: 12
  },
  {
    label: '风险等级:',
    prop: 'level',
    component: 'pro-select',
    props: {
      readonly:true,
      disabled:true,
      data: dictStore.getDict('RISK_LEVEL'),
    },
    md: 12,
  },
  {
    label: '模型名称:',
    prop: 'modelName',
    component: 'el-input',
    props:{
      readonly:true,
    },
    md: 12,
  },
  {
    label: '区域名称:',
    prop: 'region',
    component: 'el-input',
    props:{
      readonly:true,
    },
    md: 12,
  },
  {
    label:'图片地址:',
    prop: 'img',
    component: 'el-image',
    props:{
      readonly:true,
    },
    md: 12,
  },
  {
    label: '处理内容:',
    prop: 'content',
    component: 'el-input',
    props:{
      readonly:true,
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md: 24,
  },
  {
    label: '备注:',
    prop: 'remark',
    component: 'el-input',
    props: {
      readonly:true,
      autosize: {minRows: 2},
      type: 'textarea',
    },
    md: 24,
  }
]);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = row || {};
  } else {
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
});

onMounted(()=>{
  getData()
})

const getData = () => {
  getVideo({
    ...serachForm.value,
    startTime: serachForm.value.alarmTime ? serachForm.value.alarmTime[0] : '',
    endTime: serachForm.value.alarmTime ? serachForm.value.alarmTime[1] : '',
    alarmTime:null,
    pageNum:currentPage.value,pageSize:pageSize.value
  }).then(res=>{
    if(res.success){
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
  if(isValid){
    if(type == 'add'){
      addVideo(form.value).then(res=>{
        if(res.success){
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    }else{
      updateVideo(form.value.id,form.value).then(res=>{
        if(res.success){
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
  }).then(()=>{
    delVideo(row.id).then(res=>{
      if(res.success){
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    });
  })
};

const exportData = () =>{
  proxy.download("/business/warning/rvSlyj/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`防汛备料物资基础数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>