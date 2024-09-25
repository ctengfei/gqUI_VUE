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
    <template #table-primage="{row}">
      {{ formatTisp(row.primage) }}
    </template>
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
import {ref, reactive, onMounted, defineProps, watch, defineEmits, computed,defineExpose} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import {
  delRemoteSenseMapPrimage, getRemoteSenseMapPrimageList, updateRemoteSenseMapPrimage,
} from "@/api/informationManager/basicData/sensingMonitoring";
const props = defineProps(['currentRow']);
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
let data = ref([]);
let options1 = ref([
  {label: '高', value: '1'},
  {label: '较高', value: '2'},
  {label: '中等', value: '3'},
  {label: '较低', value: '4'},
  {label: '低', value: '5'},
])
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns(computed(() => [
  {
    label: '含水量',
    prop: 'primage',
  },
  {
    label: '面积(km²)',
    prop: 'area',
  },
]));
const formColumns = defineFormColumns(computed(() => [
  {
    label: '含水量等级',
    prop: 'primage',
    component: 'pro-select',
    props: {
      style: {width: '100%'},
      data: options1.value,
      config: {value: 'value', label: 'label'},
      placeholder: '请选择含水量等级',
      clearable: true
    },
    md: 12,
  },
  {
    label: '面积(km²)',
    prop: 'area',
    component: 'el-input-number',
    props: {
      style: {width: '100%'},
      placeholder: '请输入面积',
    },
    md: 12,
  },
]));
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

const formatTisp = id => {
  return options1.value.find(r=>r.value == id)?.label
}


onMounted(()=>{
  getData();
})

const getData = () => {
  getRemoteSenseMapPrimageList({mapId:props.currentRow.id}).then(res=>{
    if(res.success){
      data.value = res.data;
    }
  })
}

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (type == 'edit') {
    updateRemoteSenseMapPrimage(form.value.id, form.value).then(res=>{
      if(res.success){
        ElMessage({
          message: '修改成功',
          type: 'success',
        });
        getData();
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
    delRemoteSenseMapPrimage(row.id).then(res => {
      if (res.success) {
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
        getData();
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