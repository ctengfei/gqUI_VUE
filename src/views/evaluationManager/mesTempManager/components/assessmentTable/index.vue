<template>
  <div style="display: flex;justify-content: space-between;align-items: center; width: 100%;margin-right: 30px;margin-bottom: 10px">
    <el-button type="primary" style="margin-left: 30px" icon="Plus" :disabled="props.form_type == 'detail'" @click="handleAdd">新增指标</el-button>
    <span style="font-weight: bold;margin-right: 30px">标准分数：{{ totalScore }} 分</span>
  </div>
  <vxe-table
      show-overflow
      ref="xTable"
      height="230"
      style="width: 100%;margin-bottom: 20px"
      align="center"
      :data="vxeData"
  >
    <vxe-column field="examCategory" title="考核类目" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ formatterVal(row,'exam_category','examCategory')}}</span>
      </template>
    </vxe-column>
    <vxe-column field="indexName" title="指标名称" :edit-render="{}">
      <template #default="{ row }">
        <el-popover
            v-if="row.indexDetailContent && row.indexDetailContent.length"
            placement="top"
            :width="200"
            trigger="hover"
            effect="dark"
            :content="row.indexDetailContent"
        >
          <template #reference>
            <a>{{ row.indexName }}</a>
          </template>
        </el-popover>
        <span v-else>{{ row.indexName }}</span>
      </template>
    </vxe-column>
    <vxe-column field="totalStandardScore	" title="标准分数" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.totalStandardScore }}</span>
      </template>
    </vxe-column>
    <vxe-column v-if="!(props.form_type == 'detail')" title="操作" width="15%">
      <template #default="{ row }">
        <vxe-button style="color:#f56c6c;" type="text" @click="deleteRowEvent(row)">删除</vxe-button>
      </template>
    </vxe-column>
  </vxe-table>
  <metricsTable v-model:dialogVisible="dialogVisible" @getMetricsData="getMetricsData" />
</template>

<script setup>
import {ref, defineProps, defineEmits, watch, onMounted, nextTick} from 'vue';
import {treeToArray, formatterVal, filterID} from '@/utils';
import {VXETable} from 'vxe-table';
import metricsTable from '../metricsTable';
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage} from "element-plus";
import {getEvaluationId} from "@/api/evaluationManager/metricsManager";
import {getIdMesTemp} from "@/api/evaluationManager/mesTempManager";
const dictStore = useDictionaryStore();
const props = defineProps(['department','tempId','form_type']);
const emit = defineEmits(['getXTable'])
const xTable = ref();
let totalScore = ref(0);
let vxeData = ref([]);
let dialogVisible = ref(false);

onMounted(()=>{
  if(props.form_type == 'detail' || props.form_type == 'edit') {
    getIdMesTemp(props.tempId).then(res=>{
      if(res.success){
        vxeData.value = res.data.templateDetail;
      }
    })
  }
  emit('getXTable', xTable.value);
})

const getMetricsData = (Metrics) => {
  vxeData.value = filterID(vxeData.value.concat(Metrics),'indexId')
}

const handleAdd =  () => {
  dialogVisible.value = true;
}

watch(()=>vxeData.value,(data)=>{
  totalScore.value = data.reduce((a,b)=>{
    return a + b.totalStandardScore;
  },0)
})

const deleteRowEvent = (row) => {
  const $table = xTable.value
  if ($table) {
    $table.remove(row);
    const {tableData} =  $table.getTableData();
    vxeData.value = tableData;
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