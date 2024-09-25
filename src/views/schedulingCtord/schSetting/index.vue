<template>
  <div class="" v-if="visible">

    <!-- <div  class="boxContent"> -->
      <div class="app-container">
        <div class="head-title" style="border:0;margin-bottom: 10px;border-bottom: 1px solid #e6e6e6;"><span>山洪模型方案</span></div>
        <pro-crud
            ref="crudRef"
            v-model="form"
            v-model:search="serachForm"
            :columns="columns"
            :form-columns="formColumns"
            :edit-columns="editColumns"
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
            draggable
            column="2"
            width="60%"
            align="center"
            :before-open="beforeOpen"
            :before-close="beforeClose"
            label-width="190px"
            direction="vertical"
            @search="searchSubmit"
            @search-reset="searchReset"
            @submit="submit"

        >
          <template #form-menu-right="{ size }">
            <el-button
                :size="size"
                @click="crudRef.closeDialog()"
            >
              关闭
            </el-button>
          </template>
          <template #search-menu-right="{ size }">
            <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增方案
            </el-button>
            <el-button type="info" plain icon="Setting" @click="dialogVisible1 = true">参数设置</el-button>
          </template>
          <template #form-a-label>
            <span class="head-title">方案设置</span>
          </template>
          <template #form-b-label>
            <span class="head-title">模型设置</span>
          </template>
          <template #menu="{ size,row }">
            <el-button
                :size="size"
                type="warning"
                link
                icon="Search"
                @click="hadleSearchPlan(row)"
            >
              查看
            </el-button>
            <el-button
                :size="size"
                type="success"
                icon="View"
                link
                @click="handleSearch(row)"
            >
              结果详情
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
          <template #table-ifForecast="{row}">
            {{ row.ifForecast ? '是' : '否' }}
          </template>
          <template #crud-detail="{ props, columns, size }">
            <pro-form
                label-width="190px"
                v-model="form"
                @reset="crudRef.closeDialog()"
                :menu="detailMenu"
                :columns="detailColumns"
            >
              <template #form-a-label>
                <span class="head-title">方案设置</span>
              </template>
              <template #form-b-label>
                <span class="head-title">模型设置</span>
              </template>
            </pro-form>
          </template>
          <template #crud-edit="{ props, columns, size }">
            <pro-form
                label-width="190px"
                v-model="form"
                @reset="crudRef.closeDialog()"
                :menu="editMenu"
                :columns="editColumns"
            >
              <template #form-a-label>
                <span class="head-title">方案设置</span>
              </template>
              <template #form-b-label>
                <span class="head-title">模型设置</span>
              </template>
            </pro-form>
          </template>
        </pro-crud>
      </div>
      <!-- <div class="hydrodyModel app-container">
        <hydrodyMedol @getVisible="handerVisible" />
      </div> -->
    <!-- </div> -->
    
    
    <el-dialog
        v-model="dialogVisible"
        title="方案计算结果"
        width="70%"
        class="l-dialog"
    >
      <!-- <div class="filter-result">
        <span>预报单元：</span>
        <el-select v-model="select1">
          <el-option
              v-for="item in options1"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
        <div v-show="select1 == 1">
          <span style="margin-left: 30px">断面选择：</span>
          <el-select v-model="select2">
            <el-option
                v-for="item in options2"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </div>
      </div> -->
      <div class="content" v-show="select1 == 0">
        <div class="lf">
          <el-tabs v-model="radio1">
            <el-tab-pane v-for="sh in radios1" :label="sh.label" :name="sh.value" :key="sh"></el-tab-pane>
          </el-tabs>
          <el-table :data="tableData1" style="margin-top: 10px" height="430" border>
            <el-table-column prop="p" label="时段面雨量(mm)" align="center"/>
            <!-- <el-table-column prop="ii" label="时段净雨量(mm)" align="center"/> -->
            <el-table-column prop="qnat" label="预报流量(m³/s)" align="center"/>
            <el-table-column prop="tm" label="时间" align="center" :formatter="formatter"/>
          </el-table>
        </div>
        <div class="rg" ref="chart1">
        </div>
      </div>
      <div class="content" v-show="select1 == 1">
        <div class="lf">
          <el-table :data="tableData2" style="margin-top: 10px" height="430" border>
            <el-table-column prop="q" label="预报流量(m³/s)" align="center"/>
            <el-table-column prop="z" label="预报水位(m)" align="center"/>
            <el-table-column prop="tm" label="时间" align="center" :formatter="formatter"/>
            <!--          <el-table-column prop="name3" label="实测水位(m)" align="center" />-->
          </el-table>
        </div>
        <div class="rg" ref="chart2"></div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">
            关闭
          </el-button>
        </span>
      </template>
    </el-dialog>
    <paramsDialog v-model:dialogVisible="dialogVisible1"/>
  </div>
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
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
import {formatterVal} from '@/utils';
import {ref, reactive, onMounted, watch} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import paramsDialog from './components/paramsDialog'
import realtimeFor from './components/realtimeFor';
import dayjs from "dayjs";
import {deletePlan, getHdList, getHdTable, getPlanList, getShList, getShTable} from "@/api/schedulingCtord/schSetting";
import {getBasinBachList, getRainTable} from "@/api/schedulingCtord/realtimeFor";
import * as echarts from "echarts";
import {addPlan,putPlan} from "@/api/schedulingCtord/predOptions";
import hydrodyMedol from "./hydrodyMedol"

