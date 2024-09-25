<template>
    <div class="app-container">
        <div class="btnBox">
          <el-form ref="formRef" :inline="true" label-width="100px">
            <el-form-item label="需水上报时间" prop="allocName">
              <el-date-picker
                v-model="tmPlan"
                type="date"
                value-format='YYYY-MM-DD'
                placeholder="请选择需水上报时间">
              </el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery()" icon="Search">查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="dialogVisible = true"  icon="Plus" plain>新增</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleBatchDelete">批量删除</el-button>
            </el-form-item>
          </el-form>

        </div>
        <div>
          <vxe-table border show-overflow height="650" ref="xTable" :column-config="{ resizable: false }"
          :edit-config="{ trigger: 'manual', mode: 'row', showIcon:false }" :data="tableData" @checkbox-all="selectAllChangeEvent"
          @checkbox-change="selectChangeEvent">
              <vxe-column type="checkbox" width="50" align="center" />
              <vxe-column field="tm" title="需水上报时间" align="center">
              </vxe-column>
              <vxe-column field="spChanName" title="上级渠道名称" align="center">
              </vxe-column>
              <vxe-column field="chanName" title="渠道/分水口名称" align="center">
              </vxe-column>
              <vxe-column field="qirr" title="灌溉流量(m3/s)" align="center" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input-number type="number" v-model="row.qirr" min="0" @change="sumWreq(row, rowIndex)" @input="sumWreq(row, rowIndex)"></el-input-number>
                </template>
              </vxe-column>
              <vxe-column field="durationIrr" title="灌溉时长(小时)" align="center" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input-number type="number" v-model="row.durationIrr" min="0" @change="sumWreq(row, rowIndex)" @input="sumWreq(row, rowIndex)"></el-input-number>
                </template>
              </vxe-column>
              <vxe-column field="tmIrr" title="开闸时间" align="center" :edit-render="{}">
                <template #edit="{ row }">
                  <vxe-input type="datetime" v-model="row.tmIrr" placeholder="请选择时间" transfer></vxe-input>
                </template>
              </vxe-column>
              <vxe-column field="area" title="需水面积(亩)" align="center" :edit-render="{}">
                <template #edit="{ row }">
                  <el-input-number type="number" v-model="row.area" min="0"></el-input-number>
                </template>
              </vxe-column>
              <vxe-column field="wreq" title="毛灌溉需水量(m³)" :edit-render="{}" align="center">
                <template #edit="{ row }">
                  <el-input-number type="number" v-model="row.wreq" min="0"></el-input-number>
                </template>
              </vxe-column>
              <vxe-column title="操作" align="center" fixed="right" width="150" >
                  <template #default="{ row,rowIndex }" >
                    <template v-if="isActiveStatus(row)">
                        <vxe-button @click="saveRowEvent(row,rowIndex)" status="primary">保存</vxe-button>
                        <vxe-button @click="cancelRowEvent(row)">取消</vxe-button>
                    </template>
                    <template v-else>
                        <vxe-button @click="editRowEvent(row)" status="primary" :disabled="single" type="text" icon="vxe-icon-edit">编辑</vxe-button>
                        <vxe-button @click="handleDelete(row)" status="danger" :disabled="single" type="text" icon="vxe-icon-delete">删除</vxe-button>
                    </template>
                  </template>
              </vxe-column>
          </vxe-table>
          <vxe-pager
          :layouts="['Total','Sizes','PrevPage', 'Number', 'NextPage', 'FullJump']"
          :current-page="tablePage.pageNum"
          :page-size="tablePage.pageSize"
          style="margin-top: 10px"
          :total="tablePage.total"
          @page-change="handlePageChange"
          border
          background
        >
        </vxe-pager>
        </div>
        <el-dialog
          v-model="dialogVisible"
          title="新增"
          width="40%"
        >
        <span>需水上报时间：</span>
        <el-date-picker
          v-model="dataPick"
          type="date"
          value-format='YYYY-MM-DD'
          format ='YYYY-MM-DD'
          placeholder="选择日期">
        </el-date-picker>
        <p style="color: red;margin-left: 50px;" v-if="dateError">{{ dateErrorMsg }}</p>
        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="addTable">
              确定
            </el-button>
            <el-button @click="dialogVisible = false;dateError = false">
              关闭
            </el-button>
          </span>
        </template>
        </el-dialog>
    </div>
    
  </template>
  
  <script setup>
  import { getChannelList,gettableWreqDetail, updateWaterDemand, resultIwrWraReal,removeWreqDetail,removeBatchWreqDetail } from "@/api/scheSchemeData";
  import { ref, onMounted } from "vue";
  import dayjs from "dayjs";
  import { ElMessage } from "element-plus";

  const { proxy } = getCurrentInstance();
  const emits = defineEmits(['changeStep'])
  const xTable = ref()
  let tableData = ref([]);
  let dialogVisible = ref(false);
  let dateError = ref(false);
  let dateErrorMsg = ref('');
  const multiple = ref(true);
  const single = ref(false);
  let selectList = ref([]);
  let dataPick = ref(dayjs().format('YYYY-MM-DD'));
  const tablePage = reactive({
    total: 10,
    pageNum: 1,
    pageSize: 10,
  });
  let tmPlan = ref();
  
  onMounted(() => {
    getData()
  })
  watch(()=>dataPick.value,(val)=>{
    if (!val) {
      dateError.value = true;
      dateErrorMsg.value = '请选择日期';
    } else {
      dateError.value = false;
      dateErrorMsg.value = '';
    }
  })
  const addTable = () => {
    if(dataPick.value.length){
      resultIwrWraReal({ tm1: dataPick.value, tm2: dataPick.value }).then(res=>{
        if(res.success){
          ElMessage({
            message: '新增成功',
            type: 'success',
          });
          dialogVisible.value = false
          getData()
        }
      })
    }else{
      dateError.value = true;
      dateErrorMsg.value = '请选择日期';
    }
  }
  const sumWreq = (row, index) => {
    row.wreq = row.qirr * row.durationIrr * 3600;
  };
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
       const data = xTable.value.getTableData().tableData;
        const params = data.map(item => {
          const { _X_ROW_KEY, ...rest } = item
          return rest
        })
        updateWaterDemand(row).then(res => {
          if (res.success) {
            ElMessage({
              message: '操作成功',
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
  
  function handlePageChange({ currentPage, pageSize }) {
    tablePage.pageNum = currentPage;
    tablePage.pageSize = pageSize;
    getData();
  }
  //删除
  const handleDelete=(row)=>{
    proxy.$modal.confirm('是否确认删除数据吗？').then(function () {
      return removeWreqDetail(row);
    }).then(res => {
      if(res.success){
        getData();
        proxy.$modal.msgSuccess("删除成功");
      }
    }).catch(() => {});
  }
  //批量删除
  const handleBatchDelete=(row)=>{
    if(selectList.length === 0){
        ElMessage({
          message: '请选择要删除的数据',
          type: 'error',
        });
        return
    }
    proxy.$modal.confirm('是否确认删除数据吗？').then(function () {
      return removeBatchWreqDetail(selectList);
    }).then(res => {
      if(res.success){
        getData();
        proxy.$modal.msgSuccess("删除成功");
      }
    }).catch(() => {});
  }
  //全选
  const selectAllChangeEvent = ({checked})=>{
    const $table = xTable.value;
    if ($table) {
      const record = $table.getCheckboxRecords();
        selectList = record
        single.value = selectList.length != 0;
        multiple.value = !selectList.length;
    }
  }
    //单选
const selectChangeEvent = ({checked})=>{
  const $table = xTable.value;
  if ($table) {
    selectList = $table.getCheckboxRecords()
    single.value = selectList.length != 0;
    multiple.value = !selectList.length;
  }
}
  //查询操作
  const handleQuery =() =>{
    tablePage.pageNum = 1;
    getData();
  }
  
  //获取列表数据
  const getData = () => {
    const params = {
      pageNum: tablePage.pageNum,
      pageSize: tablePage.pageSize,
      tm: tmPlan.value
    }
    gettableWreqDetail(params).then(res => {
      if (res.success) {
        const list = res.data
        tableData.value = list.data;
        tablePage.total = list.total;
      }
    })
  }

  //获取渠道列表
  const getChannelData = () => {
    getChannelList({ pageNum: 1, pageSize: 9999 }).then(res => {
      if (res.success) {
        const list = res.data
        if (list && list.length > 0) {
          tableData.value = list.map(item => ({ ...item, allocCode: 'CASE_SLSB', iwrMaoUser: 0 }))
        } else {
          tableData.value = []
        }
      }
    })
  }

  </script>
  
  <style scoped>
  .btnBox{
    display: block;
    justify-content: flex-end;
    margin-bottom: 10px;
  }
  .footer {
    text-align: center;
    margin-top: 30px;
  }
  </style>