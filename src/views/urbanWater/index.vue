<template>
  <template v-if="visible">
    <div class="page1" style="padding: 20px 20px;height: 100%;display: flex;flex-direction:column;overflow: auto">
      <div class="detail-content">
        <div class="lf">
          <subTable @setVisible="setVisible" @getCurrentRow="getCurrentRow"/>
        </div>
        <div class="rg">
          <div class="card-container">
            <li>
              <span><i></i>年城乡平均供水量 (万m³)</span>
              <strong>{{ statistics.yearAvgSupply }}</strong>
            </li>
            <li>
              <span><i></i>本年城乡已供水量 (万m³)</span>
              <strong>{{ statistics.nowYearSumSupply }}</strong>
            </li>
            <li>
              <span><i></i>本月城乡已供水量 (万m³)</span>
              <strong>{{ statistics.nowMonthSumSupply }}</strong>
            </li>
          </div>
          <div class="head-title">城乡用水历年供水量</div>
          <div ref="histroyChart" style="flex: 1;text-align: center">
            柱状图
          </div>
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="app-container page2">
      <div class="head">
        <div class="lf">
          <span class="head-title" style="font-size: 18px">方案制定</span>
          <li>
            <span>方案名称：</span>
            <el-input disabled v-model="defaultSet.planName" placeholder="请输入方案名称"/>
          </li>
          <li>
            <span style="margin-left: 15px">预报时段：</span>
            <el-input v-model="defaultSet.year" disabled/>
          </li>
        </div>
        <div class="rg">
          <el-button type="primary" link :icon="ArrowLeftBold" @click="visible = !visible ">返回</el-button>
        </div>
      </div>
      <div class="filter">
        <span style="margin-left: 20px">计算方法：</span>
        <el-radio-group v-model="defaultSet.radios">
          <el-radio label="1" size="large">增长预测法</el-radio>
          <el-radio label="2" size="large">平均法</el-radio>
        </el-radio-group>
        <el-button type="primary" style="margin-left: 20px" @click="handleDefaultSetting(1)">
          计算
        </el-button>
        <el-button
            type="primary"
            style="margin-left: 20px"
            @click="handleDefaultSetting(2)"
        >优化计算
        </el-button>
      </div>
      <div class="content">
        <div class="lf">
          <div class="head">
            <div>
              <el-tabs v-model="regionSelect"  @tab-change="changeRegion">
                <el-tab-pane  v-for="item in regionOptions" :label="item.label" :name="item.value"></el-tab-pane>
              </el-tabs>
            </div>
            <div style="text-align: right">
              <span style="margin-left: 20px">选择年份：</span>
              <el-select
                  v-model="times"
                  multiple
                  collapse-tags
                  @change="changeSelect"
                  placeholder="请选择年份"
              >
                <el-option
                    v-for="item in timeData"
                    :key="item.value"
                    :label="`${item.label}年`"
                    :value="item.value"
                />
              </el-select>
            </div>
          </div>
          <div class="top">
            <span>预测确定性系数：</span>
            <strong style="color: #409eff;font-size: 18px">
              {{ forecast.forecastCoefficient }}
            </strong>
            <span style="margin-left: 20px">回归预测总量：<strong
                style="margin: 0 5px;color: #409eff;;font-size: 18px">{{ forecast.regressTotal }}</strong>(万m³)</span>
          </div>
          <div style="flex: 1" ref="yearChart"></div>
        </div>
        <div class="rg">
          <div class="top">
            <div class="head">
              <span class="head-title">月度供水过程</span>
            </div>
            <div style="flex: 1;margin-bottom: 10px" ref="monthChart"></div>
          </div>
          <div class="bottom">
            <vxe-table
                border
                height="145"
                keep-source
                show-overflow
                :data="tableData1"
                :column-config="{resizable: false}"
                :edit-config="{trigger: 'click', mode: 'row'}">
              <vxe-column field="UNIT" title="取水位置">
              </vxe-column>
              <vxe-column field="UNIT" :title="TitleLabelXIANNING" :edit-render="false" align="center">
                <template #default="{ row,rowIndex }">
                  <vxe-input v-if="rowIndex == 2" v-model="row.XIANNING" type="text"></vxe-input>
                  <span v-else>{{ row.XIANNING }}</span>
                </template>
              </vxe-column>
              <vxe-column field="UNIT" :title="TitleLabelDAYE" :edit-render="false" align="center">
                <template #default="{ row,rowIndex }">
                  <vxe-input v-if="rowIndex == 2" v-model="row.DAYE" type="text"></vxe-input>
                  <span v-else>{{ row.DAYE }}</span>
                </template>
              </vxe-column>
              <vxe-column field="UNIT" :title="TitleLabelYANGXIN" :edit-render="false" align="center">
                <template #default="{ row,rowIndex }">
                  <vxe-input v-if="rowIndex == 2" v-model="row.YANGXIN" type="text"></vxe-input>
                  <span v-else>{{ row.YANGXIN }}</span>
                </template>
              </vxe-column>
            </vxe-table>
          </div>
        </div>
      </div>
      <div class="bot-table">
        <div class="title">
          <div>
            <span class="head-title">预测需水过程</span>
          </div>
          <processTable ref="processBox" :currentRow="currentRow" />
        </div>
      </div>
    </div>
  </template>

