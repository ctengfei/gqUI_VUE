<template>
    <div style="display: flex;align-items: center;margin-bottom: 10px">
      <span>用户姓名：</span>
      <el-input placeholder="请输入用户姓名"  style="width: 160px"  v-model="form.realName" />
      <span style="margin-left: 20px">部门：</span>
      <el-tree-select :data="department"
                      checkStrictly
                      v-model="form.deptId"
                      clearable
                      style="width: 260px"
                      default-expand-all
                      placeholder="请选择部门" />
      <el-button style="margin-left: 40px" type="primary" icon="search" @click="handleSearch">查询</el-button>
      <el-button style="margin-left: 20px" icon="refresh" @click="handleRest">重置</el-button>
    </div>
  <vxe-table
      border
      ref="tableRef"
      :data="vxeData"
      :row-config="{keyField: 'userId'}"
      height="580"
      @checkbox-change="selectionChange">
    <vxe-column type="checkbox" width="60"></vxe-column>
    <vxe-column field="realName" title="用户姓名"></vxe-column>
    <vxe-column field="deptId" title="部门">
      <template #default="{ row }">
        {{ formatVal(row.deptId) }}
      </template>
    </vxe-column>
  </vxe-table>
</template>
<script setup>
import { formatterVal } from '@/utils';
import {ref, reactive, onMounted, defineProps, watch, defineEmits, computed} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {deptTreeSelect, listUser} from "@/api/system/user";
import {getUserInner} from "@/api/userManager";
import {loopTree, treeToArray} from "@/utils";
import {getUserList} from "@/api/waterManager/instManagement";
const emit = defineEmits(['getUsers'])
const tableRef = ref()
let department = ref([]);
let vxeData = ref([]);
let form=ref({deptId:'',realName:''});

const formatVal = (row) =>{
  return row ? treeToArray(department.value).find(r=> r.id == row)?.label : ''
}

const selectionChange = () => {
  const $table = tableRef.value
  if ($table) {
    const records = $table.getCheckboxRecords()
    emit('getUsers',records)
  }
}


onMounted(() => {
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
  getData()
})

const getData = () => {
  getUserList().then(res => {
    if (res.code == 200) {
      vxeData.value = res.data.filter(r=>r.userId!=1);
    }
  })
}

function handleSearch() {
  getUserList({...form.value}).then(res => {
    if (res.code == 200) {
      vxeData.value = res.data.filter(r=>r.userId!=1);
    }
  })
}

function handleRest() {
  form.value = {deptId:'',realName:''};
}


</script>

<style scoped lang="scss">

</style>