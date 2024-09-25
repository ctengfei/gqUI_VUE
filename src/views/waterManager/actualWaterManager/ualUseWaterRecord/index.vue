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
        <el-button type="success" plain icon="Upload" @click="dialogVisible = true">导入</el-button>
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
        title="导入"
        width="50%"
    >
      <div style="display: flex;justify-content: space-between;align-items: center">
        <span>仅支持表格文件上传，请按照模板示例数据填写:</span>
        <el-button type="primary" icon="Plus" @click="downloadTemp">获取模版</el-button>
      </div>
      <el-upload
          drag
          :headers="headers"
          multiple
          limit="5"
          style="margin-top: 20px"
          accept=".xlsx"
          :action="uploadFileUrl"
          :on-success="handleSuccess"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          单击或拖动文件到此区域进行上传
        </div>
      </el-upload>
      <template #footer>
      <span class="dialog-footer">
        <el-button  type="primary" @click="dialogVisible = false">确定</el-button>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
      </template>
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
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {addActua, delActua, getActua, updateActua} from "@/api/waterManager/actualWaterManager";
import {getToken} from "@/utils/auth";
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(`${import.meta.env.VITE_APP_BASE_API}/business/waterUse/resInflowWreqMonth/importData`); // 上传文件服务器地址
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
let dialogVisible = ref(false);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
//最外层表格配置
const columns = defineCrudColumns([
  {
    label:'时间',
    prop: 'yearMonth',
  },
  {
    label: '面雨量(mm)',
    prop: 'areaRainfall',
    hide:true
  },
  {
    label: '库容(万m³)',
    prop: 'cal',
  },
  {
    label: '生态水量(万m³)',
    prop: 'ecoEq',
  },
  {
    label: '发电水量(万m³)',
    prop: 'elecEq',
  },
  {
    label: '泄洪水量(万m³)',
    prop: 'floodEq',
  },
  {
    label:'城镇水量(万m³)',
    prop: 'townEq',
  },
  {
    label: '来水量(万m³)',
    prop: 'inflow',
  },
  {
    label: '拦水量(万m³)',
    prop: 'interceptEq',
    hide:true
  },
  {
    label:'库存增量',
    prop: 'invIncr',
    hide:true
  },
  {
    label:'灌溉水量(万m³)',
    prop: 'irrigateEq',
  },
  {
    label:'上月末库容(万m³)',
    prop: 'lastMonthCal',
    hide:true
  },
  {
    label:'上月末水位(m)',
    prop: 'lastMonthRz',
    hide:true
  },
  {
    label:'损失水量(万m³)',
    prop: 'lossEq',
    hide:true
  },
  {
    label:'点雨量(mm)',
    prop: 'pointRainfall',
    hide:true
  },
  {
    label:'水位(m)',
    prop: 'rz',
  },
  {
    label:'时间',
    prop: 'year',
    component:'el-date-picker',
    hide:true,
    props:{
      type:'year',
      style:{width:'100%'},
      clearable:true,
      'value-format':"YYYY",
      placeholder: '请选择时间',
    },
    search:true,
  },
  {
    label:'备注',
    prop: 'remark',
    search: false,
    form: true,
  },
]);

