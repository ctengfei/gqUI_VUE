<template>
  <div style="display: flex;justify-content:space-between;align-items: center;margin-bottom: 10px;width: 100%">
    <strong style="margin-left: 30px">
      <span>队伍明细：总人数：{{ team.totalNum || 0 }}人，一线：{{ team.teamDetail['1'] || 0 }}人，二线：{{ team.teamDetail['2'] || 0 }}人，三线：{{ team.teamDetail['3'] || 0 }}人,突击队：{{ team.teamDetail['4'] || 0 }}人</span>
    </strong>
    <el-button style="margin-right: 30px" type="primary" :disabled="props.form_type == 'detail'" icon="Plus" @click="handleAdd">新增队伍</el-button>
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
      :edit-config="props.form_type == 'detail' ? false : {trigger: 'click', mode: 'row'}">
    <vxe-column field="laborName" title="劳力姓名" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.laborName }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-input v-model="row.laborName" type="text"></vxe-input>
      </template>
    </vxe-column>
    <vxe-column field="laborType" title="劳力类型" :edit-render="{}">
      <template #default="{ row }">
        <span>{{  formatterVal(row, 'labor_type', 'laborType') }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-select v-model="row.laborType">
          <vxe-option v-for="item in dictStore.getDict('labor_type')" :key="item.value" :value="item.value"
                      :label="item.label"/>
        </vxe-select>
      </template>
    </vxe-column>
    <vxe-column field="deptName" title="所属单位" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.deptName }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-input v-model="row.deptName" type="text"></vxe-input>
      </template>
    </vxe-column>
    <vxe-column field="personName" title="负责人姓名" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.personName }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-input v-model="row.personName" type="text"></vxe-input>
      </template>
    </vxe-column>
    <vxe-column field="personPhone" title="负责人电话" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.personPhone }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-input v-model="row.personPhone" type="text" ></vxe-input>
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
import {ElMessage} from "element-plus";
import {delTeamUser, getTeamList} from "@/api/secureManager/drought/emergencyManagement";

const dictStore = useDictionaryStore();
const props = defineProps(['personsId','form_type']);
const emit = defineEmits(['getXTable'])
const xTable = ref();
let team = ref({teamDetail:{1:0,2:0,3:0,4:0}});
let vxeData = ref([]);
const formatVal = (row) => {
  return row ? treeToArray(props.department).find(r => r.id == row)?.label : ''
}

onMounted(()=>{
  if(props.form_type == 'detail' || props.form_type == 'edit'){
    getTeamList(props.personsId).then(res=>{
      if(res.success){
        team.value = res.data;
        vxeData.value = res.data.teamDetailList;
      }
    })
  }
  emit('getXTable', xTable.value);
})

const handleAdd = async () => {
  const $table = xTable.value
  if ($table) {
    const record = {
      laborName: '',
      laborType: '',
      deptName: '',
      personName: '',
      personPhone: '',
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
    delTeamUser({personId:row.id}).then(res=>{
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