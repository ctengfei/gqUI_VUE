<template>
    <div class="app-container" v-if="visible">
        <div style="align-items: center;justify-content: space-between; margin-bottom: 20px;">
            <div class="head-title" style="border-bottom: rgb(230, 230, 230) 1px solid;">水动力模型方案</div>
            <span></span>
        </div>
        <pro-crud
        ref="crudRef"
        v-model="form"
        v-model:search="serachForm"
        :columns="columns"
        :form-columns="formColumns"
        :gutter="20"
        :menu="menu"
        :data="data"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        layout="->,total,sizes,prev, pager, next, jumper"
        background
        :page-sizes="[10, 20, 30, 40, 50]"
        :total="total"
        @load="load"
        draggable
        column="2"
        width="40%"
        align="center"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit"
        >
        <template #form-menu-right="{ size }">
            <el-button :size="size" @click="crudRef.closeDialog()">
            关闭
            </el-button>
        </template>
        <template #search-menu-right="{ size }">
            <el-button
            style="margin-left: 30px"
            type="primary"
            plain
            icon="Plus"
            @click="crudRef.openDialog('add')"
            >新增方案
            </el-button>
            <el-button
            type="primary"
            plain
            icon="Setting"
            @click="dialogVisible1 = true"
            >参数设置</el-button
            >
        </template>
        <template #form-a-label>
            <span class="head-title">方案设置</span>
        </template>
        <template #form-b-label>
            <span class="head-title">模型设置</span>
        </template>
        <template #menu="{ size, row }">
            <!-- <el-button
            :size="size"
            type="primary"
            link
            icon="Search"
            @click="crudRef.openDialog('detail', row)"
            >
            闸门启闭情况设置
            </el-button> -->
            <el-button
            :size="size"
            type="primary"
            link
            icon="Search"
            @click="hadleSearchPlan(row)"
            >
            查看方案
            </el-button>
            <el-button
            :size="size"
            type="success"
            icon="Search"
            link
            @click="handleSearch(row)"
            >
            详情
            </el-button>
            <el-button
            v-if="row.caseCode != 'DEFAULT'"
            :size="size"
            type="danger"
            link
            icon="Delete"
            @click="deleteRow(row)"
            >
            删除
            </el-button>
        </template>
        <template #table-ifForecast="{ row }">
            {{ row.ifForecast ? "是" : "否" }}
        </template>
        <template #crud-detail="{ props, columns, size }">
            <pro-form
            label-width="140px"
            width="30%"
            style="margin-top: 20px"
            v-model="detailForm"
            @reset="crudRef.closeDialog()"
            :menu="detailMenu"
            :columns="detailColumns"
            @submit="formSubmit"
            >
            
            </pro-form>
        </template>
        </pro-crud>

        <el-dialog
        v-model="dialogVisible"
        title="详情"
        width="70%"
        class="l-dialog"
        >
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="渠道演进结果" name="1">
                <div class="filter-result">
                <span>渠道选择：</span>
                <el-select v-model="chanModel" @change="channelChanges">
                    <el-option
                    v-for="item in chanCodeList"
                    :key="item.chanCode"
                    :label="item.chanName"
                    :value="item.chanCode"
                    />
                </el-select>
                <div>
                    <span style="margin-left: 30px">断面选择：</span>
                    <el-select v-model="bnchModel" @change="bnthChanges">
                    <el-option
                        v-for="item in bnchList"
                        :key="item.bnch"
                        :label="item.bnch"
                        :value="item.bnch"
                    />
                    </el-select>
                </div>
                </div>
                <div class="content">
                <div class="lf">
                    <el-table
                    :data="channelTable"
                    style="margin-top: 10px"
                    height="430"
                    border
                    >
                    <el-table-column prop="q" label="预报流量(m³/s)" align="center" />
                    <el-table-column prop="z" label="预报水位(m)" align="center" />
                    <el-table-column
                        prop="tm"
                        label="时间"
                        align="center"
                        :formatter="formatter"
                    />
                    <!--          <el-table-column prop="name3" label="实测水位(m)" align="center" />-->
                    </el-table>
                </div>
                <div class="rg" ref="chart1"></div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="闸门水位、流水结果" name="2">
                <div class="filter-result">
                <span>闸门：</span>
                <el-select v-model="gateModel" @change="gateChanges">
                    <el-option
                    v-for="item in gateDialList"
                    :key="item.wraRepCd"
                    :label="item.wraRepNm"
                    :value="item.wraRepCd"
                    />
                </el-select>
                </div>
                <div class="content">
                    <div class="lf">
                    <el-table
                        :data="gateTable"
                        style="margin-top: 10px"
                        height="430"
                        border
                    >
                        <el-table-column
                        prop="tm"
                        label="时间"
                        align="center"
                        :formatter="formatter"
                        />
                        <el-table-column prop="q" label="预报流量(m³/s)" align="center" />
                        <el-table-column prop="zup" label="闸前预报水位(m)" align="center" />
                        <el-table-column prop="zdown" label="闸后预报水位(m)" align="center" />
                    </el-table>
                    </div>
                    <div class="rg" ref="chart2"></div>
                </div>
            </el-tab-pane>
        </el-tabs>
        <template #footer>
            <span class="dialog-footer">
            <el-button type="primary" @click="dialogVisible = false">
                关闭
            </el-button>
            </span>
        </template>
        </el-dialog>
    </div>
    <hydrodyModelSet v-model:dialogVisible="dialogVisible1" />
    <div class="app-container" style="display: flex;flex-direction: column" v-if="!visible">
        <realtimeFor v-model:visible="visible" :planCode="planCode" :selectType='selectType' :select1='select1'/>
    </div>
