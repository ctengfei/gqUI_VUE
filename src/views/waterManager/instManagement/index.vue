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
        width="52%"
        align="center"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        label-width="120px"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
        @delete="deleteRow"
        @add="handleAdd"
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
      <template #search-applyName>
        <el-select
            v-model="serachForm.declare"
            filterable
            clearable
            placeholder="请选择所属用水申报"
        >
          <el-option
              v-for="item in declare"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </template>
<!--      <template #menu="{ size,row }">-->
<!--        <el-button :size="size" v-if="row.filePath && row.filePath !='[]'" type="success" link @click="handlePreview(row)">-->
<!--          <el-icon><View /></el-icon> 预览-->
<!--        </el-button>-->
<!--        <el-button :size="size" v-if="row.filePath && row.filePath !='[]'" type="success" link @click="handleDownload(row)">-->
<!--          <el-icon><Download /></el-icon>-->
<!--          下载-->
<!--        </el-button>-->
<!--      </template>-->
      <template #form-filePath>
        <AlUpload v-model:fileList="fileList"
                  limit="1"
                  accept=".pdf"
        />
      </template>
      <template #table-orderType="{ size, row, column, $index }">
        {{ formatterVal(row, 'YS_APPLY_TYPE', 'orderType') }}
      </template>
      <template #table-admDep="{ size, row, column, $index }">
        {{ formatVal(row.admDep) }}
      </template>
      <template #table-executionUnit="{ size, row, column, $index }">
        {{ formatVal(row.admDep) }}
      </template>
      <template #table-executionUser="{ size, row, column, $index }">
        {{ formatName(row.executionUser) }}
      </template>
      <template #table-userName="{ size, row, column, $index }">
        {{ formatName(row.userName) }}
      </template>
      <template #table-applyId="{ size, row, column, $index }">
        {{ foramtLin(row.applyId) }}
      </template>
      <template #crud-detail="{ props, columns, size }">
        <pro-form
            label-width="155px"
            v-model="form"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
        >
          <template #form-filePath>
            <AlUpload v-model:fileList="fileList"
                      limit="1"
                      :disabled="true"
                      accept=".pdf"
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
import {formatterVal, loopTree} from '@/utils';
import {ref, reactive, onMounted, onBeforeMount, nextTick, computed} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import { Download,View } from '@element-plus/icons-vue';
import dayjs from "dayjs";
import {addInst, delInst, getInst, getInstList, getTransfer, getUserList, updateInst} from "@/api/waterManager/instManagement";
import {getToken} from "@/utils/auth";
import {downloadFile, removeFile} from "@/api/tool/file";
import {deptTreeSelect, listUser} from "@/api/system/user";
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: true,
  reset: false,
  width: '330',
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
    icon:'Search'
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
const form = ref({filePath:'',orderCode:''});
const crudRef = ref();
const serachForm = ref({declare: null,tm:[]});
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let fileList = ref([]);
let declare = ref([]);
let userList = ref([]);
let department = ref([]);
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(()=>[
  {
    label: '所属用水申报',
    prop: 'applyId',
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      placeholder: '请选择所属用水申报',
      data: declare.value,
      filterable:true,
      clearable:true,
    },
    form: true,
    search: true,
  },
  {
    label: '调度令编号',
    prop: 'orderCode',
    component: 'el-input',
    props: {
      placeholder: '请输入调度令编号',
    },
    form: true,
    search: true,
  },
  {
    label: '指令下达单位',
    prop: 'admDep',
    component: 'el-tree-select',
    props: {
      'default-expand-all':true,
      checkStrictly: true,
      placeholder: '请选择指令下达单位',
      data:department.value,
      clearable:true,
      style: {width: '100%'},
      config:{value: 'id', label: 'label'}
    },
    search: true,
    form: true,
  },
  {
    label: '指令下达时间',
    prop: 'tm',
    component: 'el-date-picker',
    props: {
      type: 'datetimerange',
      clearable:true,
      'start-placeholder': "开始时间",
      'end-placeholder': "结束时间",
      'value-format': "YYYY-MM-DD HH:mm"
    },
    search: true,
    form: true,
  },
  {
    label: '指令下达人',
    prop: 'userName',
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      placeholder: '请选择指令下达人',
      data: userList.value,
      filterable:true,
      clearable:true,
    },
    search: true,
    form: true,
  },
  {
    label: '指令执行单位',
    prop: 'executionUnit',
    search: false,
    form: true,
  },
  {
    label: '指令执行人',
    prop: 'executionUser',
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      placeholder: '请选择指令执行人',
      data: userList.value,
      filterable:true,
      clearable:true,
    },
    search: true,
    form: true,
  },
  {
    label: '指令执行时间',
    prop: 'executionTm',
    search: false,
    form: true,
  },
  {
    label: '调度类型',
    prop: 'orderType',
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      data: dictStore.getDict('YS_APPLY_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择调度类型',
      clearable: true
    },
    search: true,
    form: true,
  },
  {
    label: '调度指令描述',
    prop: 'content',
    search: false,
    form: true,
    'tooltip-options':{
      visible:false
    },
    'show-overflow-tooltip':true
  },
  {
    label: '总水量(万m³)',
    prop: 'totalWater',
    search: false,
    form: true,
  },
]));
const formColumns = defineFormColumns(computed(() => [
  {
    label: '所属用水申报',
    prop: 'applyId',
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      placeholder: '请选择所属用水申报',
      data: declare.value,
      filterable:true,
      clearable:true,
    },
    rules: [{required: true, message: '请选择所属用水申报', trigger: 'change'}],
    md: 12,
  },
  {
    label: '调度令编号',
    prop: 'orderCode',
    component: 'el-input',
    rules: [{required: true, message: '请输入调度令编号'}],
    props: {
      placeholder: '请输入调度令编号',
    },
    md: 12,
  },
  {
    label: '指令下达人',
    prop: 'userName',
    rules: [{required: true, message: '请选择指令下达人', trigger: 'change'}],
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      onChange: (e)=>{
        const deptId = userList.value.find(r=>r.value == e)?.deptId
        form.value = {...form.value,admDep:deptId}
      },
      placeholder: '请选择指令下达人',
      data: userList.value,
      filterable:true,
      clearable:true,
    },
    md: 12,
  },
  {
    label: '指令下达单位',
    prop: 'admDep',
    component: 'el-tree-select',
    props: {
      'default-expand-all':true,
      checkStrictly: true,
      clearable:true,
      placeholder: '请选择指令下达单位',
      data:department.value,
      style: {width: '100%'},
      config:{value: 'id', label: 'label'}
    },
    rules: [{required: true, message: '请选择指令下达单位', trigger: 'change'}],
    md: 12,
  },
  {
    label: '指令下达时间',
    prop: 'tm',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择指令下达时间'}],
    props: {
      style: {width: '100%'},
      type: 'datetime',
      clearable:true,
      'placeholder': "下达时间",
      'value-format': "YYYY-MM-DD HH:mm"
    },
    md: 12,
  },
  {
    label: '指令执行人',
    prop: 'executionUser',
    rules: [{required: true, message: '请选择指令执行人'}],
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      placeholder: '请选择指令执行人',
      data: userList.value,
      filterable:true,
      clearable:true,
    },
    md: 12,
  },
  {
    label: '指令执行单位',
    prop: 'executionUnit',
    component: 'el-tree-select',
    props: {
      'default-expand-all':true,
      checkStrictly: true,
      placeholder: '请选择指令执行单位',
      data:department.value,
      clearable:true,
      style: {width: '100%'},
      config:{value: 'id', label: 'label'}
    },
    rules: [{required: true, message: '请选择指令执行单位'}],
    md: 12,
  },
  {
    label: '指令执行时间',
    prop: 'executionTm',
    component: 'el-date-picker',
    rules: [{required: true, message: '请输入指令执行时间'}],
    props: {
      type: 'datetime',
      clearable:true,
      style: {width: '100%'},
      placeholder: '指令执行时间',
      'value-format': "YYYY-MM-DD HH:mm"
    },
    md: 12,
  },
  {
    label: '调度类型',
    prop: 'orderType',
    component: 'pro-select',
    rules: [{required: true, message: '请选择调度类型'}],
    props: {
      style: {width: '100%'},
      data: dictStore.getDict('YS_APPLY_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择调度类型',
      clearable: true
    },
    md: 12,
  },
  {
    label: '总水量(万m³)',
    prop: 'totalWater',
    component: 'el-input',
    rules: [{required: true, message: '请输入总水量'}],
    props: {
      placeholder: '请输入总水量',
    },
    md: 12,
  },
  {
    label: '调度指令描述',
    prop: 'content',
    component: 'el-input',
    rules: [{required: true, message: '请输入调度指令描述'}],
    props: {
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入调度指令描述',
    },
    md: 24,
  },
  {
    label: '附件',
    prop: 'filePath',
    md: 24,
  }
]));
const detailColumns = defineFormColumns(computed(() => [
  {
    label: '所属用水申报',
    prop: 'applyId',
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      placeholder: '请选择所属用水申报',
      data: declare.value,
      filterable:true,
      disabled:true,
    },
    rules: [{required: true, message: '请选择所属用水申报', trigger: 'change'}],
    md: 12,
  },
  {
    label: '调度令编号',
    prop: 'orderCode',
    component: 'el-input',
    rules: [{required: true, message: '请输入调度令编号'}],
    props: {
      placeholder: '请输入调度令编号',
      disabled:true,
    },
    md: 12,
  },
  {
    label: '指令下达人',
    prop: 'userName',
    rules: [{required: true, message: '请选择指令下达人'}],
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      placeholder: '请选择指令下达人',
      data: userList.value,
      filterable:true,
      disabled:true,
    },
    md: 12,
  },
  {
    label: '指令下达单位',
    prop: 'admDep',
    component: 'el-tree-select',
    props: {
      disabled:true,
      'default-expand-all':true,
      checkStrictly: true,
      placeholder: '请选择指令下达单位',
      data:department.value,
      style: {width: '100%'},
      config:{value: 'id', label: 'label'}
    },
    rules: [{required: true, message: '请选择指令下达单位'}],
    md: 12,
  },
  {
    label: '指令下达时间',
    prop: 'tm',
    component: 'el-date-picker',
    rules: [{required: true, message: '请选择指令下达时间'}],
    props: {
      style: {width: '100%'},
      type: 'datetime',
      clearable:true,
      'placeholder': "下达时间",
      'value-format': "YYYY-MM-DD HH:mm",
      disabled:true,
    },
    md: 12,
  },
  {
    label: '指令执行单位',
    prop: 'executionUnit',
    component: 'el-tree-select',
    props: {
      disabled:true,
      'default-expand-all':true,
      checkStrictly: true,
      placeholder: '请选择指令执行单位',
      data:department.value,
      clearable:true,
      style: {width: '100%'},
      config:{value: 'id', label: 'label'}
    },
    rules: [{required: true, message: '请选择指令执行单位'}],
    md: 12,
  },
  {
    label: '指令执行人',
    prop: 'executionUser',
    rules: [{required: true, message: '请选择指令执行人'}],
    component: 'pro-select',
    props: {
      disabled:true,
      style: {width: '100%'},
      placeholder: '请选择指令执行人',
      data: userList.value,
      filterable:true,
    },
    md: 12,
  },
  {
    label: '指令执行时间',
    prop: 'executionTm',
    component: 'el-date-picker',
    rules: [{required: true, message: '请输入指令执行时间'}],
    props: {
      disabled:true,
      clearable:true,
      type: 'datetime',
      style: {width: '100%'},
      placeholder: '指令执行时间',
      'value-format': "YYYY-MM-DD HH:mm"
    },
    md: 12,
  },
  {
    label: '调度类型',
    prop: 'orderType',
    component: 'pro-select',
    rules: [{required: true, message: '请选择调度类型'}],
    props: {
      disabled:true,
      style: {width: '100%'},
      data: dictStore.getDict('YS_APPLY_TYPE'),
      config: {value: 'value', label: 'label'},
      placeholder: '请选择调度类型',
      clearable: true
    },
    md: 12,
  },
  {
    label: '总水量(万m³)',
    prop: 'totalWater',
    component: 'el-input',
    rules: [{required: true, message: '请输入总水量'}],
    props: {
      disabled:true,
      placeholder: '请输入总水量',
    },
    md: 12,
  },
  {
    label: '调度指令描述',
    prop: 'content',
    component: 'el-input',
    rules: [{required: true, message: '请输入调度指令描述'}],
    props: {
      disabled:true,
      autosize: {minRows: 2},
      type: 'textarea',
      placeholder: '请输入调度指令描述',
    },
    md: 24,
  },
  {
    label: '附件',
    prop: 'filePath',
    md: 24,
  }
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    fileList.value = row.filePath
    form.value = {...row};
  }else{
    fileList.value = []
    // 获取调令编号
    getTransfer().then(res=>{
      if(res.success){
        form.value = {...row, orderCode: res.data};
      }
    })
  }
  done();
});
const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

