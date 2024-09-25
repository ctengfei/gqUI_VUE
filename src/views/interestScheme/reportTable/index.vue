<template>
  <el-table :data="props.tableData" height="600"  style="width: 100%">
    <el-table-column prop="date" label="日期" align="center" width="100" />
    <el-table-column prop="inflowWater" label="来水量(万m³)" align="center" width="135" />
    <el-table-column label="用水量(万m³)" align="center" >
      <el-table-column label="城乡供水(万m³)" align="center" >
        <el-table-column prop="urbanSupplyXianning" :label="UnlabelList[0]"></el-table-column>
      <el-table-column prop="urbanSupplyDaye" :label="UnlabelList[1]"></el-table-column>
      <el-table-column prop="urbanSupplyYangxin" :label="UnlabelList[2]"></el-table-column>
      </el-table-column>
      
      <!-- <el-table-column prop="urbanSupply" label="城乡(万m³)" align="center" /> -->
      <!-- <el-table-column prop="irrigationSupply" label="灌溉(万m³)"  align="center" /> -->
      <el-table-column label="农业灌溉(万m³)" align="center" >
        <el-table-column prop="irrigationSupplyYangWu" :label="labelList[0]"></el-table-column>
      <el-table-column prop="irrigationSupplySanxi" :label="labelList[1]"></el-table-column>
      <el-table-column prop="irrigationSupplyCanxian" :label="labelList[2]"></el-table-column>
      </el-table-column>
      <el-table-column prop="ecoSupply" label="生态发电(万m³)" align="center" />
      <el-table-column prop="reservoirWaterLoss" label="库水损耗(万m³)" align="center" />
      <el-table-column prop="electricityGenerationCapacity" label="发电(万m³)" align="center" />
      <el-table-column prop="abandonedWater" label="弃水(万m³)" align="center" />
    </el-table-column>
    <el-table-column label="水库水情" align="center" >
      <el-table-column prop="endMonthWaterStorage" label="月末蓄水量(万m³)" align="center" />
      <el-table-column prop="endMonthWaterLevel" label="月末库水位(m)"  align="center" />
      <el-table-column prop="fillStorageRatio" label="蓄满率(%)" align="center" />
    </el-table-column>
  </el-table>
</template>

<script setup>
import {defineProps, ref, watch,onMounted} from "vue";
import { getArg,getArgUnitList } from '@/api/agricultureWater';
const props = defineProps(['tableData']);
const labelList = ref([])
const UnlabelList = ref([])
onMounted(()=>{
  getArg({ type: 'arg' }).then(res => {
        if (res.success) {
          res.data.map((val)=>{
            labelList.value.push(val.unitName)
          })
          // labelList.value = res.data
        }
    });
    getArgUnitList().then(res=>{
      if (res.success) {
          res.data.map((val)=>{
            UnlabelList.value.push(val.unitName)
          })
          // labelList.value = res.data
        }
    })
})
</script>

<style scoped lang="scss">

</style>