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
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
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
import {ref, reactive, onMounted, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage,ElMessageBox} from "element-plus";
import {addFl, delFl, updateFl, exportFlExcel, getFl} from "@/api/informationManager/basicData/floodBasicData";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: true,
  reset: false,
  width: '250',
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
    label: '队伍名称',
    prop: 'teamName',
    component: 'el-input',
    props:{
      placeholder:'请输入队伍名称',
    },
    form: true,
    search: true,
  },
  {
    label: '类型',
    prop: 'teamType',
    component: 'el-input',
    props:{
      placeholder:'请输入类型',
    },
    search: true,
    form: true,
  },
  {
    label: '经度',
    prop: 'longitude',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'latitude',
    search: false,
    form: true,
  },
  {
    label:'编制人数',
    prop: 'bzCount',
    search: false,
    form: true,
  },
  {
    label:'现有人数',
    prop: 'xyCount',
    search: false,
    form: true,
  },
  {
    label:'专业性质',
    prop: 'professional',
    search: false,
    form: true,
  },
  {
    label:'图片',
    prop: 'imgUrl',
    search: false,
    form: true,
  },
  {
    label:'负责人',
    prop: 'headName',
    search: false,
    form: true,
  },
  {
    label:'负责人电话',
    prop: 'headPhone',
    search: false,
    form: true,
  },
  {
    label:'备注',
    prop: 'remark',
    search: false,
    form: true,
  }
]);
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '队伍名称',
    prop: 'teamName',
    rules: [{required: true, message: '请输入队伍名称'}],
    component: 'el-input',
    props: {
      placeholder: '请输入队伍名称',
    },
    md: 12,
  },
  {
    label: '类型',
    prop: 'teamType',
    component: 'el-input',
    rules:[{ required: true, message: '请输入类型' }],
    props: {
      placeholder: '请输入类型',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'longitude',
    rules:[{ required: true, message: '请输入经度' }],
    props: {
      placeholder: '请输入经度',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '纬度',
    prop: 'latitude',
    rules:[{ required: true, message: '请输入纬度' }],
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    md: 12,
  },
  {
    label: '编制人数',
    prop: 'bzCount',
    component: 'el-input',
    props: {
      placeholder: '请输入编制人数',
    },
    md: 12,
  },
  {
    label: '现有人数',
    prop: 'xyCount',
    props: {
      placeholder: '请输入现有人数',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '专业性质',
    prop: 'professional',
    props: {
      placeholder: '请输入专业性质',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '负责人',
    prop: 'headName',
    props: {
      placeholder: '请输入负责人',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '负责人电话',
    prop: 'headPhone',
    rules: [{pattern:/^1[3-9]\d{9}$/,message:'请输入正确电话',trigger:'change'}],
    props: {
      placeholder: '请输入负责人电话',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '图片',
    prop: 'imgUrl',
    props: {
      placeholder: '请输入图片地址',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder:"请输入备注",
    },
    md: 24,
  }
]));
const detailColumns = defineFormColumns([
  {
    label: '队伍名称',
    prop: 'teamName',
    rules: [{required: true, message: '请输入队伍名称'}],
    component: 'el-input',
    props: {
      placeholder: '请输入队伍名称',
    },
    md: 12,
  },
  {
    label: '类型',
    prop: 'teamType',
    component: 'el-input',
    rules:[{ required: true, message: '请输入类型' }],
    props: {
      placeholder: '请输入类型',
    },
    md: 12,
  },
  {
    label: '经度',
    prop: 'longitude',
    rules:[{ required: true, message: '请输入经度' }],
    props: {
      placeholder: '请输入经度',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '纬度',
    prop: 'latitude',
    rules:[{ required: true, message: '请输入纬度' }],
    component: 'el-input',
    props: {
      placeholder: '请输入纬度',
    },
    md: 12,
  },
  {
    label: '编制人数',
    prop: 'bzCount',
    component: 'el-input',
    props: {
      placeholder: '请输入编制人数',
    },
    md: 12,
  },
  {
    label: '现有人数',
    prop: 'xyCount',
    props: {
      placeholder: '请输入现有人数',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '专业性质',
    prop: 'professional',
    props: {
      placeholder: '请输入专业性质',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '负责人',
    prop: 'headName',
    props: {
      placeholder: '请输入负责人',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '负责人电话',
    prop: 'headPhone',
    rules: [{pattern:/^1[3-9]\d{9}$/,message:'请输入正确电话',trigger:'change'}],
    props: {
      placeholder: '请输入负责人电话',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '图片',
    prop: 'imgUrl',
    props: {
      placeholder: '请输入图片地址',
    },
    component: 'el-input',
    md: 12,
  },
  {
    label: '备注',
    prop: 'remark',
    component: 'el-input',
    props: {
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder:"请输入备注",
    },
    md: 24,
  }
].map(r=>({...r,props:{...r.props,disabled:true}})));
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
  getFl({...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value}).then(res=>{
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
      addFl(form.value).then(res=>{
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
      updateFl(form.value.id,form.value).then(res=>{
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
    delFl(row.id).then(res=>{
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
  proxy.download("business/attBase/fxTeam/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`防汛队伍基础数据_${new Date().getTime()}.xlsx`);
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