</template>

<script setup>
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineFormColumns,
  defineTableIndexColumns,
  defineCrudBeforeOpen,
  defineCrudBeforeClose,
  defineFormSubmit,
} from "element-pro-components";
import { ref, reactive, onMounted, watch, defineProps, defineEmits } from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import realtimeFor from '../schSetting/components/realtimeFor';
import {
  deletePlan,
  getHdList,
  getHdTable,
  getPlanList,
  getShList,
  getShTable,
  getParamHydrostartList,
  addParamHydrostart,
  editParamHydrostart,
  delParamHydrostart,
  getGateList,
  getGateListDefault,
  updateGateListDefault,
  getBnchHydroList,
  getBnchHydroSluiceList,
  getChanList,
} from "@/api/schedulingCtord/schSetting";
import {
  getBasinBachList,
  getRainTable,
  getChaneParmList,
  getSluiceList
} from "@/api/schedulingCtord/realtimeFor";
import * as echarts from "echarts";
import hydrodyModelSet from "../schSetting/components/hydrodyModelSet";
let emit = defineEmits(['getVisible'])

const menu = defineCrudMenuColumns({
  label: "操作",
  add: false,
  edit: false,
  del: false,
  fixed: "right",
  addText: "新增方案",
  detail: true,
  reset: false,
  width: "250",
  addProps: {
    type: "primary",
    plain: true,
    icon: "Plus",
  },
  editProps: {
    link: true,
    type: "primary",
    icon: "Edit",
  },
  delProps: {
    link: true,
    type: "danger",
    icon: "Delete",
  },
  searchResetProps: {
    icon: "Refresh",
  },
  searchProps: {
    type: "primary",
    icon: "Search",
  },
  detailProps: {
    link: true,
    type: "primary",
    icon: "Search",
  },
  delText: "删除",
  editText: "",
  searchText: "搜索",
  searchResetText: "重置",
  submitText: "确定",
  resetText: "取消",
  detailText: "闸门启闭情况设置",
});
const form = ref({
  caseName: "",
  caseCodeFlood: "",
  starttime: "",
  spin: "1",
  spin2: "2",
  endtime: "",
  hydroStep: "",
  outputStep: "",
  extendTime: 48
});
let detailForm = ref({})
const crudRef = ref();
const serachForm = ref({});
let activeName = ref("1");
const detailMenu = defineCrudMenuColumns({
  submitText: "确定",
  submit: true,
  reset: true,
  resetText: "关闭",
});

