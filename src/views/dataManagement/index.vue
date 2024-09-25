<template>
  <div class="app-container" style="background: transparent;padding: 0;display: flex;flex-direction: column">
    <div class="box">
      <el-card shadow="always" :body-style="{display:'flex','flex-direction':'column',height:'100%',width:'100%'}">
        <div class="head-title">来水预测参数设置</div>
        <div class="table_box">
          <lsTable/>
        </div>
      </el-card>
      <el-card shadow="always" :body-style="{display:'flex','flex-direction':'column',height:'100%',width:'100%'}">
        <div class="head-title">农业需水预测参数设置</div>
        <div class="table_box">
          <nyTable/>
        </div>
      </el-card>
    </div>
    <div class="box">
      <el-card shadow="always" :body-style="{display:'flex','flex-direction':'column',height:'100%',width:'100%'}">
        <div class="head-title">生态需水预测参数设置</div>
        <div class="table_box">
          <div>
            <el-input-number
                style="width: 50%;margin: 30px"
                v-model="flowEco"
                placeholder="请输入生态流量控制目标"
                :min="0"
                controls-position="right"
            />
            <el-button type="primary" @click="handleSave">保存</el-button>
          </div>
        </div>
      </el-card>
      <el-card shadow="always" :body-style="{display:'flex','flex-direction':'column',height:'100%',width:'100%'}">
        <div style="display: flex;justify-content: space-between">
          <div class="head-title">水量分配预测参数设置</div>
          <pro-select :data="selects" v-model="allocCode" />
        </div>
        <div class="table_box">
          <slTable :allocCode="allocCode" ref="Stable" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import lsTable from './components/lsTable'
import nyTable from './components/nyTable';
import slTable from './components/slTable';
import {onMounted, watch} from "vue";
import {editFlowEcoApi, getParmEcoList, getPlanCodeList} from "@/api/incomingWater";
const Stable = ref();
let flowEco = ref(0);
let selects = ref([]);
let allocCode = ref('');

onMounted(()=>{
  getParmEcoList({}).then(res => {
    if (res.success) {
      flowEco.value = (res.data.length && res.data[0].flowEco) || 0
    }
  })


  // 获取所有方案
  getPlanCodeList().then(res=>{
    if (res.success) {
      selects.value = res.data.map(r=>({label:r.allocName,value:r.allocCode}));
      allocCode.value = selects.value.length ? selects.value[0].value : null
    }
  })
})

const handleSave = () =>{
  editFlowEcoApi({flowEco:flowEco.value}).then(res => {
    if (res.success) {
      getParmEcoList();
    }
  })
}

watch(allocCode,(al)=>{
  if(al){
    console.log(al)
    Stable.value.getData(al)
  }
},{immediate:true})

</script>

<style scoped lang="scss">
.box{
  display: flex;
  flex: 1;
  margin-bottom: 20px;
  .table_box{
    flex: 1;
  }
}
:deep(.el-card){
  flex: 1;
  &:nth-child(1){
    margin-right: 20px;
  }
}
</style>