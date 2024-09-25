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
      <template #table-engStat="{ size, row, column, $index }">
        {{ formatterVal(row,'ENG_STAT','engStat') }}
      </template>
      <template #table-flumPatt="{ size, row, column, $index }">
        {{ formatterVal(row,'FLUM_PATT','flumPatt') }}
      </template>
      <template #table-flumSecPatt="{ size, row, column, $index }">
        {{ formatterVal(row,'FLUM_SEC_PATT','flumSecPatt') }}
      </template>
      <template #table-suppType="{ size, row, column, $index }">
        {{ formatterVal(row,'SUPP_TYPE','suppType') }}
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
import {addAqu, delAqu, exportAquExcel, getAqu, updateAqu} from "@/api/informationManager/basicData/aqueductBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
import {getCanList} from "@/api/informationManager/basicData/canalBasicData";
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
let channelList = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '渡槽代码',
    prop: 'flumCode',
    component: 'el-input',
    props: {
      placeholder: '请输入渡槽代码',
    },
    form: true,
    search: true,
  },
  {
    label: '渡槽名称',
    prop: 'flumName',
    component: 'el-input',
    props: {
      placeholder: '请输入渡槽名称',
    },
    form: true,
    search: true,
  },
  {
    label: '经度',
    prop: 'startLong',
    search: false,
    form: true,
  },
  {
    label: '纬度',
    prop: 'startLat',
    search: false,
    form: true,
  },
  {
    label: '所在位置',
    prop: 'flumLoc',
    search: false,
    form: true,
  },
  {
    label:'过水能力(m³/s)',
    prop: 'flumWatProp',
    search: false,
    form: true,
  },
  {
    label:'渡槽形式',
    prop: 'flumPatt',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('FLUM_PATT'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择渡槽形式',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'断面形式',
    prop: 'flumSecPatt',
    component: 'pro-select',
    props:{
      data:dictStore.getDict('FLUM_SEC_PATT'), //
      config:{value: 'value', label: 'label'},
      placeholder:'请选择渡槽断面形式',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label:'跨河长度(m)',
    prop: 'crRvLen',
    search: false,
    form: true,
  },
  // {
  //   label:'支承形式',
  //   prop: 'suppType',
  //   component: 'pro-select',
  //   props:{
  //     data:dictStore.getDict('SUPP_TYPE'),
  //     config:{value: 'value', label: 'label'},
  //     placeholder:'请选择支承形式',
  //     clearable:true
  //   },
  //   search: true,
  //   form: true,
  // },
  {
    label:'支承孔数（孔）',
    prop: 'suppOrifNum',
    search: false,
    form: true,
  },
  {
    label:'尺寸-长度(m)',
    prop: 'sizeLength',
    search: false,
    form: true,
  },
  {
    label:'尺寸-宽(m)',
    prop: 'sizeWide',
    search: false,
    form: true,
  },
  {
    label:'尺寸-高度(m)',
    prop: 'sizeHeight',
    search: false,
    form: true,
  },
  {
    label:'管理单位',
    prop: 'admDep',
    search: false,
    form: true,
  },
  // {
  //   label:'工程建设情况',
  //   prop: 'engStat',
  //   search: false,
  //   form: true,
  // },
  // {
  //   label:'开工时间',
  //   prop: 'startDate',
  //   search: false,
  //   form: true,
  // },
  // {
  //   label:'建成时间',
  //   prop: 'endDate',
  //   search: false,
  //   form: true,
  // },
  {
    label:'备注',
    prop: 'remark',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '渡槽代码',
    prop: 'flumCode',
    component: 'el-input',
    props: {
      disabled:!!(form.value?.flumCode),
      placeholder: '请输入渡槽代码',
    },
    rules:[{ required: true, message: '请输入渡槽代码' }],
    md: 12,
  },
  {
    label: '渡槽名称',
    prop: 'flumName',
    component: 'el-input',
    props: {
      placeholder: '请输入渡槽名称',
    },
    rules:[{ required: true, message: '请输入渡槽名称' }],
    md: 12,
  },
  {
    label: '起点经度',
    prop: 'startLong',
    component: 'el-input',
    props: {
      placeholder: '请输入起点经度',
    },
    rules:[{ required: true, message: '请输入起点经度' }],
    md: 12,
  },
  {
    label: '起点纬度',
    prop: 'startLat',
    component: 'el-input',
    props: {
      placeholder: '请输入起点纬度',
    },
    rules:[{ required: true, message: '请输入起点纬度' }],
    md: 12,
  },
  {
    label: '终点经度',
    prop: 'endLong',
    component: 'el-input',
    props: {
      placeholder: '请输入终点经度',
    },
    md: 12,
  },
  {
    label: '终点纬度',
    prop: 'endLat',
    component: 'el-input',
    props: {
      placeholder: '请输入终点纬度',
    },
    md: 12,
  },
  {
    label: '所属渠道',
    prop: 'chanCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属渠道' }],
    props: {
      style:{width:'100%'},
      data: channelList.value,
      placeholder: '请选择所属渠道',
      clearable:true
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'flumLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label:'渡槽过水能力(m³/s)',
    prop: 'flumWatProp',
    component: 'el-input',
    props: {
      placeholder: '请输入渡槽过水能力',
    },
    md: 12,
  },
  {
    label:'渡槽形式',
    prop: 'flumPatt',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择渡槽形式' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('FLUM_PATT'), //
      config:{value: 'value', label: 'label'},
      placeholder:'请选择渡槽形式',
      clearable:true
    },
    md: 12,
  },
  {
    label:'渡槽断面形式',
    prop: 'flumSecPatt',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择渡槽断面形式' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('FLUM_SEC_PATT'), //
      config:{value: 'value', label: 'label'},
      placeholder:'请选择渡槽断面形式',
      clearable:true
    },
    md: 12,
  },
  {
    label:'跨河长度(m)',
    prop: 'crRvLen',
    component: 'el-input',
    props: {
      placeholder: '请输入跨河长度',
    },
    md: 12,
  },
  {
    label:'支承形式',
    prop: 'suppType',
    component: 'pro-select',
    rules:[{ required: true, message: '请输入渡槽代码' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('SUPP_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择支承形式',
      clearable:true
    },
    md: 12,
  },
  {
    label:'支承孔数（孔）',
    prop: 'suppOrifNum',
    component: 'el-input',
    props: {
      placeholder: '请输入支承孔数',
    },
    md: 12,
  },
  {
    label:'尺寸-长度(m)',
    prop: 'sizeLength',
    component: 'el-input',
    props: {
      placeholder: '请输入长度',
    },
    md: 12,
  },
  {
    label:'尺寸-宽(m)',
    prop: 'sizeWide',
    component: 'el-input',
    props: {
      placeholder: '请输入宽',
    },
    md: 12,
  },
  {
    label:'尺寸-高度(m)',
    prop: 'sizeHeight',
    component: 'el-input',
    props: {
      placeholder: '请输入高度',
    },
    md: 12,
  },
  {
    label:'起始桩号',
    prop: 'startBnch',
    component: 'el-input',
    props: {
      placeholder: '请输入桩号',
    },
    md: 12,
  },
  {
    label:'结束桩号',
    prop: 'endBnch',
    component: 'el-input',
    props: {
      placeholder: '请输入桩号',
    },
    md: 12,
  },
  {
    label:'管理单位',
    prop: 'admDep',
    component: 'el-input',
    props: {
      placeholder: '请输入管理单位',
    },
    md: 12,
  },
  {
    label:'工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      placeholder:"请输入开工时间",
    },
    md: 12,
  },
  {
    label:'建成时间',
    prop: 'endDate',
    component: 'el-input',
    props: {
      placeholder:"请输入建成时间",
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
      placeholder:'请输入备注',
    },
    md: 24,
  },
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '渡槽代码',
    prop: 'flumCode',
    component: 'el-input',
    props: {
      placeholder: '请输入渡槽代码',
    },
    rules:[{ required: true, message: '请输入渡槽代码' }],
    md: 12,
  },
  {
    label: '渡槽名称',
    prop: 'flumName',
    component: 'el-input',
    props: {
      placeholder: '请输入渡槽名称',
    },
    rules:[{ required: true, message: '请输入渡槽名称' }],
    md: 12,
  },
  {
    label: '起点经度',
    prop: 'startLong',
    component: 'el-input',
    props: {
      placeholder: '请输入起点经度',
    },
    rules:[{ required: true, message: '请输入起点经度' }],
    md: 12,
  },
  {
    label: '起点纬度',
    prop: 'startLat',
    component: 'el-input',
    props: {
      placeholder: '请输入起点纬度',
    },
    rules:[{ required: true, message: '请输入起点纬度' }],
    md: 12,
  },
  {
    label: '终点经度',
    prop: 'endLong',
    component: 'el-input',
    props: {
      placeholder: '请输入终点经度',
    },
    rules:[{ required: true, message: '请输入终点经度' }],
    md: 12,
  },
  {
    label: '终点纬度',
    prop: 'endLat',
    component: 'el-input',
    props: {
      placeholder: '请输入终点纬度',
    },
    rules:[{ required: true, message: '请输入终点纬度' }],
    md: 12,
  },
  {
    label: '所属渠道',
    prop: 'chanCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属渠道' }],
    props: {
      style:{width:'100%'},
      data: channelList.value,
      placeholder: '请选择所属渠道',
      clearable:true
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'flumLoc',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 12,
  },
  {
    label:'渡槽过水能力(m³/s)',
    prop: 'flumWatProp',
    component: 'el-input',
    props: {
      placeholder: '请输入渡槽过水能力',
    },
    md: 12,
  },
  {
    label:'渡槽形式',
    prop: 'flumPatt',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择渡槽形式' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('FLUM_PATT'), //
      config:{value: 'value', label: 'label'},
      placeholder:'请选择渡槽形式',
      clearable:true
    },
    md: 12,
  },
  {
    label:'渡槽断面形式',
    prop: 'flumSecPatt',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择渡槽断面形式' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('FLUM_SEC_PATT'), //
      config:{value: 'value', label: 'label'},
      placeholder:'请选择渡槽断面形式',
      clearable:true
    },
    md: 12,
  },
  {
    label:'跨河长度(m)',
    prop: 'crRvLen',
    component: 'el-input',
    props: {
      placeholder: '请输入跨河长度',
    },
    md: 12,
  },
  {
    label:'支承形式',
    prop: 'suppType',
    component: 'pro-select',
    rules:[{ required: true, message: '请输入渡槽代码' }],
    props:{
      style:{width:'100%'},
      data:dictStore.getDict('SUPP_TYPE'),
      config:{value: 'value', label: 'label'},
      placeholder:'请选择支承形式',
      clearable:true
    },
    md: 12,
  },
  {
    label:'支承孔数（孔）',
    prop: 'suppOrifNum',
    component: 'el-input',
    props: {
      placeholder: '请输入支承孔数',
    },
    md: 12,
  },
  {
    label:'尺寸-长度(m)',
    prop: 'sizeLength',
    component: 'el-input',
    props: {
      placeholder: '请输入长度',
    },
    md: 12,
  },
  {
    label:'尺寸-宽(m)',
    prop: 'sizeWide',
    component: 'el-input',
    props: {
      placeholder: '请输入宽',
    },
    md: 12,
  },
  {
    label:'尺寸-高度(m)',
    prop: 'sizeHeight',
    component: 'el-input',
    props: {
      placeholder: '请输入高度',
    },
    md: 12,
  },
  {
    label:'起始桩号',
    prop: 'startBnch',
    component: 'el-input',
    props: {
      placeholder: '请输入桩号',
    },
    md: 12,
  },
  {
    label:'结束桩号',
    prop: 'endBnch',
    component: 'el-input',
    props: {
      placeholder: '请输入桩号',
    },
    md: 12,
  },
  {
    label:'管理单位',
    prop: 'admDep',
    component: 'el-input',
    props: {
      placeholder: '请输入管理单位',
    },
    md: 12,
  },
  {
    label:'工程建设情况',
    prop: 'engStat',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('ENG_STAT'), // ENG_STAT.value
      config: {value: 'value', label: 'label'},
      placeholder: '请选择工程建设情况',
      clearable:true
    },
    md: 12,
  },
  {
    label:'开工时间',
    prop: 'startDate',
    component: 'el-input',
    props: {
      placeholder:"请输入开工时间",
    },
    md: 12,
  },
  {
    label:'建成时间',
    prop: 'endDate',
    component: 'el-input',
    props: {
      placeholder:"请输入建成时间",
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
      placeholder:'请输入备注',
    },
    md: 24,
  },
].map(r=>({...r,props:{...r.props,disabled:true}}))));
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
})

onMounted(() => {
  getData();
  getCanList().then(res=>{
    if(res.success){
      channelList.value = res.data.map(r=>({label:r.chanName,value:r.chanCode}));
    }
  })
})

const getData = () => {
  getAqu({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  });
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
    if (type == 'add'){
      addAqu({...form.value}).then(res => {
        if (res.success) {
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    }else{
      updateAqu(form.value.flumCode, form.value).then(res => {
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
  done();
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
    delAqu(row.flumCode).then(res => {
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
  proxy.download("business/base/flumBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`渡槽基础数据_${new Date().getTime()}.xlsx`);
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