const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del: false,
  fixed: 'right',
  addText: '新增方案',
  detail: false,
  reset: false,
  width: '310',
  addProps: {
    type: 'primary',
    plain: true,
    icon: "Plus",
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
  detailProps: {
    link: true,
    type: 'primary',
    icon: 'Search'
  },
  delText: '删除',
  editText: '编辑',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
  detailText: '查看'
});
const detailMenu = defineCrudMenuColumns({
  submit: false,
  reset: true,
  resetText: '关闭'
});
const editMenu = defineCrudMenuColumns({
  submit: true,
  reset: true,
  resetText: '关闭'
});
const form = ref({
  forecastInterval: '3600',
  forecastPeriod: '12',
  forecastPeriodRainfall: '24',
  spinUpDay1: '2',
  spinUpDay2: '2',
  ifForecast: 0,
  ifUseQObs: 0,
  ifUseHObs: 0,
  maxDayRouting: 1
});
const crudRef = ref();
const serachForm = ref({});
const chart1 = ref(null);
const chart2 = ref(null);
let data = ref([]);
let dialogVisible = ref(false);
let dialogVisible1 = ref(false);
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const select1 = ref('0'); // 山洪预报0  水动力1
const options1 = ref(dictStore.getDict('IRR_FLOOD_FORECAST_UNIT')); // 预报单元
let select2 = ref('');  // 预报河段
let options2 = ref([]);  // 预报河段
const radio1 = ref(''); //山洪片区
let radios1 = ref([]) //山洪片区
let tableData1 = ref([]);
let tableData2 = ref([]);
let currentRow = ref(null);
let rvskCode = ref('');
let visible = ref(true);
let planCode = ref('');
let selectType = ref(0);


