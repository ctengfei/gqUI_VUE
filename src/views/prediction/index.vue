<template>
  <div class="app-container">
    <div class="head-title">预测结果</div>
    方案名称：<pro-select
      v-model="select1"
      style="margin: 10px 0"
      :data="options1"/>
<!--    <span style="" style="margin-left: 15px">预测区域：</span>-->
<!--    <pro-select-->
<!--        v-model="select2"-->
<!--        style="margin: 10px 0"-->
<!--        :data="options2"/>-->
    <el-table :data="data" style="width: 100%">
      <el-table-column  prop="type" label="类别" align="center" width="160" />
      <el-table-column :prop="item.month" :label="item.monthValue" align="center" v-for="item in keys" :key="item.month" />
      <el-table-column fixed="right" prop="total" label="合计" align="center" />
    </el-table>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from "vue";
import {getAreaList, getIntervention, getPlanCodeList} from "@/api/incomingWater";
let options1 = ref([]);
let select2 = ref('');
let options2 = ref([]);
let select1 = ref('');
let data = ref([]);
let keys = ref([]);
onMounted(()=>{
  // 方案名称
  getPlanCodeList().then(res=>{
    if(res.success){
      options1.value = res.data.map(r=>({label:r.allocName,value:r.allocCode}));
      select1.value = options1.value.length ? options1.value[0].value : '';
    }
  })
  // 预测区域
  getAreaList().then(res => {
    if (res.success) {
      options2.value = res.data.map(r => ({label: r.unitName, value: r.unitCode}));
      select2.value = options2.value.length ? options2.value[0].value : '';
    }
  })

})

watch([select1,select2],([s1,s2])=>{
  if((s1 && s1.length) && (s2 && s2.length)){
    getIntervention({
      allocCode:s1,
      unitCode:s2,
    }).then(res=>{
      if(res.success){
        const {monthList,resultWaterList}=res.data||{}
        keys.value=monthList||[]
        data.value =resultWaterList.map(r=>({...r,type:`${r.type}`}))||[]
      }
    })
  }


},{immediate:true})
function getLabel(val) {
  return `${val}(万m³)`
}
</script>

<style scoped lang="scss">
.head-title {
  position: relative;
  padding-left: 15px;
  font-size: 15px;
  font-weight: 600;

  &:after {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 10px;
    background: #1791FF;
  }
}

</style>