<template>
  <template v-if="visible">
    <div style="padding: 20px 20px;height: 100%;display: flex;flex-direction:column;overflow: auto">
      <div class="card-container">
        <div class="card-t">
          <li>
            <div class="lf">
              <i class="shuidi-ico"></i>
              <div class="detail-count">
                <h1>{{ top.manyYearAvgRainfall }}<span style="font-size: 12px">(万m³)</span></h1>
                <span>多年平均降水量</span>
              </div>
            </div>
            <div class="rg">
              <div class="year-max">
                <div class="tags">最大</div>
                <div class="content">
                  <span style="margin-right: 10px">{{ top.yearRainfallMaxDate }}年</span>
                  <span style="font-weight: bold">{{ top.yearRainfallMax }}(万m³)</span>
                </div>
              </div>
              <div class="year-min">
                <div class="tags">最小</div>
                <div class="content">
                  <span style="margin-right: 10px">{{ top.yearRainfallMinDate }}年</span>
                  <span style="font-weight: bold">{{ top.yearRainfallMin }}(万m³)</span>
                </div>
              </div>
            </div>
          </li>
          <li>
            <div class="lf">
              <i class="shuidi-ico"></i>
              <div class="detail-count">
                <h1>{{ top.manyYearAvgInflow }}<span style="font-size: 12px">(万m³)</span></h1>
                <span>多年平均来水量</span>
              </div>
            </div>
            <div class="rg">
              <div class="year-max">
                <div class="tags">最大</div>
                <div class="content">
                  <span style="margin-right: 10px">{{ top.yearInflowMaxDate }}年</span>
                  <span style="font-weight: bold">{{ top.yearInflowMax || 0 }}(万m³)</span>
                </div>
              </div>
              <div class="year-min">
                <div class="tags">最小</div>
                <div class="content">
                  <span style="margin-right: 10px">{{ top.yearInflowMinDate }}年</span>
                  <span style="font-weight: bold">{{ top.yearInflowMin || 0 }}(万m³)</span>
                </div>
              </div>
            </div>
          </li>
        </div>
        <div class="card-b">
          <li>
            <div class="top">
              <i class="shuidi-ico"></i>
              <span>本年已来水量</span>
            </div>
            <div class="bottom">
              <div class="lf">
                <div class="tags">降雨量</div>
                <h1>{{ top.yearRainfall || 0 }}<span style="font-size: 12px">(万m³)</span></h1>
              </div>
              <div class="rg">
                <div class="tags">来水量</div>
                <h1>{{ top.yearInflow || 0 }}<span style="font-size: 12px">(万m³)</span></h1>
              </div>
            </div>
          </li>
          <li>
            <div class="top">
              <i class="shuidi-ico"></i>
              <span>{{ dayjs().format('MM') }}月多年平均来水量</span>
            </div>
            <div class="bottom">
              <div class="lf">
                <div class="tags">降雨量</div>
                <h1>{{ top.monthRainfall || 0 }}<span style="font-size: 12px">(万m³)</span></h1>
              </div>
              <div class="rg">
                <div class="tags">来水量</div>
                <h1>{{ top.monthInflow || 0 }}<span style="font-size: 12px">(万m³)</span></h1>
              </div>
            </div>
          </li>
        </div>
      </div>
      <div style="background: #fff;flex: 1;padding: 20px 20px">
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
            :page-sizes="[10,20,30,40,50]"
            :total="total"
            @load="load"
            :column="2"
            width="45%"
            align="center"
            :before-open="beforeOpen"
            :before-close="beforeClose"
            label-width="110px"
            direction="vertical"
            @search="searchSubmit"
            @search-reset="searchReset"
            @submit="submit"
            @delete="deleteRow"
        >
          <!--          <template #menu-right="{ size }">-->
          <!--            <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>-->
          <!--          </template>-->
          <template #search-menu-right="{ size }">
            <el-button :size="size" type="primary" icon="Plus" plain @click="crudRef.openDialog('add')"
                       style="margin-left: 30px">制定新方案
            </el-button>
          </template>
          <template #table-forecastSdate="{row}">
            {{ row.planModule == 'MONTHLY' ? `${row.forecastSdate}` : row.forecastSdate }}
          </template>
          <template #form-menu-right="{ size }">
            <el-button
                :size="size"
                @click="crudRef.closeDialog()"
            >
              关闭
            </el-button>
          </template>
        </pro-crud>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="app-container">
      <div class="parameters">
        <div class="title">
          <span class="head-title" style="font-size: 18px">来水方案中长期预测</span>
          <el-button type="primary" link :icon="ArrowLeftBold" @click="visible = !visible;searchReset() ">返回</el-button>
        </div>
        <div class="settings-top">
          <el-form :model="currentPlan" ref="formRef" :rules="rules" :inline="true" label-width="100px">
            <el-form-item label="方案名称" prop="allocName">
              <el-input placeholder="请输入方案名称" v-model="currentPlan.allocName"/>
            </el-form-item>
            <el-form-item label="预报时段" prop="forecastDate">
              <el-date-picker
                  v-model="currentPlan.forecastDate"
                  value-format="YYYY-MM-DD"
                  type="daterange"
                  :clearable="false"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
              />
            </el-form-item>
