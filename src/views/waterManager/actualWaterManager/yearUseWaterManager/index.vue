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
        :summary-method="getSummaries"
        show-summary
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
      <template #search-year>
        <a-range-picker v-model:value="serachForm.year" valueFormat="YYYY" :placeholder="['开始年份','结束年份']" picker="year" />
      </template>
      <template #search-menu-right="{ size }">
<!--        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>-->
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
<!--        <el-button type="success" plain icon="Upload" @click="dialogVisible = true">导入</el-button>-->
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
import {addActua, delActua, getActua, getYearStatistics, updateActua} from "@/api/waterManager/actualWaterManager";
import {getToken} from "@/utils/auth";
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(`${import.meta.env.VITE_APP_BASE_API}/business/waterUse/resInflowWreqMonth/importData`); // 上传文件服务器地址
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: true,
  edit:false,
  reset: false,
  del:false,
  width: '100',
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
const serachForm = ref({year:[dayjs().subtract(5,'year').format('YYYY'),dayjs().format('YYYY')]});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let dialogVisible = ref(false);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label:'时间',
    prop: 'year',
    search: true,
  },
  {
    label: '面雨量(mm)',
    prop: 'areaRainfall',
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
    label:'灌溉水量(万m³)',
    prop: 'irrigateEq',
  },
  {
    label:'城镇水量(万m³)',
    children:[
      {
        label:'大冶城镇水量(万m³)',
        prop: 'dyEq',
      },
      {
        label:'咸宁城镇水量(万m³)',
        prop: 'xnEq',
      },
      {
        label:'阳新城镇水量(万m³)',
        prop: 'yxEq',
      },
    ]
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
    label:'损失水量(万m³)',
    prop: 'lossEq',
    hide:true
  },
  {
    label:'点雨量(mm)',
    prop: 'pointRainfall',
    hide:true
  },
]);
const formColumns = defineFormColumns([]);
const detailColumns = defineFormColumns([
  {
    label:'时间',
    prop: 'year',
    component: 'el-input',
    md:12
  },
  {
    label: '面雨量(mm)',
    prop: 'areaRainfall',
    component: 'el-input',
    md:12
  },
  {
    label: '生态水量(万m³)',
    prop: 'ecoEq',
    component: 'el-input',
    md:12
  },
  {
    label: '发电水量(万m³)',
    prop: 'elecEq',
    component: 'el-input',
    md:12
  },
  {
    label: '泄洪水量(万m³)',
    prop: 'floodEq',
    component: 'el-input',
    md:12
  },
  {
    label:'灌溉水量(万m³)',
    prop: 'irrigateEq',
    component: 'el-input',
    md:12
  },
  {
    label:'大冶城镇水量(万m³)',
    prop: 'dyEq',
    component: 'el-input',
    md:12
  },
  {
    label:'咸宁城镇水量(万m³)',
    prop: 'xnEq',
    component: 'el-input',
    md:12
  },
  {
    label:'阳新城镇水量(万m³)',
    prop: 'yxEq',
    component: 'el-input',
    md:12
  },
  {
    label: '来水量(万m³)',
    prop: 'inflow',
    component: 'el-input',
    md:12
  },
  {
    label: '拦水量(万m³)',
    prop: 'interceptEq',
    component: 'el-input',
    md:12
  },
  {
    label:'库存增量',
    prop: 'invIncr',
    component: 'el-input',
    md:12
  },
  {
    label:'损失水量(万m³)',
    prop: 'lossEq',
    component: 'el-input',
    md:12
  },
  {
    label:'点雨量(mm)',
    prop: 'pointRainfall',
    component: 'el-input',
    md:12
  },
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

const getSummaries = (param) => {
  const { columns, data } = param
  const sums= []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (index === 10) {
      sums[index] = ''
      return
    }
    const values = data.map((item) => Number(item[column.property]))
    if (!values.every((value) => Number.isNaN(value))) {
      sums[index] = values.reduce((prev, curr) => {
        const value = parseFloat(curr)
        if (!Number.isNaN(value)) {
          return curr + prev
        } else {
          return prev
        }
      }, 0)
    } else {
      sums[index] = 0
    }
  });
  return sums.map((r,i)=> {
    if(r == '合计' || r == '') {
      return r
    }else{
      return r.toFixed(2)
    }
  })
}

onMounted(() => {
  getData()
})

const downloadTemp = () => {
  proxy.download("/business/waterUse/resInflowWreqMonth/importTemplate",{},`用水量模版.xlsx`);
}

const getData = () => {
  getYearStatistics({
    startYear:serachForm.value.year ? serachForm.value.year[0] : '',
    endYear:serachForm.value.year ? serachForm.value.year[1] : '',
  }).then(res => {
    if (res.success) {
      data.value = res.data;
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
    } else {
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
  proxy.download("/business/waterUse/resInflowWreqMonth/yearStatisticsExport", {
    startYear:serachForm.value.year ? serachForm.value.year[0] : '',
    endYear:serachForm.value.year ? serachForm.value.year[1] : '',
  },`年实际用水统计_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>