const chart1 = ref(null);
const chart2 = ref(null);
let data = ref([]);
let dialogVisible = ref(false);
let dialogVisible1 = ref(false);
let dialogVisible2 = ref(false);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const select1 = ref("0"); // 预报单元
const options1 = ref(dictStore.getDict("IRR_FLOOD_FORECAST_UNIT")); // 预报单元
let select2 = ref(""); // 预报河段
let options2 = ref([]); // 预报河段
const radio1 = ref(""); //山洪片区
let radios1 = ref([]); //山洪片区
let tableData1 = ref([]);
let tableData2 = ref([]);
let currentRow = ref(null);
let rvskCode = ref("");
let visible = ref(true);
let visibleModel = ref(true);
let planArr = ref([]);
let planCode = ref("");
let gateArr = ref([]);
let gateDialList = ref([]);
let bnchList = ref([]);
let gateModel = ref("");
let bnchModel = ref("");
let chanModel = ref("");
let chanCodeList = ref([]);
let channelTable = ref([]);
let gateTable = ref([]);
let selectType = ref(0);
// 闸门开度列表
let gataSelectArr = ref([
  {
    label: '0',
    value: 0,
  },
  {
    label: '10%',
    value: 0.1,
  },
  {
    label: '20%',
    value: 0.2,
  },
  {
    label: '30%',
    value: 0.3,
  },
  {
    label: '40%',
    value: 0.4,
  },
  {
    label: '50%',
    value: 0.5,
  },
  {
    label: '60%',
    value: 0.6,
  },
  {
    label: '70%',
    value: 0.7,
  },
  {
    label: '80%',
    value: 0.8,
  },
  {
    label: '90%',
    value: 0.9,
  },
  {
    label: '100%',
    value: 1,
  },
])


const columns = defineCrudColumns([
  {
    label: "方案名称",
    prop: "caseName",
    component: "el-input",
    props: {
      placeholder: "请输入方案名称",
    },
    search: true,
  },
  {
    label: "山洪方案",
    prop: "caseName",
  },
  {
    label: "开始时间",
    prop: "starttime",
  },
  {
    label: "结束时间",
    prop: "endtime",
  },
  {
    label: "计算时间步长(s)",
    prop: "hydroStartStep",
  },
  {
    label: "输出结果时间步长",
    prop: "hydroStartoutStep",
  },
  {
    label: "预热期长度",
    prop: "spin",
  },
  {
    label: "预热期长度1",
    prop: "spin2",
  },
  {
    label: "创建人",
    prop: "createBy",
  },
]);
const formColumns = defineFormColumns(computed(()=>[
  {
    label: "方案设置",
    prop: "a",
    type: "group",
    children: [
      {
        label: "方案名称",
        prop: "caseName",
        component: "el-input",
        props: {
          placeholder: "请输入方案名称",
        },
        rules: [{ required: true, message: "请输入方案名称" }],
        md: 12,
      },
      {
        label: "山洪方案",
        prop: "caseCodeFlood",
        component: "pro-select",
        props: {
          clearable: true,
          data: planArr.value,
          config: {value: 'caseCode', label: 'caseName'},
          style: { width: "100%" },
          onChange: (val) => {
            let temp = planArr.value.filter(item=>item.caseCode == val)[0];
            form.value.starttime = temp.forecastSTime;
            form.value.endtime = temp.forecastETime;
          }
        },
        rules: [{ required: true, message: "请选择山洪方案" }],
        md: 12,
      },
      {
        label: "开始时间",
        prop: "starttime",
        component: "el-date-picker",
        rules: [{ required: true, message: "请选择开始时间" }],
        props: {
          clearable: true,
          style: { width: "100%" },
          type: "datetime",
          "value-format": "YYYY-MM-DD HH:mm",
          format: "YYYY-MM-DD HH:mm",
          placeholder: "请选择开始时间",
          onChange: (val) => {
            form.value.endtime = dayjs(val)
              .add(form.value.spin, "hour")
              .format("YYYY-MM-DD HH:mm");
          },
        },
        md: 12,
      },
      {
        label: "结束时间",
        prop: "endtime",
        component: "el-date-picker",
        rules: [{ required: true, message: "请选择结束时间" }],
        props: {
          clearable: true,
          style: { width: "100%" },
          type: "datetime",
          disabled: false,
          "value-format": "YYYY-MM-DD HH:mm",
          format: "YYYY-MM-DD HH:mm",
          placeholder: "结束时间",
        },
        md: 12,
      },
    ],
  },
  {
    label: "模型设置",
    prop: "b",
    type: "group",
    children: [
      {
        label: "计算时间步长(秒)",
        prop: "hydroStep",
        component: "el-input-number",
        props: {
          style: { width: "100%" },
        },
        rules: [{ required: true, message: "请输入计算时间步长" }],
        md: 12,
      },
      {
        label: "输出结果时间步长(秒)",
        prop: "outputStep",
        component: "el-input-number",
        props: {
          style: { width: "100%" },
        },
        rules: [{ required: true, message: "请输入输出结果时间步长" }],
        md: 12,
      },
      {
        label: "预热期长度(小时)",
        prop: "spin",
        component: "el-input-number",
        rules: [{ required: true, message: "预热期长度" }],
        props: {
          min: 0,
          onChange: (val) => {
            form.value.endtime = dayjs(form.value.starttime)
              .add(val, "hour")
              .format("YYYY-MM-DD HH:mm");
          },
          placeholder: "预热期长度",
          style: { width: "100%" },
        },
        md: 12,
      },
      {
        label: "预热期长度1(小时)",
        prop: "spin2",
        component: "el-input-number",
        rules: [{ required: true, message: "预热期长度1" }],
        props: {
          min: 0,
          onChange: (val) => {
            form.value.endtime = dayjs(form.value.starttime)
              .add(val, "hour")
              .format("YYYY-MM-DD HH:mm");
          },
          placeholder: "预热期长度1",
          style: { width: "100%" },
        },
        md: 12,
      },
      {
        label: "延长期长度(小时)",
        prop: "extendTime",
        component: "el-input-number",
        rules: [{ required: true, message: "延长期长度" }],
        props: {
          min: 0,
          placeholder: "延长期长度",
          style: { width: "100%" },
        },
        md: 12,
      }
    ],
  },
]));