<!--            <el-form-item label="预测区域" prop="unitCode">-->
<!--              <el-select v-model="currentPlan.unitCode" placeholder="请选择预测区域">-->
<!--                <el-option-->
<!--                    v-for="item in options1"-->
<!--                    :key="item.value"-->
<!--                    :label="item.label"-->
<!--                    :value="item.value"-->
<!--                />-->
<!--              </el-select>-->
<!--            </el-form-item>-->
          </el-form>
          <el-button type="primary" style="margin-left: 60px" @click="gotoSave">保存</el-button>
        </div>
        <div class="settings-content">
          <div class="lf">
            <div class="head-title">相似年法来水预测</div>
            <el-radio-group v-model="radios" style="display: flex;flex-direction: column;align-items: flex-start">
              <li style="margin-right: 10px">
                <el-radio label="0" size="large">给定雨量</el-radio>
                <div style="display: flex;align-items: center">
                  <span style="font-size: 13px;white-space: nowrap">预报雨量：</span>
                  <el-input :disabled="!(radios == 0)" type="number" min="0" v-model="planForm.givenForecastRainfall" placeholder="请输入预报雨量"/>
                  <span style="font-size: 13px;white-space: nowrap; margin-left: 4px;">mm</span>
                </div>
              </li>
              <li>
                <el-radio label="1" size="large">给定频率</el-radio>
                <div style="display: flex;align-items: center">
                  <span style="font-size: 13px;white-space: nowrap">来水频率(%)：</span>
                  <el-input-number
                      :disabled="!(radios == 1)"
                      style="width: 200px"
                      v-model="planForm.givenForecastFrequency"
                      placeholder="请输入来水频率"
                      :min="0"
                      :max="100"
                      controls-position="right"
                  />
                  <!-- <el-input :disabled="!(radios == 1)" v-model="planForm.givenForecastFrequency" placeholder="请输入来水频率"/> -->
                </div>
              </li>
            </el-radio-group>
            <div class="head-title" style="margin-top: 30px">降雨预报方法选择</div>
            <el-checkbox-group v-model="checkList1">
              <el-checkbox label="0">典型年法</el-checkbox>
            </el-checkbox-group>
            <div class="head-title" style="margin-top: 5px">来流预报方法选择</div>
            <el-checkbox-group v-model="checkList2">
              <el-checkbox label="0">径流系数法</el-checkbox>
            </el-checkbox-group>
          </div>
          <div class="center">
            <yearTable :planForm="planForm" :currentPlan="currentPlan" :visible="visible" ref="yearTableRef"
                       @handleActive="handleActive"/>
            <div style="display:flex;justify-content: space-between;align-items: center;margin-top: 8px">
              <span class="head-title">雨量预测结果</span>
              <span>年总量：<strong>{{ IncomingWater.rainResult?.rainfallTotal || 0 }}</strong>mm</span>
            </div>
            <div id="chartRes" ref="chartRes" style="height: 175px;background: #fff"></div>
          </div>
          <div class="rg">
            <li>
              <div style="display: flex;justify-content: start;margin-bottom: 10px;">
                <el-button :class="activeNum===3?'wait-click-btn':''" type="primary" @click="handleInflowWaterBtn">
                  来水计算
                </el-button>
                <el-button type="primary" @click="handleParamsSetting">参数设置</el-button>
                <el-button type="primary" @click="handleRunoffCoefficient">径流系数表</el-button>
              </div>
              <div id="chartWater" ref="chartFors" style="flex: 1;background: #fff"></div>
            </li>
            <div class="total-count">
              <span>
                降水量：
                <el-input style="width: 55%" disabled v-model="JsTotal.wMaoTotal">
                  <template #suffix>万m³</template>
                </el-input>
              </span>
              <span>
                来水量：
                <el-input style="width: 55%" disabled v-model="JsTotal.wJingTotal">
                  <template #suffix>万m³</template>
                </el-input>
              </span>
            </div>
            <li>
              <div style="display:flex;justify-content: space-between;align-items: center;">
                <span class="head-title">雨量预测结果</span>
              </div>
              <div id="chartFors" style="height: 255px;background: #fff">
                <el-table :data="slTableData" border height="255" style="width: 100%">
                  <el-table-column prop="name" label="时段" align="center"/>
                  <!--                  <el-table-column prop="rainfallValue" label="降水量值" align="center"  />-->
                  <el-table-column prop="runoffValue" label="来水量(万m³)" align="center"/>
                </el-table>
              </div>
            </li>
          </div>
        </div>
        <div class="settings-bottom">
          <span class="head-title">人工干预</span>
          <interTable ref="interTableRef" :currentPlan="currentPlan"/>
        </div>
      </div>
    </div>
  </template>
  <el-dialog  v-model="dialogVisible1"
              title="参数设置"
              draggable
              width="50%">
    <paramsSetting :currentPlan="currentPlan" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible1 = false">关闭</el-button>
        <el-button type="primary" @click="dialogVisible1 = false">确定</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog  v-model="dialogVisible2"
              title="参数设置"
              draggable
              width="50%">
    <runoffCoefficient :currentPlan="currentPlan" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible2 = false">关闭</el-button>
        <el-button type="primary" @click="dialogVisible2 = false">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import dayjs from "dayjs";
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineFormColumns,
  defineTableIndexColumns,
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
import {ref, reactive, onMounted, computed, watch} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import {ArrowLeftBold} from '@element-plus/icons-vue';
import {getUserList} from "@/api/waterManager/instManagement";
import yearTable from './comonents/yearTable';
import interTable from './comonents/interTable';
import paramsSetting from './comonents/paramsSetting';
import runoffCoefficient from './comonents/runoffCoefficientTable';
import {
  deleteInc,
  getAreaList,
  getInc,
  getTopStatistics,
  postCompute,
  postOptions,
  inflowWaterBtn,
  postPlan
} from "@/api/incomingWater";
import useIncomingWater from "@/store/modules/incomingWater";
import * as echarts from "echarts";
import {ElLoading} from "element-plus";
import useUserStore from '@/store/modules/user'

