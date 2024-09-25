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
      <template #search-menu-right="{ size }">
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
      <template #table-examCategory="{ size, row, column, $index }">
        {{ formatterVal(row,'exam_category','examCategory') }}
      </template>
      <template #table-examObjType="{ size, row, column, $index }">
        {{ formatterVal(row,'examObjType','examObjType') }}
      </template>
      <template #form>
        <scoringTable  @getXTable="getXTable" :scoringId="scoringId" :form_type="form_type" />
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        >
          <scoringTable  @getXTable="getXTable" :scoringId="scoringId" :form_type="form_type" />
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
import { formatterVal } from '@/utils';
import {ref, reactive, onMounted} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import scoringTable from './components/scoringTable';
import {addDng, delDng, exportDngExcel, getDng, updateDng} from "@/api/informationManager/basicData/dngBasicData";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {addEvaluation, delEvaluation, getEvaluation, updateEvaluation} from "@/api/evaluationManager/metricsManager";
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
let XTable = ref([]);
let scoringId = ref();
let form_type = ref(''); // 编辑 新增 查看
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '指标编号',
    prop: 'indexCode',
    component: 'el-input',
    props: {
      placeholder: '请输入指标编号',
    },
    search: true,
  },
  {
    label: '指标名称',
    prop: 'indexName',
    component: 'el-input',
    props: {
      placeholder: '请输入指标名称',
    },
    search: true,
  },
  {
    label: '考核类目',
    prop: 'examCategory',
    component: 'pro-select',
    props: {
      data: dictStore.getDict('exam_category'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核类目',
      clearable:true
    },
    search: true,
  },
  {
    label: '考核对象类型',
    prop: 'examObjType',
  },
  {
    label:'备注',
    prop: 'remark',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns([
  {
    label: '指标编号',
    prop: 'indexCode',
    component: 'el-input',
    props: {
      placeholder: '请输入指标编号',
    },
    rules:[{ required: true, message: '请输入指标编号' }],
    md:12,
    form: true,
  },
  {
    label: '指标名称',
    prop: 'indexName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入指标名称' }],
    props: {
      placeholder: '请输入指标名称',
    },
    md:12,
    form: true,
  },
  {
    label: '考核类目',
    prop: 'examCategory',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('exam_category'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核类目',
      clearable:true
    },
    rules:[{ required: true, message: '请选择考核类目' }],
    md:12,
    form: true,
  },
  {
    label: '考核对象类型',
    prop: 'examObjType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择考核对象类型' }],
    props: {
      disabled:true,
      style:{width:'100%'},
      data: dictStore.getDict('examObjType'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核对象类型',
      clearable:true
    },
    md:12,
    form: true,
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
  }
]);
const detailColumns = defineFormColumns([
  {
    label: '指标编号',
    prop: 'indexCode',
    component: 'el-input',
    props: {
      placeholder: '请输入指标编号',
    },
    rules:[{ required: true, message: '请输入指标编号' }],
    md:12,
    form: true,
  },
  {
    label: '指标名称',
    prop: 'indexName',
    component: 'el-input',
    rules:[{ required: true, message: '请输入指标名称' }],
    props: {
      placeholder: '请输入指标名称',
    },
    md:12,
    form: true,
  },
  {
    label: '考核类目',
    prop: 'examCategory',
    component: 'pro-select',
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('exam_category'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核类目',
      clearable:true
    },
    rules:[{ required: true, message: '请选择考核类目' }],
    md:12,
    form: true,
  },
  {
    label: '考核对象类型',
    prop: 'examObjType',
    component: 'pro-select',
    rules:[{ required: true, message: '请选择考核对象类型' }],
    props: {
      style:{width:'100%'},
      data: dictStore.getDict('examObjType'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核对象类型',
      clearable:true
    },
    md:12,
    form: true,
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
  }
].map(r=>({...r,props:{...r.props,disabled:true}})));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  form_type.value = type;
  if (type === 'edit' || type === 'detail') {
    scoringId.value = row.id;
    form.value = {...row,examObjType:'1'} || {};
  } else {
    form.value = {
      examObjType:'1'
    };
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

// 获取评分细则表格
const getXTable = (pe) =>{
  XTable.value =pe
}

onMounted(() => {
  getData()
})

const getData = () => {
  getEvaluation({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
    const {tableData} =  XTable.value.getTableData(); // 评分
    if (type == 'add') {
      addEvaluation({
        ...form.value,
        indexDetail:tableData
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
      updateEvaluation(form.value.id, {
        ...form.value,
        indexDetail:tableData
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
    delEvaluation(row.id).then(res => {
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
  proxy.download("/business/standard/examIndex/page/export", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`考评指标管理_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>