const columns = defineCrudColumns([
  {
    label: '方案名称',
    prop: 'caseName',
    component: 'el-input',
    props: {
      placeholder: '请输入方案名称',
    },
    form: true,
    search: true,
  },
  {
    label: '开始时间',
    prop: 'forecastSTime',
    search: false,
    form: true,
  },
  {
    label: '结束时间',
    prop: 'forecastETime',
    search: false,
    form: true,
  },
  {
    label: '计算步长(s)',
    prop: 'forecastInterval',
    search: false,
    form: true,
  },
  {
    label: '流域预热期(天)',
    prop: 'spinUpDay1',
    search: false,
    form: true,
  },
  {
    label: '河道预热期(天)',
    prop: 'spinUpDay2',
    search: false,
    form: true,
  },
  {
    label: '预报期长度(时段个数)',
    prop: 'forecastPeriod',
    search: false,
    form: true,
  },
  {
    label: '降雨预见期长度(时段个数)',
    prop: 'forecastPeriodRainfall',
    search: false,
    form: true,
  },
  {
    label: '是否为预报模式',
    prop: 'ifForecast',
    search: false,
    form: true,
  },
  {
    label: '最大汇流时间(天)',
    prop: 'maxDayRouting',
    search: false,
    form: true,
  },
  {
    label: '创建时间',
    prop: 'createTime',
    component: 'el-date-picker',
    props: {
      style: {
        width: "60%",
      },
      clearable: true,
      type: 'datetimerange',
      'start-placeholder': "开始时间",
      'end-placeholder': '结束时间',
      'range-separator': '-',
      'value-format': "YYYY-MM-DD HH:mm:ss"
    },
    hidden: true,
    search: true,
    form: true,
  },
  {
    label: '创建人',
    prop: 'createBy',
    component: 'el-input',
    form: true,
    search: false,
  },
]);
const formColumns = defineFormColumns([
  {
    label: '方案设置',
    prop: 'a',
    type: 'group',
    children: [
      {
        label: '方案名称',
        prop: 'caseName',
        component: 'el-input',
        props: {
          placeholder: '请输入方案名称',
        },
        rules: [{required: true, message: '请输入方案名称'}],
        md: 12,
      },
      {
        label: '是否为预报模式',
        prop: 'ifForecast',
        component: 'pro-radio',
        props: {
          data: [
            {label: '是', value: 1},
            {label: '否', value: 0},
          ],
        },
        rules: [{required: true, message: '请选择是否为预报模式'}],
        md: 12,
      },
      {
        label: '开始时间',
        prop: 'forecastSTime',
        component: 'el-date-picker',
        rules: [{required: true, message: '请选择开始时间'}],
        props: {
          clearable: true,
          style: {width: '100%'},
          type: "datetime",
          'value-format': "YYYY-MM-DD HH:mm",
          format: "YYYY-MM-DD HH:mm",
          placeholder: '请选择开始时间',
          onChange: (val) => {
            form.value.forecastETime = dayjs(val).add(form.value.forecastPeriod, 'hour').format('YYYY-MM-DD HH:mm')
          }
        },
        md: 12,
      },
      {
        label: '结束时间',
        prop: 'forecastETime',
        component: 'el-date-picker',
        rules: [{required: true, message: '请选择结束时间'}],
        props: {
          clearable: true,
          style: {width: '100%'},
          type: "datetime",
          disabled: true,
          'value-format': "YYYY-MM-DD HH:mm",
          format: "YYYY-MM-DD HH:mm",
          placeholder: '结束时间 = 开始时间 + 预报期长度',
        },
        md: 12,
      },
    ]
  },
  {
    label: '模型设置',
    prop: 'b',
    type: 'group',
    children: [
      {
        label: '是否采用实测流量数据',
        prop: 'ifUseQObs',
        component: 'pro-radio',
        props: {
          data: [
            {label: '是', value: 1},
            {label: '否', value: 0},
          ],
        },
        rules: [{required: true, message: '请选择是否采用实测流量数据'}],
        md: 12,
      },
      {
        label: '是否采用实测水位数据',
        prop: 'ifUseHObs',
        component: 'pro-radio',
        props: {
          data: [
            {label: '是', value: 1},
            {label: '否', value: 0},
          ],
        },
        rules: [{required: true, message: '请选择是否采用实测流量数据'}],
        md: 12,
      },
      {
        label: '计算时间步长(s)',
        prop: 'forecastInterval',
        component: 'el-input-number',
        rules: [{required: true, message: '请输入计算时间步长(s)'}],
        props: {
          min: 0,
          disabled:true,
          placeholder: '请输入计算时间步长(s)',
          style: {width: '100%'}
        },
        md: 12,
      },
      {
        label: '预报期长度(时段个数)',
        prop: 'forecastPeriod',
        component: 'el-input-number',
        rules: [{required: true, message: '请输入预报期长度(时段个数)'}],
        props: {
          min: 0,
          onChange: (val) => {
            form.value.forecastETime = dayjs(form.value.forecastSTime).add(val, 'hour').format('YYYY-MM-DD HH:mm')
          },
          placeholder: '请输入预报期长度',
          style: {width: '100%'},
        },
        md: 12,
      },
      {
        label: '降雨预见期长度(时段个数)',
        prop: 'forecastPeriodRainfall',
        component: 'el-input-number',
        rules: [{required: true, message: '降雨预见期长度(时段个数)'}],
        props: {
          min: 0,
          disabled:true,
          placeholder: '请输入降雨预见期长度',
          style: {width: '100%'},
        },
        md: 12,
      },
      {
        label: '流域汇流的预热期(天)',
        prop: 'spinUpDay1',
        component: 'el-input-number',
        rules: [{required: true, message: '流域汇流的预热期(天)'}],
        props: {
          min: 0,
          placeholder: '请输入降流域汇流的预热期',
          style: {width: '100%'}
        },
        md: 12,
      },
      {
        label: '河道汇流的预热期(天)',
        prop: 'spinUpDay2',
        component: 'el-input-number',
        rules: [{required: true, message: '河道汇流的预热期(天)'}],
        props: {
          min: 0,
          placeholder: '请输入河道汇流的预热期',
          style: {width: '100%'}
        },
        md: 12,
      },
      {
        label: '最大汇流时间(天)',
        prop: 'maxDayRouting',
        component: 'el-input-number',
        rules: [{required: true, message: '最大汇流时间(天)'}],
        props: {
          placeholder: '请输入最大汇流时间',
          min: 0,
          style: {width: '100%'}
        },
        md: 12,
      }
    ]
  }
]);
const editColumns = defineFormColumns([
  {
    label: '方案设置',
    prop: 'a',
    type: 'group',
    children: [
      {
        label: '方案名称',
        prop: 'caseName',
        component: 'el-input',
        props: {
          placeholder: '请输入方案名称',
        },
        rules: [{required: true, message: '请输入方案名称'}],
        md: 12,
      },
      {
        label: '是否为预报模式',
        prop: 'ifForecast',
        component: 'pro-radio',
        props: {
          data: [
            {label: '是', value: 1},
            {label: '否', value: 0},
          ],
        },
        rules: [{required: true, message: '请选择是否为预报模式'}],
        md: 12,
      },
      {
        label: '开始时间',
        prop: 'forecastSTime',
        component: 'el-date-picker',
        rules: [{required: true, message: '请选择开始时间'}],
        props: {
          clearable: true,
          style: {width: '100%'},
          type: "datetime",
          'value-format': "YYYY-MM-DD HH:mm",
          format: "YYYY-MM-DD HH:mm",
          placeholder: '请选择开始时间',
          onChange: (val) => {
            form.value.forecastETime = dayjs(val).add(form.value.forecastPeriod, 'hour').format('YYYY-MM-DD HH:mm')
          }
        },
        md: 12,
      },
      {
        label: '结束时间',
        prop: 'forecastETime',
        component: 'el-date-picker',
        rules: [{required: true, message: '请选择结束时间'}],
        props: {
          clearable: true,
          style: {width: '100%'},
          type: "datetime",
          disabled: true,
          'value-format': "YYYY-MM-DD HH:mm",
          format: "YYYY-MM-DD HH:mm",
          placeholder: '结束时间 = 开始时间 + 预报期长度',
        },
        md: 12,
      },
    ]
  },
  {
    label: '模型设置',
    prop: 'b',
    type: 'group',
    children: [
      {
        label: '是否采用实测流量数据',
        prop: 'ifUseQObs',
        component: 'pro-radio',
        props: {
          data: [
            {label: '是', value: 1},
            {label: '否', value: 0},
          ],
        },
        rules: [{required: true, message: '请选择是否采用实测流量数据'}],
        md: 12,
      },
      {
        label: '是否采用实测水位数据',
        prop: 'ifUseHObs',
        component: 'pro-radio',
        props: {
          data: [
            {label: '是', value: 1},
            {label: '否', value: 0},
          ],
        },
        rules: [{required: true, message: '请选择是否采用实测流量数据'}],
        md: 12,
      },
      {
        label: '计算时间步长(s)',
        prop: 'forecastInterval',
        component: 'el-input-number',
        rules: [{required: true, message: '请输入计算时间步长(s)'}],
        props: {
          min: 0,
          placeholder: '请输入计算时间步长(s)',
          style: {width: '100%'}
        },
        md: 12,
      },
      {
        label: '预报期长度(时段个数)',
        prop: 'forecastPeriod',
        component: 'el-input-number',
        rules: [{required: true, message: '请输入预报期长度(时段个数)'}],
        props: {
          min: 0,
          onChange: (val) => {
            form.value.forecastETime = dayjs(form.value.forecastSTime).add(val, 'hour').format('YYYY-MM-DD HH:mm')
          },
          placeholder: '请输入预报期长度',
          style: {width: '100%'},
        },
        md: 12,
      },
      {
        label: '降雨预见期长度(时段个数)',
        prop: 'forecastPeriodRainfall',
        component: 'el-input-number',
        rules: [{required: true, message: '降雨预见期长度(时段个数)'}],
        props: {
          min: 0,
          placeholder: '请输入降雨预见期长度',
          style: {width: '100%'},
        },
        md: 12,
      },
      {
        label: '流域汇流的预热期(天)',
        prop: 'spinUpDay1',
        component: 'el-input-number',
        rules: [{required: true, message: '流域汇流的预热期(天)'}],
        props: {
          min: 0,
          placeholder: '请输入降流域汇流的预热期',
          style: {width: '100%'}
        },
        md: 12,
      },
      {
        label: '河道汇流的预热期(天)',
        prop: 'spinUpDay2',
        component: 'el-input-number',
        rules: [{required: true, message: '河道汇流的预热期(天)'}],
        props: {
          min: 0,
          placeholder: '请输入河道汇流的预热期',
          style: {width: '100%'}
        },
        md: 12,
      },
      {
        label: '最大汇流时间(天)',
        prop: 'maxDayRouting',
        component: 'el-input-number',
        rules: [{required: true, message: '最大汇流时间(天)'}],
        props: {
          placeholder: '请输入最大汇流时间',
          min: 0,
          style: {width: '100%'}
        },
        md: 12,
      }
    ]
  }
]);
const detailColumns = defineFormColumns([
  {
    label: '方案设置',
    prop: 'a',
    type: 'group',
    children: [
      {
        label: '方案名称',
        prop: 'caseName',
        component: 'el-input',
        props: {
          placeholder: '请输入方案名称',
          disabled: true
        },
        rules: [{required: true, message: '请输入方案名称'}],
        md: 12,
      },
      {
        label: '是否为预报模式',
        prop: 'ifForecast',
        component: 'pro-radio',
        props: {
          data: [
            {label: '是', value: 1},
            {label: '否', value: 0},
          ],
          disabled: true
        },
        rules: [{required: true, message: '请选择是否为预报模式'}],
        md: 12,
      },
      {
        label: '开始时间',
        prop: 'forecastSTime',
        component: 'el-date-picker',
        rules: [{required: true, message: '请选择开始时间'}],
        props: {
          clearable: true,
          disabled: true,
          style: {width: '100%'},
          type: "datetime",
          'value-format': "YYYY-MM-DD HH:mm",
          format: "YYYY-MM-DD HH:mm",
          placeholder: '请选择开始时间',
        },
        md: 12,
      },
      {
        label: '结束时间',
        prop: 'forecastETime',
        component: 'el-date-picker',
        rules: [{required: true, message: '请选择结束时间'}],
        props: {
          clearable: true,
          disabled: true,
          style: {width: '100%'},
          type: "datetime",
          'value-format': "YYYY-MM-DD HH:mm",
          format: "YYYY-MM-DD HH:mm",
          placeholder: '请选择结束时间',
        },
        md: 12,
      },
    ]
  },
  {
    label: '模型设置',
    prop: 'b',
    type: 'group',
    children: [
      {
        label: '是否采用实测流量数据',
        prop: 'ifUseQObs',
        component: 'pro-radio',
        props: {
          data: [
            {label: '是', value: 1},
            {label: '否', value: 0},
          ],
        },
        rules: [{required: true, message: '请选择是否采用实测流量数据'}],
        md: 12,
      },
      {
        label: '是否采用实测水位数据',
        prop: 'ifUseHObs',
        component: 'pro-radio',
        props: {
          data: [
            {label: '是', value: 1},
            {label: '否', value: 0},
          ],
        },
        rules: [{required: true, message: '请选择是否采用实测流量数据'}],
        md: 12,
      },
      {
        label: '计算时间步长(s)',
        prop: 'forecastInterval',
        component: 'el-input-number',
        rules: [{required: true, message: '请输入计算时间步长(s)'}],
        props: {
          placeholder: '请输入计算时间步长(s)',
          style: {width: '100%'},
          disabled: true
        },
        md: 12,
      },
      {
        label: '预报期长度(时段个数)',
        prop: 'forecastPeriod',
        component: 'el-input-number',
        rules: [{required: true, message: '请输入预报期长度(时段个数)'}],
        props: {
          placeholder: '请输入预报期长度',
          style: {width: '100%'},
          disabled: true
        },
        md: 12,
      },
      {
        label: '降雨预见期长度(时段个数)',
        prop: 'forecastPeriodRainfall',
        component: 'el-input-number',
        rules: [{required: true, message: '降雨预见期长度(时段个数)'}],
        props: {
          placeholder: '请输入降雨预见期长度',
          style: {width: '100%'},
          disabled: true
        },
        md: 12,
      },
      {
        label: '流域汇流的预热期(天)',
        prop: 'spinUpDay1',
        component: 'el-input-number',
        rules: [{required: true, message: '流域汇流的预热期(天)'}],
        props: {
          placeholder: '请输入降流域汇流的预热期',
          style: {width: '100%'},
          disabled: true
        },
        md: 12,
      },
      {
        label: '河道汇流的预热期(天)',
        prop: 'spinUpDay2',
        component: 'el-input-number',
        rules: [{required: true, message: '河道汇流的预热期(天)'}],
        props: {
          placeholder: '请输入河道汇流的预热期',
          style: {width: '100%'},
          disabled: true
        },
        md: 12,
      },
      {
        label: '最大汇流时间(天)',
        prop: 'maxDayRouting',
        component: 'el-input-number',
        rules: [{required: true, message: '最大汇流时间(天)'}],
        props: {
          placeholder: '请输入最大汇流时间',
          style: {width: '100%'},
          disabled: true
        },
        md: 12,
      }
    ]
  }
]);