const IncomingWater = useIncomingWater();
let JsTotal = ref({wJingTotal: 0, wMaoTotal: 0});
let chartFors = ref();
const chartRes = ref();
let slTableData = ref([]);
const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  fixed: 'right',
  addText: '制定新方案',
  detail: false,
  reset: false,
  width: '180',
  addProps: {
    type: 'primary',
    plain: true,
    icon: 'Plus'
  },
  editProps: {
    link: true,
    type: 'primary',
    icon: 'Edit'
  },
  delProps: {
    link: true,
    type: 'danger',
    icon: 'Delete'
  },
  searchResetProps: {
    icon: "Refresh",
  },
  searchProps: {
    type: 'primary',
    icon: "Search",
  },
  delText: '删除',
  editText: '方案定制',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
});
const form = ref({date: '', planModule: 'YEARLY'});
const crudRef = ref();
const formRef = ref(null);
const serachForm = ref({});
let visible = ref(true);
let dialogVisible1 = ref(false);
let dialogVisible2 = ref(false);
let data = ref([]);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let interTableRef = ref()
let yearTableRef = ref()
let planForm = ref({
  methodGivenFrequency: '',  // 是否给定来水频率（1是，0否）
  methodGivenRainfall: '', // 是否给定面雨量（1是，0否）
  givenForecastFrequency: '',    //  预报期来水频率（小数）
  givenForecastRainfall: '',     // 预报期预报雨量（mm）
  methodFcstRainfallTypical: '',   // 典型年法 （1:是，0:否）
  methodFcstRunoffRpratio: '',   // 径流系数 （1是，0否）
})
let downloadLoadingInstance = null
const select1 = ref(null);
let radios = ref('0');
let input1 = ref('');
let input2 = ref('');
let checkList1 = ref(['0']);
let checkList2 = ref(['0']);
let options1 = ref([]);
let top = ref({});
let type = ref('year');
let activeNum = ref(0)
let rules = ref({
  allocName: [{required: true, message: '请输入方案名称'}],
  forecastDate: [{required: true, message: '请选择预报时段'}],
  unitCode: [{required: true, message: '请选择预测区域'}],
})
let currentPlan = ref({unitCode: '', allocName: '',allocCode:''});
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const userStore = useUserStore();
const columns = defineCrudColumns([
  {
    label: '方案名称',
    prop: 'allocName',
    component: 'el-input',
    props: {
      placeholder: '请输入方案名称',
    },
    form: true,
    search: true,
  },
  {
    label: '预报开始时间',
    prop: 'forecastSdate',
    props: {
      placeholder: '请选择预报开始时间',
    },
    search: false,
    form: true,
  },
  {
    label: '预报结束时间',
    prop: 'forecastEdate',
    props: {
      placeholder: '请选择预报结束时间',
    },
    search: false,
    form: true,
  },
  {
    label: '预报降水量(万m³)',
    prop: 'wrainFall',
    search: false,
    form: true,
  },
  {
    label: '预报来水量(万m³)',
    prop: 'wrunoff',
    search: false,
    form: true,
  },
  // {
  //   label: '预报年已降水量(万m³)',
  //   prop: 'winMao',
  //   search: false,
  //   form: true,
  // },
  // {
  //   label: '预报年已来水量(万m³)',
  //   prop: 'winJing',
  //   search: false,
  //   form: true,
  // },
  {
    label: '制定时间',
    prop: 'createTime',
    component: 'el-date-picker',
    props: {
      clearable: true,
      type: 'daterange',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      style: {width: '100%'},
      'value-format': "YYYY-MM-DD",
    },
    search: true,
    form: true,
  },
  {
    label: '制定人',
    prop: 'createBy',
    search: false,
    form: true,
  },
]);
const formColumns = defineFormColumns(computed(() => [
  {
    label: '方案名称',
    prop: 'allocName',
    component: 'el-input',
    props: {
      placeholder: '请输入方案名称',
    },
    rules: [{required: true, message: '请输入方案名称'}],
    md: 12,
  },
  {
    label: '计划类型',
    prop: 'planModule',
    component: 'pro-select',
    props: {
      placeholder: '请选择计划类型',
      onChange: onChange,
      data: [
        {value: 'YEARLY', label: '年计划'},
        {value: 'MONTHLY', label: '月计划'},
      ]
    },
    rules: [{required: true, message: '请选择计划类型'}],
    md: 12,
  },
  {
    label: '预报时段',
    prop: 'date',
    component: 'el-date-picker',
    props: {
      clearable: true,
      placeholder: '请选择预报时段',
      style: {width: '100%'},
      type: 'daterange',
      'start-placeholder': '开始时间',
      'end-placeholder': '结束时间',
      'value-format': 'YYYY-MM-DD'
    },
    rules: [{required: true, message: '请选择预报时段'}],
    md: 12,
  },
]));
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  console.log(row,type);
  if(row.givenForecastFrequency !=null){
    radios.value = '1'
  }else{
    radios.value = '0'
  }
  if (type === 'edit') {
    visible.value = !visible.value;
    currentPlan.value = row;
    currentPlan.value.unitCode = options1.value.length ? options1.value[0].value : '';
    const {forecastSdate, forecastEdate} = row || {}
    currentPlan.value.forecastDate = [forecastSdate, forecastEdate]
  } else {
    form.value = {};
    done();
  }
});

