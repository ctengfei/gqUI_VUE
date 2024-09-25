<template>
  <div style="padding: 20px 20px;height: 100%;display: flex;flex-direction:column;overflow: auto">
    <div class="detail-content">
      <div class="lf">
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
            column="2"
            width="60%"
            height="500"
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
          <template #form-menu-right="{ size }">
            <el-button
                :size="size"
                @click="crudRef.closeDialog()"
            >
              关闭
            </el-button>
          </template>
          <template #menu="{ size,row }">
            <el-button
                :size="size"
                type="success"
                icon="Search"
                link
                @click="handleSearch(row)"
            >
              查看结果
            </el-button>
          </template>
          <template #search-menu-right="{ size }">
            <el-button :size="size" type="primary" plain @click="settingParam"
                       style="margin-left: 30px">参数设置
            </el-button>
          </template>
        </pro-crud>
      </div>
      <div class="rg">
        <div class="card-container">
          <li>
            <span><i></i>年生态平均供水量 (万m³)</span>
            <strong>{{ statistics.yearAvgSupply }}</strong>
          </li>
          <li>
            <span><i></i>本年生态已供水量 (万m³)</span>
            <strong>{{ statistics.nowYearSumSupply }}</strong>
          </li>
          <li>
            <span><i></i>本月生态已供水量 (万m³)</span>
            <strong>{{ statistics.nowMonthSumSupply }}</strong>
          </li>
        </div>
        <div class="head-title">生态发电用水历年供水量</div>
        <div id="ecoChart" ref="ecoChart" style="flex: 1;text-align: center">
          柱状图
        </div>
      </div>
    </div>
    <el-dialog
        v-model="dialogVisible"
        class="x-dialog"
        :title="title"
        width="50%"
    >
      <div id="detailChart" ref="detailChart" style="height: 400px">
      </div>
      <template #footer>
        <el-button type="primary" @click="handleCompute">计算</el-button>
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    <!-- 参数设置弹窗 -->
    <el-dialog title="参数设置" v-model="isParameter" width="600px" append-to-body>
      <el-form ref="paramRef" :model="paramForm" :rules="rules" label-width="180px">
        <el-form-item label="生态流量控制目标(m3/s)" prop="flowEco">
          <el-input-number
              style="width: 100%"
              v-model="paramForm.flowEco"
              placeholder="请输入生态流量控制目标"
              :min="0"
              controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="paramClose">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
const {proxy} = getCurrentInstance();
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineFormColumns,
  defineTableIndexColumns,
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
import {computed, nextTick, onMounted, ref, watch} from "vue";
import {ElMessageBox} from "element-plus";
import {ElLoading} from "element-plus";
import {getInc, getParmEcoList, editFlowEcoApi} from "@/api/incomingWater";
import {getChart, getRwWater} from "@/api/agricultureWater";
import * as echarts from "echarts";
import {getCalcEcoEqBtr, getMonthEco} from "@/api/ecologyWater";

const menu = defineCrudMenuColumns({
  label: '操作',
  add: false,
  del: false,
  fixed: 'right',
  edit: false,
  addText: '新增方案',
  detail: false,
  reset: false,
  width: '180',
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
  delText: '删除',
  editText: '方案定制',
  searchText: '搜索',
  searchResetText: '重置',
  submitText: '确定',
  resetText: '取消',
});
const form = ref({});
const paramForm = ref({});
const crudRef = ref();
const paramRef = ref();
const serachForm = ref({});
const detailChart = ref(null);
const ecoChart = ref(null);
let data = ref([]);
let statistics = ref({});
let currentPage = ref(1)
let pageSize = ref(10);
let total = ref(0);
let title = ref('');
let dialogVisible = ref(false);
let isParameter = ref(false);
let downloadLoadingInstance = null
let currentRow = ref(null);
let rules = ref({
  roughness: [{required: true, message: "糙率不能为空", trigger: "blur"}]
})
const columns = defineCrudColumns([
  {
    label: '方案名称',
    prop: 'allocName',
    component: 'el-input',
    props: {
      clearable: true,
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
    label: '需水总量(万m³)',
    prop: 'wreqUrban',
    search: false,
    form: true,
  },
  {
    label: '预测年总量(万m³)',
    prop: 'wreqUrbanFcst',
    width: '130',
    search: false,
    form: true,
  },
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
const formColumns = defineFormColumns([
  {
    label: '方案名称',
    prop: 'name1',
    component: 'el-input',
    props: {
      placeholder: '请输入方案名称',
    },
    rules: [{required: true, message: '请输入方案名称'}],
    md: 12,
  },
  {
    label: '预测年度',
    prop: 'name2',
    component: 'el-date-picker',
    props: {
      clearable: true,
      placeholder: '请选择预测年度',
      type: 'year',
      style: {width: '100%'}
    },
    rules: [{required: true, message: '请选择预测年度'}],
    md: 12,
  },
  {
    label: '预测年总量(万m³)',
    prop: 'name3',
    component: 'el-input',
    props: {
      placeholder: '请输入预测年总量',
    },
    rules: [{required: true, message: '请输入预测年总量'}],
    md: 12,
  },
]);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
  if (type === 'edit') {
    form.value = row;
  } else {
    form.value = {};
  }
  done();
});

const beforeClose = defineCrudBeforeClose((done) => {
  form.value = {};
  done()
});

//查看
const handleSearch = (row) => {
  title.value = `${row.allocName}预测详情`;
  currentRow.value = row;
  getMonthEco({
    allocCode: row.allocCode,
  }).then(res => {
    if (res.success) {
      dialogVisible.value = true;
      const result = res.data;
      nextTick(()=>{
        const chart1 = echarts.init(detailChart.value);
        const x = result.map(r => r.xname || '');
        const data = result.map(r => r.xvalue || 0);
        const series = [
          {
            name: '水量',
            type: 'bar',
            barMaxWidth: '20',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' 万m³';
              }
            },
            data: data
          }
        ];
        chart1.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            }
          },
          grid: {
            left: '3%',
            right: '3%',
            bottom: '1%',
            top: '10%',
            containLabel: true
          },
          legend: {},
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
      })
    }
  })
}