</template>

<script setup>
import {ArrowLeftBold} from '@element-plus/icons-vue';
import subTable from './components/subTable';
import processTable from './components/processTable';
import {nextTick, onMounted, ref, watch} from "vue";
import {getChart, getRwWater} from "@/api/agricultureWater";
import * as echarts from "echarts";
import dayjs from "dayjs";
import {ElLoading} from "element-plus";
import {
  addDefaultSetting,
  getMonthData,
  getYearUseWater,
  getResultTypical,
  getCalUrbanPlanData,
  getCalcUrbanResult
} from "@/api/urbanWater";
const processBox = ref({});
const histroyChart = ref(null);
const yearChart = ref(null);
const monthChart = ref(null);
let visible = ref(true);
let TitleLabelXIANNING = ref('');
let TitleLabelDAYE = ref('')
let TitleLabelYANGXIN = ref('')
let tableData1 = ref([]);
let statistics = ref({});
let currentRow = ref(null);
const prevYear = ref(dayjs().subtract(1, 'year').format('YYYY'));
let marks = ref({2001: '2001'});
let num = ref(0);
let downloadLoadingInstance = null
let defaultSet = ref({
  planName: '',
  year: '',
  range: [2001, prevYear.value],
  coefficient: '0.0',
  radios: '1'
});
let forecast = ref({});
let options2 = ref([
  {value: '2022', label: '2022',},
  {value: '2023', label: '2023',},
  {value: '2024', label: '2024',},
]);
let yearWeightUrbanList = ref([]);
let times = ref([]);
let allTimes = ref([]);
let timeData = ref([]);
let regionSelect = ref('XIANNING');
let regionOptions = ref([]);

onMounted(() => {
  marks.value[prevYear.value] = prevYear.value;

})