const detailColumns = defineFormColumns(computed(()=>[
  
      {
        label: "闸门名称",
        prop: "wraRepCd",
        component: "pro-select",
        props: {
          placeholder: "请选择闸门名称",
          clearable: true,
          data: gateArr.value,
          config: {value: 'wraRepCd', label: 'wraRepNm'},
          style: { width: "100%" },
          onChange: getGateDefault
        },
        rules: [{ required: true, message: "请输入闸门名称" }],
        
      },
      {
        label: "开始时间",
        prop: "startTime",
        component: "el-date-picker",
        rules: [{ required: true, message: "请选择开始时间" }],
        props: {
          clearable: true,
          style: { width: "100%" },
          type: "datetime",
          "value-format": "YYYY-MM-DD HH:mm",
          format: "YYYY-MM-DD HH:mm",
          placeholder: "请选择开始时间",
        },
        md: 12,
      },
      {
        label: "结束时间",
        prop: "endTime",
        component: "el-date-picker",
        rules: [{ required: true, message: "请选择结束时间" }],
        props: {
          clearable: true,
          style: { width: "100%" },
          type: "datetime",
          "value-format": "YYYY-MM-DD HH:mm",
          format: "YYYY-MM-DD HH:mm",
          placeholder: "请选择结束时间",
        },
        md: 12,
      },
      {
        label: "控制闸门开度",
        prop: "status",
        component: "pro-select",
        rules: [{ required: true, message: "请输入控制闸门开度" }],
        props: {
          data: gataSelectArr.value,
          placeholder: "请选择控制闸门开度",
          style: { width: "100%" },
        },
      },
      {
        label: "控制闸门边界",
        prop: "bound",
        component: "el-input-number",
        rules: [{ required: true, message: "请输入控制闸门边界" }],
        props: {
          placeholder: "请输入控制闸门边界",
          style: { width: "100%" },
        },
      }
]));

const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  console.log()
  if (type === "detail") {
    getGateListFun();
    detailForm.value.caseCode = row.caseCode;
  } else{
    form.value = {
      caseName: "",
      caseCodeFlood: "",
      starttime: "",
      spin: "12",
      spin2: "6",
      endtime: "",
      hydroStep: "600",
      outputStep: "3600",
      extendTime: "48",
    };
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done, type) => {
  form.value = {};
  detailForm.value = {};
  done();
});