const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit' || type === 'detail') {
    form.value = {...row, ifUseQObs: row.ifUseQObs ? 1 : 0, ifUseHObs: row.ifUseHObs ? 1 : 0} || {};
  } else {
    form.value = {
      forecastInterval: '3600',
      forecastPeriod: '12',
      forecastPeriodRainfall: '24',
      spinUpDay1: '2',
      spinUpDay2: '2',
      ifForecast: 0,
      ifUseQObs: 0,
      ifUseHObs: 0,
      maxDayRouting: 1
    };
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
})

// 水动力查看地图
const handerVisible = (val)=>{
  selectType.value = 1;
  select1.value = 1;
  visible.value = false;
  planCode.value = val.caseCode;
}
const formatter = (row) => {
  return dayjs(row.tm).format('MM-DD HH:mm')
}

onMounted(() => {
  getData()
  // 山洪片区
  getShList().then(res => {
    if (res.success) {
      radios1.value = res.data.reverse().map(r => ({label: r.wshName, value: r.wshCode}))
      radio1.value = radios1.value.length ? radios1.value[0].value : '';
    }
  })

  // 查询河段
  getBasinBachList().then(res => {
    if (res.success) {
      options2.value = res.data.map(r => {
        return {label: r.bnchName, value: r.bnch}
      });
      rvskCode.value = res.data[0].rvskCode;
      select2.value = options2.value.length ? options2.value[0].value : '';
    }
  })
})