//点击来水计算按钮
const handleInflowWaterBtn = () => {
  handleSave()
  downloadLoadingInstance = ElLoading.service({text: "数据计算中，请稍候", background: "rgba(0, 0, 0, 0.7)",});
  inflowWaterBtn({caseCode: currentPlan.value.allocCode}).then(res => {
    if (res.success) {
      downloadLoadingInstance.close();
      activeNum.value = 0
      handleCompute();
      interTableRef.value.refresh();
    }
  }).catch(e => {
    downloadLoadingInstance.close();
  })
}
//保存左侧配置参数
const handleSave = (flag = false) => {
  const {forecastDate} = currentPlan.value
  postPlan({
    allocCode: currentPlan.value.allocCode,
    allocName: currentPlan.value.allocName,
    unitCode: currentPlan.value.unitCode,
    forecastSdate: forecastDate ? forecastDate[0] : '',
    forecastEdate: forecastDate ? forecastDate[1] : '',
    ...planForm.value
  }).then(res => {
    if (res.success) {
      if (flag) {
        ElMessage({
          message: '保存成功',
          type: 'success',
        });
      }
    }
  })
}
// 来水计算
const handleCompute = () => {
  postCompute({
    allocCode: currentPlan.value.allocCode,
    planModule: currentPlan.value.planModule,
    unitCode: currentPlan.value.unitCode
  }).then(res => {
    if (res.success) {
      const result = res.data;
      const chart1 = echarts.init(chartFors.value);
      const x = result.chartList.map(r => r.name);
      const series = [];
      const rainfallValue = result.chartList.map(r => r.rainfallValue || 0);
      const runoffValue = result.chartList.map(r => r.runoffValue || 0);
      series.push({
        name: '来水量',
        type: 'bar',
        tooltip: {
          valueFormatter: function (value) {
            return value + '万m³';
          }
        },
        data: runoffValue
      });
      chart1.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          }
        },
        grid: {
          left: '3%',
          right: '8%',
          bottom: '2%',
          top: '16%',
          containLabel: true
        },
        legend: {
          data: ['来水量']
        },
        xAxis: [
          {
            type: 'category',
            data: x,
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: {
          name: '万m³',
          type: 'value',
        },
        series: series
      });

      JsTotal.value.wJingTotal = result.wJingTotal;
      JsTotal.value.wMaoTotal = result.wMaoTotal;
      // 表格
      slTableData.value = result.tableList;
    }
  })
}

