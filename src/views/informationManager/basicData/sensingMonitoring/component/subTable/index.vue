<template>
  <pro-crud
      ref="crudRef"
      v-model="form"
      v-model:search="serachForm"
      :columns="columns"
      :form-columns="formColumns"
      :gutter="20"
      :menu="menu"
      :data="data"
      :border="true"
      height="300px"
      column="2"
      width="40%"
      align="center"
      :append-to-body="true"
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
  </pro-crud>
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
import {formatterVal} from '@/utils';
import {ref, reactive, onMounted, defineProps, watch, defineEmits, defineExpose} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import {deleteSubSens, getSubSensList, updateSubSens} from "@/api/informationManager/basicData/sensingMonitoring";
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '新增',
  detail: false,
  reset: false,
  width: '150',
  addProps: {
    type: 'primary',
    plain: true,
  },
  editProps: {
    link: true,
    type: 'primary',
    icon: 'Edit'
  },
  delProps: {
    link: true,
    type: 'danger',
    icon: 'Delete'
  },
  delText: '删除',
  editText: '修改',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
});
const form = ref({});
const crudRef = ref();
const serachForm = ref({});
const props = defineProps(['currentRow']);
let data = ref([]);
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
  {
    label: '区域名称',
    prop: 'areaName',
    form: true,
    search: false,
  },
  {
    label: '农作物种类',
    prop: 'crop',
    form: true,
    search: false,
  },
  {
    label: '种植面积(k㎡)',
    prop: 'plantArea',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns([
  {
    label: '区域名称',
    prop: 'areaName',
    component: 'el-input',
    props: {
      placeholder: '请输入区域名称',
    },
    md: 12,
  },
  {
    label: '农作物种类',
    prop: 'crop',
    component: 'el-input',
    props: {
      placeholder: '请输入农作物种类',
    },
    md: 12,
  },
  {
    label: '种植面积(k㎡)',
    prop: 'plantArea',
    component: 'el-input',
    props: {
      placeholder: '请输入种植面积',
    },
    md: 12,
  },
]);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit') {
    form.value = {...row} || {};
  } else {
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

onMounted(()=>{
  getData();
})

const getData = () => {
  getSubSensList({mapId:props.currentRow.mapId}).then(res => {
    if (res.success) {
      data.value = res.data;
    }
  });
}

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (type == 'edit') {
    updateSubSens(form.value.id, form.value).then(res=>{
      if(res.success){
        ElMessage({
          message: '修改成功',
          type: 'success',
        });
        getData()
        close()
      }
    })
  }
  done()
});

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    deleteSubSens(row.id).then(res => {
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

defineExpose({
  getData,
})

</script>

<style scoped lang="scss">
:deep(.pro-form-menu){
  .el-form-item__content{
    justify-content: end!important;
    margin-right: 40px;
  }
}
</style>