// 方案计算结果
const handleSearch = (row) => {
  currentRow.value = row;
  dialogVisible.value = true;
}

//查看单个方案
const hadleSearchPlan = (row) => {
  selectType.value = 0;
  select1.value = 0;
  visible.value = false;
  planCode.value = row.caseCode;
}

watch([select1, radio1, currentRow], ([s1, r, c]) => {
  if (c && s1 == 0) {  // 山洪片区
    getShTable({
      caseCode: c.caseCode,
      planEndTime: c.forecastETime || '',
      planStartTime: c.forecastSTime || '',
      wshCode: r,
    }).then(res => {
      if (res.success) {
        tableData1.value = res.data;
        const x = res.data.map(r => dayjs(r.tm).format('MM-DD HH:mm'));
        const bar = res.data.map(r => r.p) //面雨量
        const line = res.data.map(r => r.qnat) // 流量
        const series = [
          {
            name: '流量',
            type: 'line',
            yAxisIndex: 0,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' m³/s';
              }
            },
            data: line
          },
          {
            name: '面雨量',
            type: 'bar',
            yAxisIndex: 1,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' mm';
              }
            },
            data: bar
          },
        ];
        const chart = echarts.init(chart1.value);
        chart.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            }
          },
          grid: {
            left: '5%',
            right: '5%',
            bottom: '0%',
            top: '10%',
            containLabel: true
          },
          legend: {},
          xAxis: [
            {
              type: 'category',
              data: x,
              boundaryGap: false,
              axisPointer: {
                type: 'shadow'
              }
            }
          ],
          yAxis: [
            {
              name: '流量(m³/s)',
              type: 'value',
            },
            {
              name: '面雨量(mm)',
              type: 'value',
              alignTicks: true,
              inverse: true,
              nameLocation: 'start',
            },
          ],
          series: series
        });
      }
    })
  }
})