// 参数设置
const handleParamsSetting = () =>{
  dialogVisible1.value = true;
}
//径流系数表
const handleRunoffCoefficient = ()=>{
  dialogVisible2.value = true;
}

watch(visible, (v) => {
  if (!v) {
    //获取来水计算的数据
    handleCompute();
  }
})

watch(() => IncomingWater.rainResult, (rain) => {
  const chart2 = echarts.init(chartRes.value);
  const x = rain.chartList.map(r => r.tm);
  // const x = rain.chartList.map(r => dayjs(r.tm).format('YYYY-MM'));
  const series = [];
  const rainfallValue = rain.chartList.map(r => r.rainfall || 0);
  series.push({
    name: '雨量',
    type: 'bar',
    tooltip: {
      valueFormatter: function (value) {
        return value + ' mm';
      }
    },
    data: rainfallValue
  });
  chart2.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      }
    },
    grid: {
      left: '3%',
      right: '5%',
      bottom: '2%',
      top: '16%',
      containLabel: true
    },
    legend: {
      data: ['来水量', '降水量']
    },
    xAxis: [
      {
        type: 'category',
        data: x,
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: {
      name: 'mm',
      type: 'value',
    },
    series: series
  })
})

watch(() => currentPlan.value, (c) => {
  planForm.value.givenForecastRainfall = c.givenForecastRainfall;
  planForm.value.givenForecastFrequency = c.givenForecastFrequency;
  if (c.methodGivenRainfall == 1) { // 给定雨量
    radios.value = '0'
  }
  if (c.methodGivenFrequency == 1) {  // 给定频率
    radios.value = '1'
  }
  if (c.methodFcstRainfallTypical == 1) { // 降雨预报
    checkList1.value = ['0']
  }
  if (c.methodFcstRunoffRpratio == 1) { // 来流预报
    checkList2.value = ['0']
  }
})

