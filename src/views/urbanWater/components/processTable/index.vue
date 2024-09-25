<template>
  <vxe-table
      keep-source
      border
      show-overflow
      ref="xTable"
      :column-config="{resizable: false}"
      :edit-config="{trigger: 'manual', mode: 'row',showIcon:false}"
      :data="data">
    <vxe-column field="UNIT" title="取水位置" align="center" width="140"></vxe-column>
    <vxe-colgroup title="预测需水过程(万m³)" align="center">
      <vxe-column  :edit-render="{}" :field="item" :title="item" align="center" v-for="item in keys" :key="item">
        <template #edit="{ row }">
          <vxe-input v-model.number="row[item]" min="0"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="yearTotal" title="合计"  width="109" align="center"></vxe-column>
    </vxe-colgroup>
    <vxe-column title="操作" align="center" fixed="right" width="150" >
      <template #default="{ row,rowIndex }" >
        <template v-if="isActiveStatus(row)">
          <vxe-button @click="saveRowEvent(row,rowIndex)" status="primary">保存</vxe-button>
          <vxe-button @click="cancelRowEvent(row)">取消</vxe-button>
        </template>
        <template v-else>
          <vxe-button @click="editRowEvent(row)">人工干预</vxe-button>
        </template>
      </template>
    </vxe-column>
  </vxe-table>
</template>

<script setup>
import {defineProps, onMounted, ref, watch,defineExpose} from "vue";
import {getYearUseWater, postSaveForecastDemandList} from "@/api/urbanWater";
import {ElMessage} from "element-plus";
const props = defineProps(['currentRow']);
const xTable = ref();
let data = ref([]);
let keys = ref([]);
onMounted(() => {
  getData()
})
defineExpose({
  refresh,
})
function refresh() {
  getData()
}
//查询人工干预列表数据
function getData() {
  getYearUseWater({
    allocCode: props.currentRow.allocCode,
  }).then(res => {
    if (res.success) {
      const {monthList, resultWaterList} = res.data || {}
      keys.value = monthList || []
      data.value = resultWaterList || [];
    }
  })
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
const saveRowEvent = (row,index) => {
  const $table = xTable.value
  if ($table) {
    $table.clearEdit().then(() => {
      const data = keys.value.map(r=>{
        return {
          "allocCode": props.currentRow.allocCode,
          "tm": r,
          "unitCode": row.unitCode,
          "wreqUrban": parseFloat(row[r]) * 10000,
        }
      });
      postSaveForecastDemandList(data).then(res=>{
        if(res.success){
          getData()
          ElMessage({
            message: '保存成功',
            type: 'success',
          });
        }
      })
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