watch([select1, select2, currentRow], ([s1, s2, c]) => {
  if (c && s1 == 1) { // 阳武干渠
    getHdTable({
      bnch: s2,
      caseCode: c.caseCode,
      rvskCode: rvskCode.value
    }).then(res => {
      if (res.success) {
        tableData2.value = res.data;
        const x = res.data.map(r => dayjs(r.tm).format('MM-DD HH:mm'));
        const line1 = res.data.map(r => r.z) //水位
        const line2 = res.data.map(r => r.q) // 流量
        const series = [
          {
            name: '水位',
            type: 'line',
            yAxisIndex: 0,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' m';
              }
            },
            data: line1
          },
          {
            name: '流量',
            type: 'line',
            yAxisIndex: 1,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' m³/s';
              }
            },
            data: line2
          }
        ];
        const chart = echarts.init(chart2.value);
        chart.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            }
          },
          grid: {
            left: '5%',
            right: '5%',
            bottom: '0%',
            top: '10%',
            containLabel: true
          },
          legend: {},
          xAxis: [
            {
              type: 'category',
              data: x,
              boundaryGap: false,
              axisPointer: {
                type: 'shadow'
              }
            }
          ],
          yAxis: [
            {
              name: '水位(m)',
              type: 'value',
            },
            {
              name: '流量(m³/s)',
              type: 'value',
              alignTicks: true,
              inverse: true,
              nameLocation: 'start',
            }
          ],
          series: series
        });
      }
    })
  }
})