watch(visible, (v) => {
  if (v) {
    getRwWater({type: 'urban'}).then(res => {
      if (res.success) {
        statistics.value = res.data;
      }
    })
    getChart({type: 'urban'}).then(res => {
      const result = res.data;
      const chart1 = echarts.init(histroyChart.value);
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
  } else {
    //获取城镇年份
    getResultTypical({allocCode: currentRow.value.allocCode}).then(res => {
      if (res.success) {
        const result = res.data || []
        yearWeightUrbanList.value = result
        let arr = []
        result.map(item => {
          if (arr.length > 0) {
            const newArr = arr.map(it => it.value)
            if (!newArr.includes(item.unitCode)) {
              arr.push({value: item.unitCode, label: item.unitName})
            }
          } else {
            arr.push({value: item.unitCode, label: item.unitName})
          }
        })
        regionOptions.value = arr
        console.log(arr);
        TitleLabelXIANNING.value = regionOptions.value[0].label;
        TitleLabelDAYE.value = regionOptions.value[1].label;
        TitleLabelYANGXIN.value = regionOptions.value[2].label;
        getTimeData(yearWeightUrbanList.value,regionOptions.value.length ? regionOptions.value[0].value : '')
        saveFilter(1)
      }
    })
    // 预测需水过程
    nextTick(()=>{
      processBox.value.refresh()
    })
    //月度供水过程
    getMonthDataFuc(currentRow.value.allocCode)

  }
}, {immediate: true})

// 年份切换
const changeSelect = () =>{
  saveFilter(1)
}

//点击计算触发
const handleDefaultSetting = (val) => {
  if (val === 1) {//计算
    times.value = allTimes.value
  }
  const list = allTimes.value.filter(item => !times.value.includes(item))
  const params = {
    allocCode: currentRow.value.allocCode,
    calculateType: defaultSet.value.radios,
    calculateBtn: val,
    unitCode: regionSelect.value,
    yearList: list || []//未勾选的年份
  }
  getCalUrbanPlanData(params).then(res => {
    if (res.success) {
      downloadLoadingInstance = ElLoading.service({text: "数据计算中，请稍候", background: "rgba(0, 0, 0, 0.7)",});
      getCalcUrbanResult(params).then(res => {
        if (res.success) {
          downloadLoadingInstance.close();
          // //获取城镇年份
          getResultTypical({allocCode: currentRow.value.allocCode}).then(res => {
            if (res.success) {
              const result = res.data || []
              yearWeightUrbanList.value = result
              let arr = []
              result.map(item => {
                if (arr.length > 0) {
                  const newArr = arr.map(it => it.value)
                  if (!newArr.includes(item.unitCode)) {
                    arr.push({value: item.unitCode, label: item.unitName})
                  }
                } else {
                  arr.push({value: item.unitCode, label: item.unitName})
                }
              })
              regionOptions.value = arr
              getTimeData(yearWeightUrbanList.value, regionOptions.value.length ? regionOptions.value[0].value : '' )
            }
          })
          saveFilter(val)
          // 预测需水过程
          processBox.value.refresh()
          //月度供水过程
          getMonthDataFuc(currentRow.value.allocCode)
        }
      }).catch(e => {
        downloadLoadingInstance.close();
      })
    }
  })
}

//保存筛选条件
function saveFilter(val) {
  addDefaultSetting({
    allocCode: currentRow.value.allocCode,
    calculateType: defaultSet.value.radios,
    calculateBtn: val,
    unitCode: regionSelect.value,
    yearList: times.value
  }).then(res => {
        if (res.success) {
          const result = res.data;
          const chart1 = echarts.init(yearChart.value);
          forecast.value = {
            forecastCoefficient: result.forecastCoefficient,
            regressTotal: result.regressTotal
          }
          const x = result.urbanBarVOList.map(r => r.xname);
          const line = result.urbanBarVOList.map(r => r.yregressiveAnalysis);  // 回归分析趋势
          const bar = result.urbanBarVOList.map(r => r.ysupply); // 年度供水量
          const series = [
            {
              name: '年度供水量',
              type: 'bar',
              barMaxWidth: 20,
              tooltip: {
                valueFormatter: function (value) {
                  return value + ' 万m³';
                }
              },
              data: bar
            },
            {
              name: '回归分析趋势',
              type: 'line',
              data: line
            }
          ]
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
              bottom: '0%',
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
        }
      })
}

//月度供水过程
function getMonthDataFuc(allocCode) {
  getMonthData({allocCode}).then(res => {
    const result = res.data.supplyMonthLine;
    console.log(result)
    const chart1 = echarts.init(monthChart.value);
    const x = result.XName;
    const series = [
      {
        name: regionOptions.value[0].label,
        type: 'line',
        tooltip: {
          valueFormatter: function (value) {
            return value + ' 万m³';
          }
        },
        data: result[regionOptions.value[0].label]
      },
      {
        name: regionOptions.value[1].label,
        type: 'line',
        tooltip: {
          valueFormatter: function (value) {
            return value + ' 万m³';
          }
        },
        data: result[regionOptions.value[1].label]
      },
      {
        name: regionOptions.value[2].label,
        type: 'line',
        tooltip: {
          valueFormatter: function (value) {
            return value + ' 万m³';
          }
        },
        data: result[regionOptions.value[2].label]
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
        top: '17%',
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
    tableData1.value = res.data.supplyMonthTable;
  })
}

//获取年份
function getTimeData(arr, key) {
  const newArr = arr.filter(item => item.unitCode === key)
  let data = newArr.map(item =>item.year)
  times.value = data
  allTimes.value = data
  if (data.length > 0) {
    const list = data.sort().map(item => {
      return {
        label: item,
        value: item,
      }
    })
    timeData.value = list;
  } else {
    timeData.value = []
  }
  // saveFilter(1);
}

//tab 切换
const changeRegion = (e) => {
  getTimeData(yearWeightUrbanList.value, e)
  saveFilter(1);
}

const getCurrentRow = (row) => {
  defaultSet.value = {
    ...defaultSet.value,
    planName: row.allocName,
    year: `${row.forecastSdate} ~ ${row.forecastEdate}`,
  }
  currentRow.value = row;
}

const setVisible = (vis) => {
  visible.value = vis
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

.page1 {


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
}

.page2 {
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .lf {
      display: flex;

      li {
        display: flex;
        align-items: center;
        margin-left: 15px;

        span {
          white-space: nowrap;
        }
      }
    }

    .rg {

    }
  }

  .filter {
    display: flex;
    align-items: center;
    margin-bottom: 13px;
  }

  .content {
    display: flex;
    height: 450px;

    .lf {
      display: flex;
      flex-direction: column;
      flex: 1;
      background: #F4F8FB;
      margin-right: 10px;
      padding: 15px;
      border-radius: 8px;

      .top {
        display: flex;
        align-items: center;
      }

      .head {
          display: block;
          margin-bottom: 0;
      }
    }

    .rg {
      display: flex;
      flex-direction: column;
      flex: 1;
      background: #F4F8FB;
      padding: 15px;
      border-radius: 8px;

      .top {
        display: flex;
        flex-direction: column;
        flex: 1;

        .head {

        }
      }

      .bottom {
      }
    }
  }

  .bot-table {
    margin-top: 10px;
  }
}

</style>