const formatter = (row) => {
  return dayjs(row.tm).format("MM-DD HH");
};

onMounted(() => {
  getData();
  // 获取山洪方案
  getPlanList(
    {
      pageNum: 1,
      pageSize: 100,
    }
  ).then(res=>{
    planArr.value = res.data.data;
  })

  // 获取渠道列表
  getChanList().then(res=>{
    if(res.success) {
      chanCodeList.value = res.data;
      chanModel.value = res.data[0].chanCode;
    }
  })

  // 渠道断面列表
  getChaneParmList().then(res=>{
    if(res.success){
      bnchList.value = res.data.parmRoughnessHydraulicVOs;
      bnchModel.value = res.data.parmRoughnessHydraulicVOs[0].bnch
    }
  })
  // 闸门列表
  getSluiceList().then(res=>{
    if(res.success){
      gateDialList.value = res.data.data;
      gateModel.value = res.data.data[0].wraRepCd;
    }
  })
});


// 渠道下拉选择
const channelChanges = () =>{
  getBnchChannel();
}

// 断面下拉选择
const bnthChanges = () => {
  getBnchChannel();
}

// 闸门下拉选择
const gateChanges = () => {
  getGateTable();
}

// 渠道演进结果
const getBnchChannel = () => {
  getBnchHydroList(
    {
      caseCode: currentRow.value.caseCode,
      bnch: bnchModel.value,
      chanCode: chanModel.value,
      planStartTime:currentRow.value.starttime,
      planEndTime:currentRow.value.endtime
    }
  ).then(res=>{
    if(res.success){
      channelTable.value = res.data
      const x = res.data.map((r) => dayjs(r.tm).format("MM-DD HH"));
        const line1 = res.data.map((r) => r.z); //水位
        const line2 = res.data.map((r) => r.q); // 流量
        const series = [
          {
            name: "水位",
            type: "line",
            yAxisIndex: 0,
            tooltip: {
              valueFormatter: function (value) {
                return value + " m";
              },
            },
            data: line1,
          },
          {
            name: "流量",
            type: "line",
            yAxisIndex: 1,
            tooltip: {
              valueFormatter: function (value) {
                return value + " m³/s";
              },
            },
            data: line2,
          },
        ];
        const chart = echarts.init(chart1.value);
        chart.setOption({
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross",
            },
          },
          grid: {
            left: "5%",
            right: "5%",
            bottom: "0%",
            top: "10%",
            containLabel: true,
          },
          legend: {},
          xAxis: [
            {
              type: "category",
              data: x,
              boundaryGap: false,
              axisPointer: {
                type: "shadow",
              },
            },
          ],
          yAxis: [
            {
              name: "水位(m)",
              type: "value",
            },
            {
              name: "流量(m³/s)",
              type: "value",
              alignTicks: true,
              inverse: true,
              nameLocation: "start",
            },
          ],
          series: series,
        });
    }
  })
}

// 
const getGateTable = () => {
  getBnchHydroSluiceList(
    {
      caseCode: currentRow.value.caseCode,
      wraRepCd: gateModel.value,
    }
  ).then(res=>{
      if(res.success){
        gateTable.value = res.data.data;
        const x = res.data.data.map((r) => dayjs(r.tm).format("MM-DD HH"));
        const line0 = res.data.data.map((r) => r.zup); //闸前水位
        const line1 = res.data.data.map((r) => r.zdown); //闸后水位
        const line2 = res.data.data.map((r) => r.q); // 流量
        const series = [
          {
            name: "闸前水位",
            type: "line",
            yAxisIndex: 0,
            tooltip: {
              valueFormatter: function (value) {
                return value + " m";
              },
            },
            data: line0,
          },
          {
            name: "闸后水位",
            type: "line",
            yAxisIndex: 0,
            tooltip: {
              valueFormatter: function (value) {
                return value + " m";
              },
            },
            data: line1,
          },
          {
            name: "流量",
            type: "line",
            yAxisIndex: 1,
            tooltip: {
              valueFormatter: function (value) {
                return value + " m³/s";
              },
            },
            data: line2,
          },
        ];
        const chart = echarts.init(chart2.value);
        chart.setOption({
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross",
            },
          },
          grid: {
            left: "5%",
            right: "5%",
            bottom: "0%",
            top: "10%",
            containLabel: true,
          },
          legend: {},
          xAxis: [
            {
              type: "category",
              data: x,
              boundaryGap: false,
              axisPointer: {
                type: "shadow",
              },
            },
          ],
          yAxis: [
            {
              name: "闸前水位(m)",
              type: "value",
            },
            {
              name: "闸后水位(m)",
              type: "value",
            },
            {
              name: "流量(m³/s)",
              type: "value",
              alignTicks: true,
              inverse: true,
              nameLocation: "start",
            },
          ],
          series: series,
        });
      }
  })
}