watch(radios, (r) => {
  if (r == 0) { // 给定雨量
    planForm.value.methodGivenFrequency = 0;
    planForm.value.methodGivenRainfall = 1;
    // planForm.value.givenForecastFrequency = null;
  } else { // 给定频率
    planForm.value.methodGivenFrequency = 1;
    planForm.value.methodGivenRainfall = 0;
    planForm.value.givenForecastRainfall = null;
  }
  yearTableRef.value?.setActiveBtn(1);
}, {immediate: true})

watch(() => checkList1.value, (p) => {  // 降雨预报
  if (p.length) {
    planForm.value.methodFcstRainfallTypical = 1;
  } else {
    planForm.value.methodFcstRainfallTypical = 0;
  }
  yearTableRef.value?.setActiveBtn(1);
}, {immediate: true})

watch(() => checkList2.value, (r) => {  // 来流预报
  if (r.length) {
    planForm.value.methodFcstRunoffRpratio = 1;
  } else {
    planForm.value.methodFcstRunoffRpratio = 0;
  }
  yearTableRef.value?.setActiveBtn(1);
}, {immediate: true})

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
});

function onChange(v) {
  if (v === 'YEARLY') {
    type.value = 'year'
  } else {
    type.value = 'month'
  }
}

onMounted(() => {
  getData()
  getTopStatistics().then(res => {
    if (res.success) {
      top.value = res.data
    }
  })
  getAreaList().then(res => {
    if (res.success) {
      options1.value = res.data.map(r => ({label: r.unitName, value: r.unitCode}));
    }
  })
})


const getData = () => {
  const {allocName, createTime} = serachForm.value || {}
  getInc({
    allocName,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    startTime: createTime ? createTime[0] : '',
    endTime: createTime ? createTime[1] : '',
  }).then(res => {
    if (res.success) {
      data.value = res.data.data;
      total.value = res.data.total;
    }
  })
}

const searchSubmit = defineCrudSearch((done, isValid, invalidFields) => {
  getData();
  done();
});

const searchReset = () => {
  currentPage.value = 1;
  getData();
}


const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
  if (isValid) {
    if (type == 'add') {
      const {allocName, planModule, date} = form.value || {}
      const params = {
        allocName,
        planModule,
        forecastSdate: date && date[0],
        forecastEdate: date && date[1],
        createBy: userStore.realName
      };
      postOptions(params).then(res => {
        if (res.success) {
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    } else {

    }
  }
  done()
});


// 分页选择
const load = () => {
  getData()
}

const deleteRow = (row) => {
  ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    deleteInc({allocCode: row.allocCode}).then(res => {
      if (res.success) {
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    })
  })
};
const handleActive = (val) => {
  activeNum.value = val
}
const gotoSave = () => {
  formRef.value
      .validate()
      .then((flag) => {
        if (flag) {
          handleSave(true)
        }
      }).catch((err) => {
    console.log(err);
    ElMessage.error("请填写表单必填项");
  });
}
</script>

