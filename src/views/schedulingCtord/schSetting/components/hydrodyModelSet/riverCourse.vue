<template>
    <div>
        <div> 
            <span>渠道名称：</span>
            <el-select v-model="selectVal" style="width: 50%">
              <el-option
                  v-for="item in chanArr"
                  :key="item.chanCode"
                  :label="item.chanName"
                  :value="item.chanCode"
              />
            </el-select>
            <el-button type='primary' style='margin-left: 20px' @click='getSectionData()'>查询渠道</el-button>
            <el-button type='primary' style='margin-left: 20px' @click='handleRough()'>查看糙率列表</el-button>
        </div>
        <el-divider content-position="left">断面选择</el-divider>
        <div style=" margin: 20px 0; border: solid 1px #eee; padding: 10px">
            <el-checkbox
                v-model="checkAll"
                :indeterminate="isIndeterminate"
                @change="handleAllChange"
            >
                全选
            </el-checkbox>
            <el-checkbox-group
                v-model="checkBnth"
                @change="handleChange"
            >
                <el-checkbox v-for="item in bnchArr" :key="item.chanCode" :label="item.bnch" :value="item.chanCode">
                {{ item.bnch }}
                </el-checkbox>
            </el-checkbox-group>
        </div>
        <div>
            <span>渠道糙率：</span>
            <el-input-number v-model='riverVal' :min="0" step="0.001" :max="1" style='width: 50%'></el-input-number>
        </div>
        <div style="display: flex;justify-content: center;margin-top: 20px;">
            <el-button @click="handleSubmit" type='primary'>确认修改</el-button>
        </div>
        <el-dialog v-model="dialogvis" title="查看糙率列表" class="runoff-dialog" width="50%">
            <pro-crud
                ref="crudRef"
                v-model="form"
                :columns="columns"
                :gutter="20"
                :data="tableData"
                v-model:current-page="currentPage"
                v-model:page-size="pageSizes"
                layout="->,total,sizes,prev, pager, next, jumper"
                background
                :page-sizes="[10, 20, 30, 40, 50]"
                :total="total"
                @load="load"
                :column="2"
                width="55%"
                align="center"
                label-width="150px"
                direction="vertical"
                >
            </pro-crud>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="primary" @click="dialogvis = false">
                    关闭
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch, onBeforeUnmount } from "vue";
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineFormColumns,
  defineCrudBeforeOpen,
  defineCrudBeforeClose,
} from "element-pro-components";
import { getChaneParmList, updateBatch, getRoughessList } from "@/api/schedulingCtord/realtimeFor";
import { ElMessage, ElMessageBox } from "element-plus";
import { getChanList } from "@/api/schedulingCtord/schSetting"
const props = defineProps(['dialogVisible']);
const emit = defineEmits(['update:dialogVisible']);
let activeName=ref('1');
let selectVal=ref('');
let pageSize=ref(500);
let pageNum=ref(1);
let options=ref([
    {
        value: 'CT42120001',
        label: '总干渠'
    }
])
let chanArr=ref([]);
let riverVal=ref();
const checkAll = ref(false);
const isIndeterminate = ref(true);
const checkBnth = ref([]);
const bnchArr = ref([]);
let dialogvis = ref(false);
const form = ref();
const crudRef = ref();
let tableData = ref([]);
let currentPage = ref(1);
let pageSizes = ref(10);
let total = ref(0);
const columns = defineCrudColumns(
  computed(() => [
    {
      label: "渠道编码",
      prop: "chanCode",
    },
    {
      label: "断面",
      prop: "bnch",
    },
    {
      label: "糙率值",
      prop: "roughness",
    },
  ])
);


onMounted(()=>{
    getChanList().then(res=>{
        if(res.success){
            chanArr.value = res.data;
            selectVal.value = res.data[0].chanCode
        }
    })
    getChaneParmList(
        {
            pageNum: pageNum.value,
            pageSize: pageSize.value,
        }
    ).then(res=>{
        bnchArr.value = res.data.parmRoughnessHydraulicVOs
    })
    getRoughessList(
        {
            pageNum: currentPage.value,
            pageSize: pageSizes.value,
        }
    ).then(res=>{
        if(res.success){
            tableData.value = res.data.data;
            total.value = res.data.total;
        }
    })
})
// 查询渠道
const getSectionData = () => {
    getChaneParmList(
        {
            chanCode: selectVal.value,
            pageNum: pageNum.value,
            pageSize: pageSize.value,
        }
    ).then(res=>{
        bnchArr.value = res.data.parmRoughnessHydraulicVOs
    })
}

// 查询糙率列表
const handleRough = () => { 
    dialogvis.value = true;
    getRoughessList(
        {
            pageNum: currentPage.value,
            pageSize: pageSizes.value,
        }
    ).then(res=>{
        if(res.success){
            tableData.value = res.data.data;
            total.value = res.data.total;
        }
    })
}

// 分页回调
const load = () => {
    handleRough();
};
// 全选
const handleAllChange = (val) => {
    let bnchArrTemp = bnchArr.value.map(item=> item.bnch);
    checkBnth.value = val ? bnchArrTemp : []
    isIndeterminate.value = false
}

// 单选
const handleChange = (value) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === bnchArr.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < bnchArr.length
}

const handleSubmit = ()=>{
    updateBatch(
        {
            bnchs: checkBnth.value,
            chanCode: selectVal.value,
            roughness: riverVal.value
        }
    ).then(res=>{
        if (res.success) {
          ElMessage({
            message: "批量修改成功",
            type: "success",
          });
        }
    })
}

</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  margin-top: 17vh!important;
}

:deep(.el-dialog__body){
  padding-top: 15px!important;
}
</style>