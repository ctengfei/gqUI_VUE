<template>
  <el-dialog
      v-model="props.dialogVisible"
      title="选择指标"
      width="70%"
  >
    <pro-crud
        ref="crudRef"
        v-model="form"
        v-model:search="serachForm"
        :columns="columns"
        :gutter="20"
        :menu="menu"
        :data="data"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        layout="->,total,sizes,prev, pager, next, jumper"
        background
        draggable
        row-key="id"
        :page-sizes="[10,20,30,40,50]"
        :total="total"
        @load="load"
        column="2"
        :modal="false"
        :height="300"
        width="70%"
        selection
        align="center"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        label-width="155px"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
        @delete="deleteRow"
        @selection-change="selectChange"
    >
      <template #form-menu-right="{ size }">
        <el-button
            :size="size"
            @click="crudRef.closeDialog()"
        >
          关闭
        </el-button>
      </template>
      <template #table-examCategory="{ size, row, column, $index }">
        {{ formatterVal(row,'exam_category','examCategory') }}
      </template>
      <template #table-examObjType="{ size, row, column, $index }">
        {{ formatterVal(row,'examObjType','examObjType') }}
      </template>
    </pro-crud>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="close">
          确定
        </el-button>
        <el-button @click="close">关闭</el-button>
      </span>
    </template>
  </el-dialog>
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
import {ref, reactive, onMounted, defineEmits, defineProps, watch} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {addEvaluation, delEvaluation, getEvaluation, updateEvaluation} from "@/api/evaluationManager/metricsManager";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: false,
  reset: false,
  edit:false,
  del:false,
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
    component: 'pro-select',
    props: {
      data: dictStore.getDict('examObjType'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择考核对象类型',
      clearable:true
    },
    search: true,
  },
]);
const props = defineProps(['dialogVisible']);
const emit = defineEmits(['getMetricsData','update:dialogVisible']);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  done();
});


const beforeClose = defineCrudBeforeClose((done) => {
  done()
})

const close = ()=>{
  emit('update:dialogVisible',false);
}

// 获取评分细则表格
const getXTable = (pe) =>{
  XTable.value =pe
}

const selectChange = selection =>{
  emit('getMetricsData',selection.map(r=>({...r,indexId:r.id,id:null})))
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

    } else {

    }
  }
  done()
});

// 分页选择
const load = () => {
  getData();
}
</script>

<style scoped lang="scss">

</style>