function treeToArray(tree) {
  let res = []
  for (const item of tree) {
    const { children, ...i } = item
    if (children && children.length) {
      res = res.concat(treeToArray(children))
    }
    res.push(i)
  }
  return res
}

const formatVal = (row) =>{
  return row ? treeToArray(department.value).find(r=> r.id == row)?.label : ''
}

const formatName=(row)=>{
return row ? userList.value.find(r=>r.value == row)?.label : ''
}

const foramtLin = (id) => {
  return id ? declare.value.find(r=>r.value == id)?.label : ''
}

const handlePreview = (row) => {
  const atta = JSON.parse(row.filePath)[0];
  window.open( `${import.meta.env.VITE_FILE_URL}${atta.url}`)
}

const handleDownload = (row) => {
  const atta = JSON.parse(row.filePath)[0];
  downloadFile(atta.id).then(res=>{
    const url = window.URL.createObjectURL(new Blob([res]))
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', atta.name)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}

onMounted(() => {
  getData();
  getInstList().then(res => {
    if (res.success) {
      nextTick(() => {
        declare.value = res.data.map(r => {
          return {
            label: `${r.applyName}-${formatterVal(r, 'MAIN_WAIN_USE', 'mainWainUse')}-${r.applyTime}`,
            value: r.id
          }
        });
      })
    }
  });
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
  getUserList().then(res=>{
    if(res.code == 200){
      userList.value = res.data.filter(r=> r.userId != 1).map(r=>({label:r.realName,value:r.userId,deptId:r.deptId}));
    }
  })
})

const getData = () => {
  getInst({
    ...serachForm.value,
    startTime:serachForm.value.tm.length ?serachForm.value.tm[0]:'',
    endTime:serachForm.value.tm.length ? serachForm.value.tm[1]:'',
    pageNum: currentPage.value,
    pageSize: pageSize.value
  }).then(res => {
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
      addInst({
        ...form.value,
        filePath: JSON.stringify(fileList.value)
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
      updateInst(form.value.id, {
        ...form.value,
        filePath: JSON.stringify(fileList.value)
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
    delInst(row.id).then(res => {
      if (res.success) {
        getData()
        if(row.filePath){
          const filePath = JSON.parse(row.filePath);
          filePath.forEach(r=>removeFile(r.id))
        }
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    });
  })
};

const exportData = () => {
  proxy.download("/business/waterUse/waterApplyDl/page/export", {
    ...serachForm.value,
    startTime:serachForm.value.tm.length ?serachForm.value.tm[0]:'',
    endTime:serachForm.value.tm.length ? serachForm.value.tm[1]:'',
    pageNum: currentPage.value, pageSize: pageSize.value
  }, `用水申报调度管理_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
</script>

<style scoped lang="scss">
:deep(.el-popper){
  display: none!important;
}
</style>