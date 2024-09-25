<template>
    <!-- <vxe-toolbar>
      <template #buttons>
        <vxe-button style="margin-left: 15px" status="primary" :class="activeNum===1?'wait-click-btn':''" content="降雨计算" @click="handleFallCalculationBtn('1')"></vxe-button>
        <vxe-button style="margin-left: 15px" status="primary" :class="activeNum===2?'wait-click-btn':''" content="优选相似年计算" @click="handleFallCalculationBtn('2')"></vxe-button>
      </template>
    </vxe-toolbar> -->
    <vxe-table
        border
        keep-source
        show-overflow
        height="350"
        ref="xTable"
        style="z-index: 1"
        :column-config="{resizable: false}"
        :seq-config="{startIndex: 0}"
        :edit-config="{trigger: 'manual', mode: 'row'}"
        :data="data">
      <vxe-column field="year" width="auto" title="年份" align="center">
      </vxe-column>
      <vxe-column field="rainfall" width="auto" title="年降雨量(mm)" align="center">
      </vxe-column>
      <vxe-column field="weight" width="auto" title="权重配比" :edit-render="{}" align="center">
        <template #edit="{ row }">
          <vxe-input v-model="row.weight" type="number" max="1" min="0"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column title="操作" width="150"  >
        <template #default="{ row }">
          <template v-if="isActiveStatus(row)">
            <vxe-button size="mini" status="primary" @click="saveRowEvent(row)">保存</vxe-button>
            <vxe-button size="mini"  @click="cancelRowEvent(row)">取消</vxe-button>
          </template>
          <template v-else>
            <vxe-button size="mini" type="text" icon="vxe-icon-edit" status="primary"  @click="editRowEvent(row)">编辑</vxe-button>
            <vxe-button size="mini" type="text" icon="vxe-icon-delete"  status="danger" content="删除" @click="removeRowEvent(row)"></vxe-button>
          </template>
        </template>
      </vxe-column>
    </vxe-table>
  </template>
  
  <script setup>
  import {reactive, ref, defineProps, watch,defineExpose,defineEmits} from 'vue';
  import useIncomingWater from '@/store/modules/incomingWater';
  import dayjs from "dayjs";
  import {VXETable} from 'vxe-table';
  import {ElLoading} from "element-plus";
  import {getRaveListSimilarYears,postUpdateSimilarYears} from '@/api/agricultureWater';
  import {getRainResult, getRaveYear, postPlan, postUpdateWeight,fallCalculationBtn} from "@/api/incomingWater";
  import {ElMessage} from "element-plus";
  const IncomingWater = useIncomingWater()
  let date = ref();
  const xTable = ref();
  const emit = defineEmits(['handleActive'])
  const props = defineProps(['planForm','allocCode','visible']);
  let data = ref([]);
  let activeNum=ref(0)
  let downloadLoadingInstance = null
  const getSum = (data)=> {
   return data.reduce((total,curr)=> {
     if(curr.weight){
       return parseFloat(curr.weight*1) + total;
     }else{
       return 0
     }
    },0)
  }
  //点击降雨计算及优选相似年计算按钮
  const handleFallCalculationBtn=(type)=>{
    handleSave();
    downloadLoadingInstance = ElLoading.service({ text: "数据计算中，请稍候", background: "rgba(0, 0, 0, 0.7)", });
    fallCalculationBtn({
      caseCode:props.currentPlan.allocCode,
      type
    }).then(res=>{
      if (res.success) {
        downloadLoadingInstance.close();
        if(type==='1'){
          activeNum.value=2
        }else{
          activeNum.value=3
          emit('handleActive',activeNum.value)
        }
        getRainData()
      }
    }).catch(e=>{
      downloadLoadingInstance.close();
    })
  }
  //获取降雨量数据
  const getRainData=()=>{
    getRaveListSimilarYears({allocCode:props.allocCode}).then(res=>{
      // console.log(res,'相似年选取');
          if(res.success){
            /* const {resultTypicalYearWeightList,forecastSimpleDepthVO}=res.data||{}
            if(forecastSimpleDepthVO){
              IncomingWater.getRainResult(forecastSimpleDepthVO)
            } */
            // data.value = resultTypicalYearWeightList||[];
            data.value = res.data;
          }
        })
  }
  
  //保存左侧配置参数
  const handleSave = () => {
    const planInfo = props.currentPlan;
    const {forecastDate}=planInfo
    const form = props.planForm;
    postPlan({
      allocCode:planInfo.allocCode,
      allocName:planInfo.allocName,
      unitCode:planInfo.unitCode,
      forecastSdate:forecastDate?forecastDate[0]:'',
      forecastEdate:forecastDate?forecastDate[1]:'',
      ...form
    }).then(res=>{
      if(res.success){
       console.log('保存左侧配置参数成功');
      }
    })
  }
  
  watch(()=>props.visible,(v)=>{
    if (!v){
      getRainData()
    }
  },{immediate:true})
  
  defineExpose({
    setActiveBtn,
  })
  function setActiveBtn(val) {
    activeNum.value=val
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
  const saveRowEvent = (row) => {
    const $table = xTable.value
    if ($table) {
      const data = $table.getUpdateRecords();
      const planInfo = props.currentPlan;
      const allocCode = props.allocCode;
     const sum = getSum($table.data);
      if(sum > 100){
        ElMessage({
          message: '权重总和不能大于1',
          type: 'warning',
        });
      }else{
          $table.clearEdit().then(() => {
            if(data.length){
              const {weight,year,id,rainfall}=data[0]||{}
              postUpdateSimilarYears({
                allocCode:allocCode,
                weight,
                year,
                id,
                rainfall
              }).then(res=>{
                if(res.success){
                  ElMessage({
                    message: '修改成功',
                    type: 'success',
                  });
                  getRainData()
                }
              })
            }
          })
      }
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
  
  const removeRowEvent = async (row) => {
    const type = await VXETable.modal.confirm('您确定要删除该数据?')
    const $table = xTable.value
    if ($table) {
      if (type === 'confirm') {
        $table.remove(row)
      }
    }
  }
  </script>
  
  <style scoped lang="scss">
  .wait-click-btn{
    box-shadow:0 0 0 4px #81d3fc;
    animation: motion 0.4s infinite alternate;
  }
  @keyframes motion {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-4px);
    }
  }
  </style>