//方案计算
const handleCompute = () => {
  downloadLoadingInstance = ElLoading.service({text: "数据计算中，请稍候", background: "rgba(0, 0, 0, 0.7)",});
  getCalcEcoEqBtr({
    caseCode: currentRow.value.allocCode,
  }).then(res => {
    if (res.success) {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        downloadLoadingInstance.close();
        if(res.data){
          getMonthEco({
            allocCode: currentRow.value.allocCode,
          }).then(res => {
            if (res.success) {
              dialogVisible.value = true;
              const result = res.data;
              nextTick(()=>{
                const chart1 = echarts.init(detailChart.value);
                const x = result.map(r => r.xname || '');
                const data = result.map(r => r.xvalue || 0);
                const series = [
                  {
                    name: '水量',
                    type: 'bar',
                    barMaxWidth: '20',
                    tooltip: {
                      valueFormatter: function (value) {
                        return value + ' 万m³';
                      }
                    },
                    data: data
                  }
                ];
                chart1.setOption({
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      type: 'cross',
                    }
                  },
                  grid: {
                    left: '3%',
                    right: '3%',
                    bottom: '1%',
                    top: '10%',
                    containLabel: true
                  },
                  legend: {},
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
              })
            }
          })
        }
      }, 50);
    }
  }).catch(e => {
    downloadLoadingInstance.close();
  })
}

onMounted(() => {
  getData();
  getRwWater({type: 'eco'}).then(res => {
    if (res.success) {
      statistics.value = res.data;
    }
  })
  getChart({type: 'eco'}).then(res => {
    const result = res.data;
    const chart1 = echarts.init(ecoChart.value);
    const x = result.map(r => r.XNAME);
    const data = result.map(r => r.YVALUE);
    const series = [];
    series.push({
      name: '供水量',
      type: 'bar',
      barMaxWidth: '20',
      tooltip: {
        valueFormatter: function (value) {
          return value + ' 万m³';
        }
      },
      data: data
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
        right: '3%',
        bottom: '1%',
        top: '10%',
        containLabel: true
      },
      legend: {},
      xAxis: [
        {
          type: 'category',
          data: x,
          // axisPointer: {
          //   type: 'shadow'
          // }
        }
      ],
      yAxis: {
        name: '万m³',
        type: 'value',
      },
      series: series
    });
  })
})

const getData = () => {
  const {allocName, createTime} = serachForm.value || {}
  getInc({
    allocName,
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    // planModule: 'YEARLY',
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

  })
};
const paramClose = () => {
  paramForm.value = {}
  isParameter.value = false
}
const submitForm = () => {
  proxy.$refs["paramRef"].validate(valid => {
    if (valid) {
      const {flowEco} = paramForm.value
      editFlowEcoApi({flowEco}).then(res => {
        if (res.success) {
          paramClose()
        }
      })
    }
  });
}
const settingParam = () => {
  isParameter.value = true
  getParmEcoList({}).then(res => {
    if (res.success) {
      paramForm.value = res.data && res.data[0] || ''
    }
  })
}
</script>

<style scoped lang="scss">
:deep(.x-dialog .el-dialog__body) {
  padding-bottom: 0 !important;
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

.detail-content {
  display: flex;
  flex: 1;

  .lf, .rg {
    padding: 20px;
    flex: 1;
    background: #fff;
    border-radius: 6px;
  }

  .lf {
    margin-right: 10px;
  }

  .rg {
    display: flex;
    flex-direction: column;

    .card-container {
      display: flex;
      margin-bottom: 10px;

      li {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 90px;
        flex: 1;
        margin: 0 5px;
        border-radius: 6px;
        padding: 15px;
        background-image: url("@/assets/images/wave.png");
        background-position: -100% 125%;
        background-repeat: no-repeat;
        background-size: 108%;
        color: #fff;

        span {
          i {
            position: relative;
            display: inline-block;
            vertical-align: text-top;
            width: 24px;
            height: 24px;
            border-radius: 50px;
            margin-right: 10px;

            &:after {
              content: '';
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              background: url("@/assets/images/shui002.png") no-repeat center center;
              background-size: contain;
              display: block;
              height: 15px;
              width: 15px;
            }
          }
        }

        strong {
          font-size: 25px;
        }

        &:nth-child(1) span i {
          background: #57C777;
        }

        &:nth-child(2) span i {
          background: #FC7F00;
        }

        &:nth-child(3) span i {
          background: #AB82FF;
        }

        &:nth-child(1) {
          background-color: #75bcf7;
        }

        &:nth-child(2) {
          background-color: #bd9dff;
        }

        &:nth-child(3) {
          background-color: #4acbb9;
        }

        &:first-child {
          margin-left: 0;
        }

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>