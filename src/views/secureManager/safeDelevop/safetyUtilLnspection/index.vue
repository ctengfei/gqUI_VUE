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
      <template #form-attachment>
        <AlUpload v-model:fileList="fileList"
                  accept=".pdf, .xlsx, .xls, .doc, .docx, .txt, .png, .jpg, .jpeg"
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
          <template #form-attachment>
            <AlUpload v-model:fileList="fileList"
                      :disabled="true"
                      accept=".pdf, .xlsx, .xls, .doc, .docx, .txt, .png, .jpg, .jpeg"
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
import {formatterVal, loopTree, treeToArray} from '@/utils';
import {ref, reactive, onMounted, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {
  deleteSecurityUntil,
  getSecurityUntil,
  postSecurityUntil,
  updateSecuritUntil
} from "@/api/secureManager/safetyUtilLnspection";
import {getUserList} from "@/api/waterManager/instManagement";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del: true,
  detail: true,
  fixed: 'right',
  addText: '新增',
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
const form = ref({filePath: []});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let fileList = ref([]);
let userList = ref([]);
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(() => [
  {
    label: '工具名称',
    prop: 'toolName',
    component: 'el-input',
    props: {
      placeholder: '请输入工具名称',
    },
    search: true,
  },
  {
    label: '检查时间',
    prop: 'checkTime',
  },
  {
    label: '检查结果',
    prop: 'checkResult',
  },
  {
    label: '检查人',
    prop: 'checkUserName',
  },
]));
const formColumns = defineFormColumns(computed(() => [
  {
    label: '工具名称',
    prop: 'toolName',
    component: 'el-input',
    rules: [{required: true, message: '请输入工具名称'}],
    props: {
      placeholder: '请输入工具名称',
    },
    md: 12
  },
  {
    label: '检查时间',
    prop: 'checkTime',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择检查时间'}],
    props: {
      clearable: true,
      placeholder: '请选择检查时间',
      type:'datetime',
      style: {width: '100%'},
      'value-format':'YYYY-MM-DD HH:mm:ss',
    },
    md: 12
  },
  {
    label: '检查结果',
    prop: 'checkResult',
    component: 'el-input',
    rules: [{required: true, message: '请输入检查结果'}],
    props:{
      placeholder:'请输入检查结果',
      autosize:{minRows:2},
      type:'textarea',
    },
    md: 24
  },
  {
    label: '检查人姓名',
    prop: 'checkUserId',
    component: 'pro-select',
    rules: [{required: true, message: '请选择检查人'}],
    props:{
      data:userList.value,
      filterable:true,
      config: {value: 'value', label: 'label'},
      clearable:true,
      placeholder:'请选择检查人',
    },
    md: 12
  },
  {
    label: '附件',
    prop: 'attachment',
    md: 24
  }
]));
const detailColumns = defineFormColumns(computed(() => [
  {
    label: '工具名称',
    prop: 'toolName',
    component: 'el-input',
    props: {
      disabled:true,
      placeholder: '请输入工具名称',
    },
    md: 12
  },
  {
    label: '检查时间',
    prop: 'checkTime',
    component: 'el-date-picker',
    props: {
      disabled:true,
      clearable: true,
      placeholder: '请选择检查时间',
      type:'datetime',
      style: {width: '100%'},
      'value-format':'YYYY-MM-DD HH:mm:ss',
    },
    md: 12
  },
  {
    label: '检查结果',
    prop: 'checkResult',
    component: 'el-input',
    props:{
      disabled:true,
      placeholder:'请输入检查结果',
      autosize:{minRows:2},
      type:'textarea',
    },
    md: 24
  },
  {
    label: '检查人姓名',
    prop: 'checkUserId',
    component: 'pro-select',
    rules: [{required: true, message: '请选择检查人'}],
    props:{
      data:userList.value,
      config: {value: 'value', label: 'label'},
      clearable:true,
      placeholder:'请选择检查人',
    },
    md: 24
  },
  {
    label: '附件',
    prop: 'attachment',
    md: 24
  }
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.attachment
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


onMounted(() => {
  getData()
  getUserList().then(res=>{
    if(res.code == 200){
      userList.value = res.data.map(r=>({label:r.realName,value:r.userId}));
    }
  })
})

const getData = () => {
  getSecurityUntil({
    ...serachForm.value,
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
    const name = userList.value.find(r=> r.value == form.value.checkUserId)
    if (type == 'add') {
      postSecurityUntil({
        ...form.value,
        checkUserName:name.label|| '',
        attachment: JSON.stringify(fileList.value),
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
      updateSecuritUntil(form.value.id, {
        ...form.value,
        checkUserName:name.label|| '',
        attachment: JSON.stringify(fileList.value),
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
    deleteSecurityUntil(row.id).then(res => {
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
  proxy.download("/business/standard/safetyTool/page/export", {
    ...serachForm.value,
    pageNum: currentPage.value, pageSize: pageSize.value
  }, `安全工具检查_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">

</style>