// 方案计算结果
const handleSearch = (row) => {
  
  currentRow.value = row;
  console.log(currentRow.value,'currentRow.value')
  dialogVisible.value = true;
  getBnchChannel();
  getGateTable();
};

//查看单个方案
const hadleSearchPlan = (row) => {
  selectType.value = 1;
  select1.value = 1;
  visible.value = false;
  planCode.value = row.caseCode;
};

// 查看闸门启闭情况
const hadleGateSetting = (row) => {
  
};

// 获取闸门列表
const getGateListFun = () => {
  getGateList().then(res=>{
    gateArr.value = res.data
  })
}

// 获取闸门设置默认值
const getGateDefault = (val) => {
  let tempArr = gateArr.value.filter(item=>item.wraRepCd == val);
  getGateListDefault({ ...detailForm.value }).then(res=>{
    if(res.data){
      detailForm.value.wraRepNm = tempArr[0].wraRepNm
      detailForm.value = {...detailForm.value, status: res.data.status, bound: res.data.bound}
    }else{
      detailForm.value = {}
    }
  })
}

const getData = () => {
  getParamHydrostartList({
    ...serachForm.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
  }).then((res) => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  });
};

const searchSubmit = defineCrudSearch((done, isValid, invalidFields) => {
  getData();
  done();
});

const searchReset = () => {
  currentPage.value = 1;
  getData();
};

// 闸门启闭修改默认值
const formSubmit = defineFormSubmit((done, isValid, invalidFields)=>{
  if (isValid) {
    updateGateListDefault({ ...detailForm.value }).then(res=>{
      if(res.success) {
        ElMessage({
            message: "修改成功",
            type: "success",
          });
        detailForm.value = {}
        getData();
        crudRef.value.closeDialog();
        
      }
    })
  }
  done();
});

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == "add") {
      addParamHydrostart({ ...form.value }).then((res) => {
        if (res.success) {
          ElMessage({
            message: "添加成功",
            type: "success",
          });
          getData();
          close();
        }
      });
    } else {
    }
  }
  done();
});

// 分页选择
const load = () => {
  getData();
};

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    if (row.caseCode == "DEFAULT") {
      ElMessage({
        message: "默认方案不允许删除",
        type: "warning",
      });
      return;
    } else {
      delParamHydrostart(row.caseCode).then((res) => {
        if (res.success) {
          getData();
          ElMessage({
            message: "删除成功",
            type: "success",
          });
        }
      });
    }
  });
};
</script>

<style scoped lang="scss">
:deep(.l-dialog .el-dialog__body) {
  height: 560px !important;
  padding-bottom: 0;
  padding-top: 15px !important;
}

:deep(.el-dialog__body) {
  padding-top: 0;
}
.boxContent {
  display: flex;
  justify-content: space-between;
  .flasFlood {
    width: 49%;
  }
  .hydrodyModel {
    width: 49%;
  }
}

.l-dialog {
  .filter-result {
    display: flex;
    align-items: center;
  }

  .content {
    display: flex;
    height: calc(100% - 32px);
    margin-top: 6px;

    .lf {
      width: 600px;
      margin-right: 10px;
    }

    .rg {
      flex: 1;
    }
  }
}

:deep(.pro-group-form-title) {
  font-size: 20px;
}

.head-title {
  display: block;
  width: 100%;
  border-bottom: 2px dotted;
}
.head-titles {
  display: block;
  width: 100%;
}

.head-title:after {
  height: 15px !important;
}

</style>