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
      <template #table-chanType="{ size, row, column, $index }">
        {{ formatterVal(row, 'CHAN_TYPE', 'chanType') }}
      </template>
      <template #table-chanGrad="{ size, row, column, $index }">
        {{ formatterVal(row, 'CHAN_GRADE', 'chanGrad') }}
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
import {
  addCan,
  delCan,
  exportCanExcel,
  getCan,
  getCanList, getGqList,
  updateCan
} from "@/api/informationManager/basicData/canalBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
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
let gqList = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '渠道编码',
    prop: 'chanCode',
    component: 'el-input',
    props: {
      placeholder: '请输入渠道编码',
    },
    form: true,
    search: true,
  },
  {
    label: '渠道名称',
    prop: 'chanName',
    component: 'el-input',
    props: {
      placeholder: '请输入渠道名称',
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
    prop: 'chanLog',
    search: false,
    form: true,
  },
  {
    label: '渠道类别',
    prop: 'chanType',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('CHAN_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择渠道类别',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '渠道级别',
    prop: 'chanGrad',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('CHAN_GRADE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择渠道级别',
      clearable:true
    },
    search: true,
    form: true,
  },
  {
    label: '渠道长度(m)',
    prop: 'chanLen',
    search: false,
    form: true,
  },
  {
    label: '设计流量(m/s)',
    prop: 'desFlow',
    search: false,
    form: true,
  },
  {
    label: '管理单位',
    prop: 'deptId',
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
const formColumns = defineFormColumns(computed(()=>[
  {
    label: '渠道编码',
    prop: 'chanCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入渠道编码' }],
    props: {
      disabled:!!(form.value?.chanCode),
      placeholder: '请输入渠道编码',
    },
    md: 12,
  },
  {
    label: '渠道名称',
    prop: 'chanName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入渠道名称' }],
    props: {
      placeholder: '请输入渠道名称',
    },
    md: 12,
  },
  {
    label: '起点经度',
    prop: 'startLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入起点经度' }],
    props: {
      placeholder: '请输入起点经度',
    },
    md: 12,
  },
  {
    label: '起点纬度',
    prop: 'startLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入起点纬度' }],
    props: {
      placeholder: '请输入起点纬度',
    },
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
    label: '所属灌区',
    prop: 'irrCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属灌区' }],
    props: {
      style:{width:'100%'},
      data: gqList.value,
      placeholder: '请选择所属灌区',
      clearable:true
    },
    md: 12,
  },
  {
    label: '上级渠道',
    prop: 'spChanCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择上级渠道' }],
    props: {
      style:{width:'100%'},
      data: channelList.value,
      placeholder: '请选择上级渠道',
      clearable:true
    },
    md: 12,
  },
  {
    label: '渠道糙率',
    prop: 'roughness',
    component: 'el-input-number',
    props: {
      style:{width:'100%'},
      placeholder: '请输入渠道糙率',
      clearable:true
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'chanLog',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 24,
  },
  {
    label: '渠道类别',
    prop: 'chanType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择渠道类别' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('CHAN_TYPE'),
      placeholder: '请选择渠道类别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '渠道级别',
    prop: 'chanGrad',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择渠道级别' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('CHAN_GRADE'),
      placeholder: '请选择渠道级别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '渠道长度(m)',
    prop: 'chanLen',
    component: 'el-input',
    props: {
      placeholder: '请输入渠道长度',
    },
    md: 12,
  },
  {
    label: '设计流量(m/s)',
    prop: 'desFlow',
    component: 'el-input',
    props: {
      placeholder: '请输入设计流量',
    },
    md: 12,
  },
  {
    label: '管理单位',
    prop: 'deptId',
    component: 'el-input',
    props: {
      placeholder: '请输入管理单位',
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
]));
const detailColumns = defineFormColumns(computed(()=>[
  {
    label: '渠道编码',
    prop: 'chanCode',
    component: 'el-input',
    rules:[{ required: true, message: '请输入渠道编码' }],
    props: {
      placeholder: '请输入渠道编码',
    },
    md: 12,
  },
  {
    label: '渠道名称',
    prop: 'chanName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入渠道名称' }],
    props: {
      placeholder: '请输入渠道名称',
    },
    md: 12,
  },
  {
    label: '起点经度',
    prop: 'startLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入起点经度' }],
    props: {
      placeholder: '请输入起点经度',
    },
    md: 12,
  },
  {
    label: '起点纬度',
    prop: 'startLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入起点纬度' }],
    props: {
      placeholder: '请输入起点纬度',
    },
    md: 12,
  },
  {
    label: '终点经度',
    prop: 'endLong',
    component: 'el-input',
    rules:[{ required: true, message: '请输入终点经度' }],
    props: {
      placeholder: '请输入终点经度',
    },
    md: 12,
  },
  {
    label: '终点纬度',
    prop: 'endLat',
    component: 'el-input',
    rules:[{ required: true, message: '请输入终点纬度' }],
    props: {
      placeholder: '请输入终点纬度',
    },
    md: 12,
  },
  {
    label: '所属灌区',
    prop: 'irrCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择所属灌区' }],
    props: {
      style:{width:'100%'},
      data: gqList.value,
      placeholder: '请选择所属灌区',
      clearable:true
    },
    md: 12,
  },
  {
    label: '上级渠道',
    prop: 'spChanCode',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择上级渠道' }],
    props: {
      style:{width:'100%'},
      data: channelList.value,
      placeholder: '请选择上级渠道',
      clearable:true
    },
    md: 12,
  },
  {
    label: '渠道糙率',
    prop: 'roughness',
    component: 'el-input-number',
    rules:[{ required: true, message: '请输入渠道糙率' }],
    props: {
      style:{width:'100%'},
      placeholder: '请输入渠道糙率',
      clearable:true
    },
    md: 12,
  },
  {
    label: '所在位置',
    prop: 'chanLog',
    component: 'el-input',
    props: {
      placeholder: '请输入所在位置',
    },
    md: 24,
  },
  {
    label: '渠道类别',
    prop: 'chanType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择渠道类别' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('CHAN_TYPE'),
      placeholder: '请选择渠道类别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '渠道级别',
    prop: 'chanGrad',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择渠道级别' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('CHAN_GRADE'),
      placeholder: '请选择渠道级别',
      clearable:true
    },
    md: 12,
  },
  {
    label: '渠道长度',
    prop: 'chanLen',
    component: 'el-input',
    props: {
      placeholder: '请输入渠道长度',
    },
    md: 12,
  },
  {
    label: '设计流量',
    prop: 'desFlow',
    component: 'el-input',
    props: {
      placeholder: '请输入设计流量',
    },
    md: 12,
  },
  {
    label: '管理单位',
    prop: 'deptId',
    component: 'el-input',
    props: {
      placeholder: '请输入管理单位',
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
  getGqList().then(res=>{
    if(res.success){
      gqList.value = res.data.map(r=>({label:r.irrName,value:r.irrCode}))
    }
  })
})

const getData = () => {
  getCan({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      addCan({...form.value}).then(res => {
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
      updateCan(form.value.chanCode, form.value).then(res => {
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
    delCan(row.chanCode).then(res => {
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
  proxy.download("business/base/chanBase/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`渠道基础数据_${new Date().getTime()}.xlsx`);
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