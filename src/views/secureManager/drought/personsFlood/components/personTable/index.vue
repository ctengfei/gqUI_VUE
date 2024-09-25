<template>
  <div style="text-align: right;width: 100%;margin-right: 30px;margin-bottom: 10px">
    <el-button type="primary" icon="Plus" :disabled="props.form_type == 'detail'" @click="handleAdd">新增责任人</el-button>
  </div>
  <vxe-table
      keep-source
      show-overflow
      ref="xTable"
      height="350"
      style="width: 100%;margin-bottom: 20px"
      header-row-class-name="vxe-rowClass"
      align="center"
      :data="vxeData"
      :edit-config="props.form_type == 'detail' ? false : {trigger: 'click', mode: 'row'} "
  >
    <vxe-column field="deptId" title="部门" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ formatVal(row.deptId) }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-select v-model="row.deptId">
          <vxe-option v-for="item in treeToArray(props.department) " :key="item.value" :value="item.value"
                      :label="item.label"/>
        </vxe-select>
      </template>
    </vxe-column>
    <vxe-column field="duty" title="职务" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.duty }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-input v-model="row.duty" type="text"></vxe-input>
      </template>
    </vxe-column>
    <vxe-column field="dutyPersonType" title="责任人类型" :edit-render="{}">
      <template #default="{ row }">
        <span>{{  formatterVal(row, 'person_type', 'dutyPersonType') }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-select v-model="row.dutyPersonType">
          <vxe-option v-for="item in dictStore.getDict('person_type')" :key="item.value" :value="item.value"
                      :label="item.label"/>
        </vxe-select>
      </template>
    </vxe-column>
    <vxe-column field="dutyRange" title="职责范围" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.dutyRange }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-input v-model="row.dutyRange" type="text"></vxe-input>
      </template>
    </vxe-column>
    <vxe-column field="personName" title="姓名" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.personName }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-input v-model="row.personName" type="text"></vxe-input>
      </template>
    </vxe-column>
    <vxe-column v-if="!(props.form_type == 'detail')" title="操作" width="15%">
      <template #default="{ row }">
        <template v-if="isActiveStatus(row)">
          <vxe-button style="color:#409eff;" type="text" @click="saveRowEvent(row)">保存</vxe-button>
          <vxe-button style="color:#f56c6c;" type="text" @click="cancelRowEvent(row)">取消</vxe-button>
        </template>
        <template v-else>
          <vxe-button style="color:#409eff;" icon="vxe-icon-edit" type="text" @click="editRowEvent(row)">修改</vxe-button>
          <vxe-button style="color:#f56c6c;" type="text" @click="deleteRowEvent(row)">删除</vxe-button>
        </template>
      </template>
    </vxe-column>
  </vxe-table>
</template>

<script setup>
import {ref, defineProps, defineEmits, watch, onMounted, nextTick} from 'vue';
import {treeToArray,formatterVal} from '@/utils';
import {VXETable} from 'vxe-table';
import useDictionaryStore from "@/store/modules/dictionary";
import {deltDutPerson, getDutPerson} from "@/api/secureManager/drought/personsFlood";
import {ElMessage} from "element-plus";
const dictStore = useDictionaryStore();
const props = defineProps(['department', 'personsId','form_type']);
const emit = defineEmits(['getXTable'])
const xTable = ref();
let vxeData = ref([]);
const formatVal = (row) => {
  return row ? treeToArray(props.department).find(r => r.id == row)?.label : ''
}

onMounted(()=>{
  if(props.form_type == 'detail' || props.form_type == 'edit'){
    getDutPerson(props.personsId).then(res=>{
      if(res.success){
        vxeData.value = res.data.personDetailList;
      }
    })
  }
  emit('getXTable', xTable.value);
})

const handleAdd = async () => {
  const $table = xTable.value
  if ($table) {
    const record = {
      deptId: '',
      duty: '',
      dutyPersonType: '',
      dutyRange: '',
      personName: '',
    }
    // 插入一行数据
    const {row} = await $table.insertAt(record, -1)
    // 触发编辑
    await $table.setActiveRow(row);
  }
}

const deleteRowEvent = (row) => {
  const $table = xTable.value
  if ($table) {
    deltDutPerson({personId:row.id}).then(res=>{
      if (res.success) {
        $table.remove(row);
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    })
  }
}

const isActiveStatus = (row) => {
  const $table = xTable.value
  if ($table) {
    return $table.isEditByRow(row)
  }
}

const editRowEvent = (row) => {
  const $table = xTable.value
  if ($table) {
    $table.setEditRow(row)
  }
}

const saveRowEvent = async (row) => {
  const $table = xTable.value
  if ($table) {
    $table.clearEdit().then(() => {

    })
  }
}

const cancelRowEvent = (row) => {
  const $table = xTable.value
  if ($table) {
    $table.clearEdit().then(() => {
      // 还原行数据
      $table.revertData(row)
    })
  }
}

</script>

<style scoped>

</style>