//新增内弹窗
const formColumns = defineFormColumns([
  {
    label:'时间',
    prop: 'yearMonth',
    component:'el-date-picker',
    props:{
      type:'month',
      style:{width:'100%'},
      clearable:true,
      'value-format':"YYYY-MM",
      placeholder: '请选择时间',
    },
    md:12
  },
  {
    label: '面雨量(mm)',
    prop: 'areaRainfall',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入面雨量',
    },
    md:12
  },
  {
    label: '库容(万m³)',
    prop: 'cal',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入库容',
    },
    md:12
  },
  {
    label: '生态水量(万m³)',
    prop: 'ecoEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入生态水量',
    },
    md:12
  },
  {
    label: '发电水量(万m³)',
    prop: 'elecEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入发电水量',
    },
    md:12
  },
  {
    label: '泄洪水量(万m³)',
    prop: 'floodEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入泄洪水量',
    },
    md:12
  },
  {
    label:'城镇水量(万m³)',
    prop: 'townEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入城镇水量',
    },
    md:12
  },
  {
    label: '来水量(万m³)',
    prop: 'inflow',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入来水量',
    },
    md:12
  },
  {
    label: '拦水量(万m³)',
    prop: 'interceptEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入拦水量',
    },
    md:12
  },
  {
    label:'库存增量',
    prop: 'invIncr',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入库存增量',
    },
    md:12
  },
  {
    label:'灌溉水量(万m³)',
    prop: 'irrigateEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入灌溉水量',
    },
    md:12
  },
  {
    label:'上月末库容(万m³)',
    prop: 'lastMonthCal',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入上月末库容',
    },
    md:12
  },
  {
    label:'上月末水位(m)',
    prop: 'lastMonthRz',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入上月末水位',
    },
    md:12
  },
  {
    label:'损失水量(万m³)',
    prop: 'lossEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入损失水量',
    },
    md:12
  },
  {
    label:'点雨量(mm)',
    prop: 'pointRainfall',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入点雨量',
    },
    md:12
  },
  {
    label:'水位(m)',
    prop: 'rz',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入水位',
    },
    md:12
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
//操作查看内
const detailColumns = defineFormColumns([
  {
    label:'时间',
    prop: 'yearMonth',
    component:'el-date-picker',
    props:{
      type:'month',
      style:{width:'100%'},
      clearable:true,
      'value-format':"YYYY-MM",
      placeholder: '请选择时间',
    },
    md:12
  },
  {
    label: '面雨量(mm)',
    prop: 'areaRainfall',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入面雨量',
    },
    md:12
  },
  {
    label: '库容(万m³)',
    prop: 'cal',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入库容',
    },
    md:12
  },
  {
    label: '生态水量(万m³)',
    prop: 'ecoEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入生态水量',
    },
    md:12
  },
  {
    label: '发电水量(万m³)',
    prop: 'elecEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入发电水量',
    },
    md:12
  },
  {
    label: '泄洪水量(万m³)',
    prop: 'floodEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入泄洪水量',
    },
    md:12
  },
  {
    label:'城镇水量(万m³)',
    prop: 'townEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入城镇水量',
    },
    md:12
  },
  {
    label: '来水量(万m³)',
    prop: 'inflow',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入来水量',
    },
    md:12
  },
  {
    label: '拦水量(万m³)',
    prop: 'interceptEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入拦水量',
    },
    md:12
  },
  {
    label:'库存增量',
    prop: 'invIncr',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入库存增量',
    },
    md:12
  },
  {
    label:'灌溉水量(万m³)',
    prop: 'irrigateEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入灌溉水量',
    },
    md:12
  },
  {
    label:'上月末库容(万m³)',
    prop: 'lastMonthCal',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入上月末库容',
    },
    md:12
  },
  {
    label:'上月末水位(m)',
    prop: 'lastMonthRz',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入上月末水位',
    },
    md:12
  },
  {
    label:'损失水量(万m³)',
    prop: 'lossEq',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入损失水量',
    },
    md:12
  },
  {
    label:'点雨量(mm)',
    prop: 'pointRainfall',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入点雨量',
    },
    md:12
  },
  {
    label:'水位(m)',
    prop: 'rz',
    component:'el-input-number',
    props:{
      style:{width:'100%'},
      placeholder: '请输入水位',
    },
    md:12
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

watch(dialogVisible,(dia)=>{
  if(!dia){
    getData();
  }
})

onMounted(() => {
  getData()
})

const downloadTemp = () => {
  proxy.download("/business/waterUse/resInflowWreqMonth/importTemplate",{},`用水量模版.xlsx`);
}

const getData = () => {
  getActua({...serachForm.value,pageNum: currentPage.value, pageSize: pageSize.value}).then(res => {
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
      addActua({...form.value}).then(res => {
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
      updateActua(form.value.id, form.value).then(res => {
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
    delActua(row.id).then(res => {
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
  proxy.download("/business/waterUse/resInflowWreqMonth/page/export\n", {
    ...serachForm.value,pageNum:currentPage.value,pageSize:pageSize.value
  },`实际用水记录_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>