<style scoped lang="scss">
.wait-click-btn {
  box-shadow: 0 0 0 4px #81d3fc;
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

li {
  list-style-type: none;
}

.shuidi-ico {
  position: relative;
  display: inline-block;
  vertical-align: text-top;
  width: 50px;
  height: 50px;
  border-radius: 50px;
  margin-right: 10px;
  background: rgba(44, 155, 253, .3);

  &:after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: url("@/assets/images/shuiD.png") no-repeat center center;
    background-size: contain;
    display: block;
    height: 25px;
    width: 25px;
  }
}

.card-container {
  margin-bottom: 10px;

  .card-t {
    display: flex;
    width: 100%;

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 80px;
      padding: 10px 20px;
      flex: 1;
      background: #FFFFFF;
      border-radius: 6px;

      .lf, .rg {
        display: flex;
      }

      .year-max {
        margin-right: 30px;

        .tags {
          display: inline-block;
          color: #FC7F00;
          background: rgba(252, 127, 0, .1);
          padding: 0px 5px;
          border-radius: 15px;
        }

        .content {
          color: #FC7F00;
        }
      }

      .year-min {
        margin-right: 30px;

        .tags {
          display: inline-block;
          color: #57C777;
          background: rgba(87, 199, 119, .1);
          padding: 0px 5px;
          border-radius: 15px;
        }

        .content {
          color: #57C777;
        }
      }

      &:first-child {
        margin-right: 10px;
      }
    }
  }

  .card-b {
    display: flex;
    width: 100%;
    margin-top: 10px;

    li {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: space-between;
      height: 110px;
      padding: 10px 20px;
      flex: 1;
      background: #FFFFFF;
      border-radius: 6px;

      &:first-child {
        margin-right: 10px;
      }

      .top {
        display: flex;
        align-items: center;
        flex: 0.3;
        width: 100%;
        background: linear-gradient(270deg, rgba(51, 196, 255, 0) 0%, rgba(23, 145, 255, 0.2) 100%);
        border-radius: 25px;

        .shuidi-ico {
          width: 45px;
          height: 45px;
        }

        span {
          color: rgba(102, 102, 102, 1);
          font-size: 13px;
        }
      }

      .bottom {
        display: flex;
        align-items: center;
        justify-content: space-around;
        flex: 0.6;
        width: 100%;

        .lf, .rg {
          display: flex;
          align-items: center;

          h1 {
            margin-bottom: 0;
            margin-left: 10px;
          }
        }

        .tags {
          background: rgba(23, 145, 255, .1);
          padding: 2px 8px;
          font-size: 12px;
          border-radius: 15px;
          font-weight: bold;
          color: #1791FF;
        }
      }
    }
  }
}

.parameters {
  display: flex;
  flex-direction: column;

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

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

  .settings-top {
    display: flex;
    margin: 10px 0;

    li {
      display: flex;
      align-items: center;

      span {
        white-space: nowrap;
      }
    }
  }

  .settings-content {
    display: flex;
    height: 630px;

    .lf {
      flex: 0.2;
      padding: 15px;
      background: #F4F8FB;
      border-radius: 14px;
    }

    .center {
      flex: 0.5;
      padding: 15px;
      margin: 0 10px;
      background: #F4F8FB;
      border-radius: 14px;
    }

    .rg {
      display: flex;
      flex-direction: column;
      flex: 0.3;
      padding: 15px;
      background: #F4F8FB;
      border-radius: 14px;

      li {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .total-count {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;

        span {
          flex: 1;
        }
      }
    }
  }

  .settings-bottom {
    flex: 1;
    margin-top: 8px;
  }
}
</style>