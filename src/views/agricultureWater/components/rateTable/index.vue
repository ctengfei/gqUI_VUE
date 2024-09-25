<template>
  <vxe-table
      border
      show-overflow
      ref="xTable"
      keep-source
      style="z-index: 1;flex: 0.8"
      height="380"
      :column-config="{resizable: false}"
      :edit-config="{trigger: 'click', mode: 'cell'}"
      :data="props.data">
    <vxe-column field="reservoirType" title="水源类型" align="center">
    </vxe-column>
    <vxe-column field="storageCapacityTotal" title="总库容(万m³)" align="center" >
    </vxe-column>
    <vxe-column field="storageCapacityEffective" title="有效库容(万m³)"  align="center" >
    </vxe-column>
    <vxe-column field="complexStorageCoefficient"  title="复蓄系数" align="center">
      <template #default="{ size,row }">
        <vxe-input v-model="row.complexStorageCoefficient" placeholder="复蓄系数" @change="onChangeInput(row)"></vxe-input>
      </template>
    </vxe-column>
  </vxe-table>
</template>

<script setup>
import {ref,defineProps,defineEmits} from "vue";
import {postXiShu} from "@/api/agricultureWater";
const xTable = ref();
const props = defineProps(['data','refresh','activeTab','allocCode'])
const emit = defineEmits([ "setRefresh"]);
const onChangeInput = (row) => {
  return postXiShu({
    "allocCode": props.allocCode,
    "complexStorageCoefficient": row.complexStorageCoefficient,
    "reservoirType": row.reservoirType,
    "unitCode": props.activeTab
  }).then(res=>{
    if(res.success){
      emit('setRefresh',!props.refresh);
    }
  })

}

</script>

<style scoped>

</style>