<template>
  <vxe-table
      show-overflow
      ref="xTable"
      style="width: 100%;margin-bottom: 20px;position: relative;z-index:5"
      align="center"
      :data="vxeData"
  >
    <vxe-column field="examAddrName" title="考核对象" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.examAddrName }}</span>
      </template>
    </vxe-column>
    <vxe-column field="totalTempStandardScore" title="标准分数" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.totalTempStandardScore }}</span>
      </template>
    </vxe-column>
    <vxe-column field="templateName" title="考核模板" :edit-render="{}">
      <template #default="{ row }">
        <span>{{ row.templateName }}</span>
      </template>
    </vxe-column>
    <vxe-column field="memberName" title="考核组成员" width="240" :edit-render="{}">
      <template #default="{ row }">
        <span props.form_type v-if ="props.form_type== 'detail'">
          {{ row.memberName }}
        </span>
        <el-input v-model="userNames" placeholder="选择成员" v-else>
          <template #append>
            <el-button type="primary" @click="handleSelectUsers">选择成员</el-button>
          </template>
        </el-input>
      </template>
    </vxe-column>
    <vxe-column v-if="!(props.form_type == 'detail')" title="操作" width="15%">
      <template #default="{ row }">
        <vxe-button style="color:#00A7F4;" type="text" @click="handleSelectTemp(row)">切换模版</vxe-button>
        <vxe-button style="color:#f56c6c;" type="text" @click="deleteRowEvent(row)">删除</vxe-button>
      </template>
    </vxe-column>
  </vxe-table>
  <el-dialog
      draggable
      v-model="dialogVisible1"
      title="模版选择"
      width="50%"
  >
    <vxe-table
        border

        height="350"
        :row-config="{keyField: 'id'}"
        :data="tempData"
        :radio-config="radioConfig"
        @radio-change="radioChangeEvent">
      <vxe-column type="radio" width="60"  align="center">
      </vxe-column>
      <vxe-column field="templateCode" align="center" title="模板编号"></vxe-column>
      <vxe-column field="templateName" align="center" title="模板名称"></vxe-column>
      <vxe-column field="examAddrName" align="center" title="适用考核范围"></vxe-column>
      <vxe-column field="examFreq" align="center" title="考核频次">
        <template #default="{row}">{{ formatterVal(row,'frequency_assessment','examFreq') }}</template>
      </vxe-column>
      <vxe-column field="totalTempStandardScore" align="center" title="标准分数"></vxe-column>
    </vxe-table>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible1 = false">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
      draggable
      class="user_dialog"
      v-model="dialogVisible2"
      title="选择成员"
      width="60%"
  >
    <userTable @getUsers="getUsers" />
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible2 = false">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import useDictionaryStore from "@/store/modules/dictionary";
import {defineEmits, defineProps, onMounted, reactive, ref, watch,toRefs} from "vue";
import {getTempList} from "@/api/evaluationManager/evaluationTaskManager";
import {formatterVal, loopTree, treeToArray} from '@/utils';
import userTable from '../userTable';

const dictStore = useDictionaryStore();
const props = defineProps(['form_type','formVal']);
const emit = defineEmits(['getXTable','getUsers'])
const xTable = ref();
let totalScore = ref(0);
let vxeData = ref([]);
let dialogVisible1 = ref(false);
let dialogVisible2 = ref(false);
let tempData= ref([]);
let users = ref([]);
let userNames = ref('');
let radioConfig = reactive({checkRowKey:0})

onMounted(()=>{
  if(props.form_type == 'detail'){
    const data = props.formVal.examObjInfoList;
    vxeData.value = data.map(r=>({
      examAddrName:r.examObjName,
      totalTempStandardScore:r.totalTempStandardScore,
      templateName:r.templateName,
      memberName:r.memberName
    }));
  }
})

// 根据考核对象 频次 考核对象类型 查询考核模版
watch(()=>props.formVal,(val={})=>{
  getTempList({
    examAddrId:val?.examObjId,
    examFreq:val.examFreq,
    examObjType:val.examObjType,
  }).then(res=>{
    if(res.success){
      tempData.value = res.data;
      vxeData.value = res.data.length ? [res.data[0]] : [];
      radioConfig.checkRowKey = res.data.length ? res.data[0].id : '';
    }
  })
},{deep:true})

// 切换模版
const handleSelectTemp = row => {
  dialogVisible1.value = true;
}

// 选择模版
const radioChangeEvent = ({row}) => {
  vxeData.value = [row];
}

// 选择成员弹框
const handleSelectUsers = () => {
  dialogVisible2.value = true;
}

// 获取成员
const getUsers = (us) =>{
  users.value = us;
  userNames.value = us.map(r=> r.realName).join(',');
  emit('getXTable', xTable.value);
  emit('getUsers',us);
}

// 删除
const deleteRowEvent = (row) => {
  const $table = xTable.value
  if ($table) {
    $table.remove(row);
    const {tableData} =  $table.getTableData();
    vxeData.value = tableData;
  }
}


</script>
<style lang="scss">
.user_dialog .el-dialog__body{
  height: 650px!important;
}
</style>
<style scoped lang="scss">

</style>