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
        <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增
        </el-button>
        <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
      </template>
      <template #table-trainType="{ size, row, column, $index }">
        {{ formatterVal(row, 'training_classification', 'trainType') }}
      </template>
      <template #table-reportUnit="{ size, row, column, $index }">
        {{ formatVal(row.reportUnit) }}
      </template>
      <template #form-files>
        <AlUpload v-model:fileList="fileList"
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
          <template #form-files>
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
import {formatterVal, loopTree, treeToArray,checkSuffix} from '@/utils';
import {ref, reactive, onMounted, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {deptTreeSelect} from "@/api/system/user";
import {downloadFile, removeFile} from "@/api/tool/file";
import {getToken} from "@/utils/auth";
import {delTain, getTain, addTain, updateTain} from "@/api/org/tainlearn";

const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del: true,
  fixed: 'right',
  addText: '新增',
  detail: true,
  reset: false,
  width: '250',
  addProps: {
    type: 'primary',
    plain: true,
    icon: "Plus",
  },
  editProps: {
    link: true,
    type: 'primary',
    icon: 'Edit'
  },
  detailProps: {
    link: true,
    type: 'primary',
    icon: 'View'
  },
  delProps: {
    link: true,
    type: 'danger',
    icon: 'Delete'
  },
  searchResetProps: {
    icon: "Refresh",
  },
  searchProps: {
    type: 'primary',
    icon: "Search",
  },
  delText: '删除',
  editText: '修改',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
  detailText: '查看'
});
const detailMenu = defineCrudMenuColumns({
  submit: false,
  reset: true,
  resetText: '关闭'
});
const form = ref({filePath: ''});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let fileList = ref([]);
let department = ref([]);
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(() => [
  {
    label: '培训日期',
    prop: 'trainDate',
    component: 'el-date-picker',
    props: {
      clearable: true,
      type: 'daterange',
      style: {width: '100%'},
      placeholder: '请选择培训日期',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format': 'YYYY-MM-DD',
    },
    search: true,
  },
  {
    label: '培训标题',
    prop: 'trainTitle',
    component: 'el-input',
    props: {
      placeholder: '请培训标题',
    },
    search: true,
  },
  {
    label: '主办单位',
    prop: 'organizer',
  },
  {
    label: '培训分类',
    prop: 'trainType',
    component: 'pro-select',
    props: {
      clearable: true,
      data: dictStore.getDict('training_classification'),
      placeholder: '请选择培训分类',
    },
    search: true,
  },
  {
    label: '培训期数',
    prop: 'trainNum',
  },
  {
    label: '培训地点',
    prop: 'trainLocation',
  },
  {
    label: '填报单位',
    prop: 'reportUnit',
  },
  {
    label: '登记日期',
    prop: 'registerDate',
  }
]));
const formColumns = defineFormColumns(computed(() => [
  {
    label: '培训日期',
    prop: 'trainDate',
    component: 'el-date-picker',
    props: {
      clearable: true,
      type: 'date',
      style: {width: '100%'},
      placeholder: '请选择培训日期',
      'value-format': 'YYYY-MM-DD',
    },
    rules: [{required: true, message: '请选择培训日期'}],
    md: 12
  },
  {
    label: '登记日期',
    prop: 'registerDate',
    component: 'el-date-picker',
    props: {
      clearable: true,
      type: 'date',
      style: {width: '100%'},
      placeholder: '请选择登记日期',
      'value-format': 'YYYY-MM-DD',
    },
    rules: [{required: true, message: '请选择登记日期'}],
    md: 12
  },
  {
    label: '培训标题',
    prop: 'trainTitle',
    component: 'el-input',
    props: {
      style: {width: '100%'},
      placeholder: '请输入培训标题',
    },
    rules: [{required: true, message: '请输入标题'}],
    md: 12
  },
  {
    label: '主办单位',
    prop: 'organizer',
    component: 'el-input',
    props: {
      placeholder: '请输入主办单位',
    },
    rules: [{required: true, message: '请输入主办单位'}],
    md: 12
  },
  {
    label: '培训分类',
    prop: 'trainType',
    component: 'pro-select',
    props: {
      clearable: true,
      data: dictStore.getDict('training_classification'),
      style: {width: '100%'},
      placeholder: '请选择培训分类',
    },
    rules: [{required: true, message: '请选择培训分类'}],
    md: 12
  },
  {
    label: '培训地点',
    prop: 'trainLocation',
    component: 'el-input',
    props: {
      placeholder: '请输入培训地点',
    },
    rules: [{required: true, message: '请输入培训地点'}],
    md: 12
  },
  {
    label: '培训开始时段',
    prop: 'startTrainingPeriod',
    component: 'el-date-picker',
    props: {
      clearable: true,
      type: 'datetime',
      style: {width: '100%'},
      placeholder: '请选择培训开始时段',
      format: 'YYYY-MM-DD HH:mm',
      'value-format': 'YYYY-MM-DD HH:00',
    },
    md: 12
  },
  {
    label: '培训结束时段',
    prop: 'endTrainingPeriod',
    component: 'el-date-picker',
    props: {
      clearable: true,
      type: 'datetime',
      style: {width: '100%'},
      placeholder: '请选择培训结束时段',
      format: 'YYYY-MM-DD HH:mm',
      'value-format': 'YYYY-MM-DD HH:00',
    },
    md: 12
  },
  {
    label: '填报单位',
    prop: 'reportUnit',
    component: 'el-tree-select',
    props: {
      data: department.value,
      placeholder: '请选择填报单位',
      'default-expand-all': true,
      clearable: true,
      checkStrictly: true,
      style: {width: '100%'},
      config: {value: 'id', label: 'label'},
    },
    rules: [{required: true, message: '请选择填报单位'}],
    md: 12
  },
  {
    label: '培训人数',
    prop: 'trainPeopleNum',
    component: 'el-input',
    props: {
      placeholder: '请输入培训人数',
    },
    md: 12
  },
  {
    label: '培训期数',
    prop: 'trainNum',
    component: 'el-input',
    props: {
      placeholder: '请输入培训期数',
    },
    md: 12
  },
  {
    label: '培训范围',
    prop: 'trainRange',
    component: 'el-input',
    props: {
      placeholder: '请输入培训范围',
    },
    md: 12
  },
  {
    label: '培训内容',
    prop: 'trainContent',
    component: 'el-input',
    rules: [{required: true, message: '请输入培训内容'}],
    props: {
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入培训内容',
    },
    md: 24
  },
  {
    label: '附件',
    prop: 'files',
    md: 24
  },
]));
const detailColumns = defineFormColumns(computed(() => [
  {
    label: '培训日期',
    prop: 'trainDate',
    component: 'el-date-picker',
    props: {
      clearable: true,
      disabled: true,
      type: 'date',
      style: {width: '100%'},
      placeholder: '请选择培训日期',
      'value-format': 'YYYY-MM-DD',
    },
    rules: [{required: true, message: '请选择培训日期'}],
    md: 12
  },
  {
    label: '登记日期',
    prop: 'registerDate',
    component: 'el-date-picker',
    props: {
      clearable: true,
      disabled: true,
      type: 'date',
      style: {width: '100%'},
      placeholder: '请选择登记日期',
      'value-format': 'YYYY-MM-DD',
    },
    rules: [{required: true, message: '请选择登记日期'}],
    md: 12
  },
  {
    label: '培训标题',
    prop: 'trainTitle',
    component: 'el-input',
    props: {
      disabled: true,
      style: {width: '100%'},
      placeholder: '请输入培训标题',
    },
    rules: [{required: true, message: '请输入标题'}],
    md: 12
  },
  {
    label: '主办单位',
    prop: 'organizer',
    component: 'el-input',
    props: {
      disabled: true,
      placeholder: '请输入主办单位',
    },
    rules: [{required: true, message: '请输入主办单位'}],
    md: 12
  },
  {
    label: '培训分类',
    prop: 'trainType',
    component: 'pro-select',
    props: {
      clearable: true,
      disabled: true,
      data: dictStore.getDict('training_classification'),
      style: {width: '100%'},
      placeholder: '请选择培训分类',
    },
    rules: [{required: true, message: '请选择培训分类'}],
    md: 12
  },
  {
    label: '培训地点',
    prop: 'trainLocation',
    component: 'el-input',
    props: {
      disabled: true,
      placeholder: '请输入培训地点',
    },
    rules: [{required: true, message: '请输入培训地点'}],
    md: 12
  },
  {
    label: '培训开始时段',
    prop: 'startTrainingPeriod',
    component: 'el-date-picker',
    props: {
      clearable: true,
      disabled: true,
      type: 'datetime',
      style: {width: '100%'},
      placeholder: '请选择培训开始时段',
      format: 'YYYY-MM-DD HH:mm',
      'value-format': 'YYYY-MM-DD HH:00',
    },
    md: 12
  },
  {
    label: '培训结束时段',
    prop: 'endTrainingPeriod',
    component: 'el-date-picker',
    props: {
      clearable: true,
      disabled: true,
      type: 'datetime',
      style: {width: '100%'},
      placeholder: '请选择培训结束时段',
      format: 'YYYY-MM-DD HH:mm',
      'value-format': 'YYYY-MM-DD HH:00',
    },
    md: 12
  },
  {
    label: '填报单位',
    prop: 'reportUnit',
    component: 'el-tree-select',
    props: {
      disabled: true,
      clearable: true,
      data: department.value,
      placeholder: '请选择填报单位',
      'default-expand-all': true,
      style: {width: '100%'},
      checkStrictly: true,
      config: {value: 'id', label: 'label'},
    },
    rules: [{required: true, message: '请选择填报单位'}],
    md: 12
  },
  {
    label: '培训人数',
    prop: 'trainPeopleNum',
    component: 'el-input',
    props: {
      disabled: true,
      placeholder: '请输入培训人数',
    },
    md: 12
  },
  {
    label: '培训期数',
    prop: 'trainNum',
    component: 'el-input',
    props: {
      disabled: true,
      placeholder: '请输入培训期数',
    },
    md: 12
  },
  {
    label: '培训范围',
    prop: 'trainRange',
    component: 'el-input',
    props: {
      disabled: true,
      placeholder: '请输入培训范围',
    },
    md: 12
  },
  {
    label: '培训内容',
    prop: 'trainContent',
    component: 'el-input',
    rules: [{required: true, message: '请输入培训内容'}],
    props: {
      disabled: true,
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入培训内容',
    },
    md: 24
  },
  {
    label: '附件',
    prop: 'files',
    md: 24
  },
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.files
    form.value = {...row};
  } else {
    fileList.value = []
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

const formatVal = (row) => {
  return row ? treeToArray(department.value).find(r => r.id == row)?.label : ''
}

onMounted(() => {
  getData()
  deptTreeSelect().then(res => {
    if (res.code) {
      department.value = loopTree(res.data);
    }
  })
})

const getData = () => {
  getTain({
    ...serachForm.value,
    startTime: serachForm.value.trainDate ? serachForm.value.trainDate[0] : '',
    endTime: serachForm.value.trainDate ? serachForm.value.trainDate[1] : '',
    trainDate: null,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  }).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.total;
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
      addTain({
        ...form.value,
        files: JSON.stringify(fileList.value)
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
      updateTain(form.value.id, {
        ...form.value,
        files: JSON.stringify(fileList.value)
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
    delTain(row.id).then(res => {
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
  proxy.download("/business/standard/trainRecords/page/export", {
    ...serachForm.value,
    startTime: serachForm.value.trainDate ? serachForm.value.trainDate[0] : '',
    endTime: serachForm.value.trainDate ? serachForm.value.trainDate[1] : '',
    trainDate: null,
    pageNum: currentPage.value, pageSize: pageSize.value
  }, `培训学习_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

</script>

<style scoped lang="scss">

</style>