const getData = () => {
  getPlanList({
    ...serachForm.value,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    startTime: serachForm.value.createTime ? serachForm.value.createTime[0] : '',
    endTime: serachForm.value.createTime ? serachForm.value.createTime[1] : '',
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
      addPlan({...form.value}).then(res => {
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
      putPlan(form.value.caseCode,{...form.value}).then(res=>{
        if (res.success) {
          ElMessage({
            message: '修改成功',
            type: 'success',
          });
          getData();
          close()
        }
      })
    }
  }
  done();
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
    if (row.caseCode == 'DEFAULT') {
      ElMessage({
        message: '默认方案不允许删除',
        type: 'warning',
      });
      return
    } else {
      deletePlan(row.caseCode).then(res => {
        if (res.success) {
          getData()
          ElMessage({
            message: '删除成功',
            type: 'success',
          });
        }
      })
    }

  })
}

</script>

<style scoped lang="scss">
:deep(.l-dialog .el-dialog__body) {
  height: 560px !important;
  padding-bottom: 0;
  padding-top: 15px !important;
}

:deep( .el-dialog__body) {
  padding-top: 0;
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

.head-title:after {
  height: 15px !important;
}

.boxContent {
  // display: flex;
  box-sizing: border-box;
  .app-container{
    padding: 10px;
  }
  .flasFlood{
   width: 49%;
  }
  .hydrodyModel {
    width: 48%;
    margin-left: 0 !important;
  }
}
</style>