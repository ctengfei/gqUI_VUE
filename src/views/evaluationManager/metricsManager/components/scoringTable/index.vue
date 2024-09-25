<template>
  <div style="display: flex;justify-content: space-between;align-items: center; width: 100%;margin-right: 30px;margin-bottom: 10px">
    <span style="font-weight: bold;margin-left: 30px">标准分数：{{ currentRow.totalStandardScore || 0 }} 分</span>
    <el-button type="primary" icon="Plus" :disabled="props.form_type == 'detail'" @click="handleAdd">新增</el-button>
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
    <vxe-column type="seq" title="序号" width="60"></vxe-column>
    <vxe-column field="standardScore" title="标准评分" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.standardScore }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-input v-model="row.standardScore" type="text"></vxe-input>
      </template>
    </vxe-column>
    <vxe-column field="description" title="描述" :edit-render="{}">
      <template #default="{ row }">
        <el-popover
            v-if="row.description && row.description.length"
            placement="top-start"
            :width="200"
            trigger="hover"
            effect="dark"
            :content="row.description"
        >
          <template #reference>
            <a>{{ row.description }}</a>
          </template>
        </el-popover>
      </template>
      <template #edit="{ row }">
        <vxe-input v-model="row.description" type="text"></vxe-input>
      </template>
    </vxe-column>
    <vxe-column field="remark" title="备注" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.remark }}</span>
      </template>
      <template #edit="{ row }">
        <vxe-input v-model="row.remark" type="text"></vxe-input>
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
import {getEvaluationId} from "@/api/evaluationManager/metricsManager";
const dictStore = useDictionaryStore();
const props = defineProps(['department','form_type','scoringId']);
const emit = defineEmits(['getXTable'])
const xTable = ref();
let currentRow = ref({totalStandardScore:0});
let vxeData = ref([]);

onMounted(()=>{
  if(props.form_type == 'detail' || props.form_type == 'edit') {
    getEvaluationId(props.scoringId).then(res => {
      if (res.success) {
        currentRow.value = res.data;
        vxeData.value = res.data.indexDetail;
      }
    })
  }
  emit('getXTable', xTable.value);
})

const handleAdd = async () => {
  const $table = xTable.value
  if ($table) {
    const record = {
      standardScore: '',
      description: '',
      remark: '',
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
    $table.remove(row);
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
    const {tableData} =  $table.getTableData();
    $table.clearEdit().then(() => {
      currentRow.value.totalStandardScore = tableData.reduce((a,b)=>{
        return a + parseFloat(b.standardScore);
      },0)
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