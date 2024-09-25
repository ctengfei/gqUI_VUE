<template>
  <div class="container">
    <div class="steps">
      <li class="pass1">
        <span class="p-txt">1</span>参数设置
      </li>
      <li :class="[step2 ?'pass2' : 'not-pass2']"><span :class="[step2 ? 'p-txt' : 'n-txt']">2</span>来水计算</li>
      <li :class="[step3 ?'pass3' : 'not-pass3']"><span :class="[step3 ? 'p-txt' : 'n-txt']">3</span>需水计算</li>
      <li :class="[step4 ?'pass4' : 'not-pass4']"><span :class="[step4 ? 'p-txt' : 'n-txt']">4</span>成果展示</li>
    </div>
    <div class="settings">
      <div class="head">
        <h4>水库来水预测选择</h4>
        <div class="search-box">
          <div class="lf">
            <span>来水预测模型</span>
            <el-select v-model="select1" placeholder="请选择模型">
              <el-option
                  v-for="item in options1"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.disabled"
              />
            </el-select>
            <el-button type="primary" style="margin-left: 15px" icon="Setting" @click="dialogVisible1 = true">参数设置</el-button>
            <span style="margin-left: 50px">需水预测模型</span>
            <el-select v-model="select3" placeholder="请选择模型">
              <el-option
                  v-for="item in options3"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.disabled"
              />
            </el-select>
            <el-button type="primary" style="margin-left: 15px" icon="Setting"  @click="dialogVisible2 = true">参数设置</el-button>
          </div>
          <div class="rg">
            <el-button type="warning" :icon="Download">导出</el-button>
            <el-button :icon="Setting">重置</el-button>
          </div>
        </div>
      </div>
      <div class="content">
        <h4>水库来水预测成果</h4>
        <div style="flex: 1;display: none;flex-direction: column">
          <div class="search-box" >
            <div class="lf">
              <span>区域名称</span>
              <el-select v-model="select4" placeholder="请选择区域名称">
                <el-option
                    v-for="item in options4"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.disabled"
                />
              </el-select>
              <span style="margin-left: 30px">百分比</span>
              <el-select v-model="select2" placeholder="请选择百分比">
                <el-option
                    v-for="item in options2"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.disabled"
                />
              </el-select>
              <span style="margin-left: 30px">年份</span>
              <el-date-picker
                  v-model="year"
                  type="year"
                  clearable
                  placeholder="选择年份"
              />
              <el-button type="primary" :icon="Search" style="margin-left: 15px">查询</el-button>
            </div>
            <div class="rg">
              <el-switch
                  v-model="switchs"
                  size="large"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66; --el-switch-off-color: #409eff"
                  active-text="图表"
                  inactive-text="列表"
              />
            </div>
          </div>
          <div class="legend"  v-show="switchs">
            <li><i></i><span>王英水库供水量</span></li>
            <li><i></i><span>内部可供水量</span></li>
            <li><i></i><span>总需水量</span></li>
          </div>
          <div v-show="!switchs" class="table-box">
            <vxe-table show-overflow
                       show-footer
                       header-row-class-name="vxe-rowClass"
                       :row-config="{height: 100}"
                       row-class-name="resize"
                       ref="xTable"
                       :loading="loading"
                       :="gridOptions">
              <vxe-column field="name1" title="区域名称"></vxe-column>
              <vxe-column field="name3" title="类型"></vxe-column>
              <vxe-column field="name4" title="1月"></vxe-column>
              <vxe-column field="name5" title="2月"></vxe-column>
              <vxe-column field="name6" title="3月"></vxe-column>
              <vxe-column field="name7" title="4月"></vxe-column>
              <vxe-column field="name8" title="5月"></vxe-column>
              <vxe-column field="name9" title="6月"></vxe-column>
              <vxe-column field="name10" title="7月"></vxe-column>
              <vxe-column field="name11" title="9月"></vxe-column>
              <vxe-column field="name12" title="10月"></vxe-column>
              <vxe-column field="name13" title="11月"></vxe-column>
              <vxe-column field="name14" title="12月"></vxe-column>
              <vxe-column field="name15" title="合计"></vxe-column>
            </vxe-table>
          </div>
          <div v-show="switchs" class="linec-chart" ref="xsChart"></div>
        </div>
        <div class="empty" >
          <i></i>
          <span>请先进行参数设置</span>
        </div>
      </div>
    </div>
    <el-dialog
        v-model="dialogVisible1"
        title="参数设置"
        width="40%"
        :before-close="handleClose"
    >
      <span>This is a message</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="compute">来水预测计算</el-button>
          <el-button type="primary" @click="dialogVisible1 = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
        v-model="dialogVisible2"
        title="参数设置"
        width="40%"
        :before-close="handleClose"
    >
      <span>This is a message</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary" @click="compute">需水预测计算</el-button>
          <el-button type="primary" @click="dialogVisible2 = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {Download, Setting, Search, Picture, Grid} from '@element-plus/icons-vue'
import {onMounted, reactive, ref} from "vue";
import dayjs from "dayjs";
import * as echarts from "echarts";
const xsChart = ref();
let step1 = ref(true);
let step2 = ref(false);
let step3 = ref(false);
let step4 = ref(false);
let year = ref(dayjs().format('YYYY'));
let dialogVisible1 = ref(false);
let dialogVisible2 = ref(false)
let select1 = ref();
let options1 = ref([]);
let select3 = ref();
let options3 = ref([]);
let select4 = ref();
let options4 = ref([]);
let select2 = ref();
let options2 = ref([
  {
    value: '1',
    label: '10%',
  },
  {
    value: '2',
    label: '25%',
  },
  {
    value: '3',
    label: '50%',
  },
  {
    value: '4',
    label: '75%',
  },
  {
    value: '5',
    label: '80%',
  },
  {
    value: '6',
    label: '90%',
  },
]);
let switchs = ref(true);
let tableData = ref([
  {
    name1: '一干渠片区',
    name3: '总需水量',
    name4: '22',
    name5: '22',
    name6: '11',
    name7: '13',
    name8: '14',
    name9: '55',
    name10: '99',
    name11: '45',
    name12: '33',
    name13: '67',
    name14: '34',
    name15: '333'
  },
  {
    name1: '一干渠片区',
    name3: '内部可供水量',
    name4: '22',
    name5: '22',
    name6: '11',
    name7: '13',
    name8: '14',
    name9: '55',
    name10: '99',
    name11: '45',
    name12: '33',
    name13: '67',
    name14: '34',
    name15: '333'
  },
  {
    name1: '一干渠片区',
    name3: '王英水库供水量',
    name4: '22',
    name5: '22',
    name6: '11',
    name7: '13',
    name8: '14',
    name9: '55',
    name10: '99',
    name11: '45',
    name12: '33',
    name13: '67',
    name14: '34',
    name15: '333'
  },
  {
    name1: '二干渠片区',
    name3: '总需水量',
    name4: '22',
    name5: '22',
    name6: '11',
    name7: '13',
    name8: '14',
    name9: '55',
    name10: '99',
    name11: '45',
    name12: '33',
    name13: '67',
    name14: '34',
    name15: '333'
  },
  {
    name1: '二干渠片区',
    name3: '内部可供水量',
    name4: '22',
    name5: '22',
    name6: '11',
    name7: '13',
    name8: '14',
    name9: '55',
    name10: '99',
    name11: '45',
    name12: '33',
    name13: '67',
    name14: '34',
    name15: '333'
  },
  {
    name1: '二干渠片区',
    name3: '王英水库供水量',
    name4: '22',
    name5: '22',
    name6: '11',
    name7: '13',
    name8: '14',
    name9: '55',
    name10: '99',
    name11: '45',
    name12: '33',
    name13: '67',
    name14: '34',
    name15: '333'
  },
  {
    name1: '三干渠片区',
    name3: '总需水量',
    name4: '22',
    name5: '22',
    name6: '11',
    name7: '13',
    name8: '14',
    name9: '55',
    name10: '99',
    name11: '45',
    name12: '33',
    name13: '67',
    name14: '34',
    name15: '333'
  },
  {
    name1: '三干渠片区',
    name3: '内部可供水量',
    name4: '22',
    name5: '22',
    name6: '11',
    name7: '13',
    name8: '14',
    name9: '55',
    name10: '99',
    name11: '45',
    name12: '33',
    name13: '67',
    name14: '34',
    name15: '333'
  },
  {
    name1: '三干渠片区',
    name3: '王英水库供水量',
    name4: '22',
    name5: '22',
    name6: '11',
    name7: '13',
    name8: '14',
    name9: '55',
    name10: '99',
    name11: '45',
    name12: '33',
    name13: '67',
    name14: '34',
    name15: '333'
  },
]);
const gridOptions = reactive({
  border: true,
  stripe: true,
  align: 'center',
  columnConfig: {
    resizable: true
  },
  data: tableData.value,
  'span-method': colspanMethod,
});

function colspanMethod({row, _rowIndex, column, visibleData}) {
  const fields = ['name1']
  const cellValue = row[column.field]
  if (cellValue && fields.includes(column.field)) {
    const prevRow = visibleData[_rowIndex - 1]
    let nextRow = visibleData[_rowIndex + 1]
    if (prevRow && prevRow[column.field] === cellValue) {
      return {rowspan: 0, colspan: 0}
    } else {
      let countRowspan = 1
      while (nextRow && nextRow[column.field] === cellValue) {
        nextRow = visibleData[++countRowspan + _rowIndex]
      }
      if (countRowspan > 1) {
        return {rowspan: countRowspan, colspan: 1}
      }
    }
  }
}

onMounted(() => {
  const lines = echarts.init(xsChart.value);
  lines.setOption({
    grid: {
      left: '2%',
      right: '2%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月','8月','9月','10月','11月','12月'],
    },
    tooltip: {
      trigger: 'axis'
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '王英水库供水量',
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        showSymbol: false,
        smooth: true,
        color:'rgba(23, 145, 255, 1)',
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0.,
              color: 'rgba(51, 196, 255, 0.30)'
            },
            {
              offset: 1,
              color: 'rgba(23, 145, 255, 0)'
            }
          ])
        },
        lineStyle: {
          color: 'rgba(23, 145, 255, 1)'
        }
      },
      {
        name: '内部可供水量',
        data: [323, 11, 901, 22, 1290, 1330, 1320],
        type: 'line',
        showSymbol: false,
        smooth: true,
        color:'rgba(252, 127, 0, 1)',
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0.,
              color: 'rgba(252, 127, 0, 0.30)'
            },
            {
              offset: 1,
              color: 'rgba(252, 127, 0, 0)'
            }
          ])
        },
        lineStyle: {
          color: 'rgba(252, 127, 0, 1)'
        }
      },
      {
        name: '总需水量',
        data: [323, 11, 40, 22, 1290, 20, 100],
        type: 'line',
        showSymbol: false,
        smooth: true,
        color:'rgba(87, 199, 119, 1)',
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0.,
              color: 'rgba(87, 199, 119, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(252, 127, 0, 0)'
            }
          ])
        },
        lineStyle: {
          color: 'rgba(87, 199, 119, 1)'
        }
      }
    ]
  }, true);
})


</script>

<style scoped lang="scss">

li {
  list-style-type: none;
}
.container{
  display: flex;
  flex-direction: column;
  margin: 20px;
  height: auto;
  min-height: calc(100% - 40px);
  .steps {
    display: flex;
    width: 100%;
    height: 50px;
    margin-bottom: 20px;

    li {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      height: 50px;
    }

    .pass1 {
      background: url("@/assets/images/ect.png") no-repeat center center;
      background-size: contain;
      color: #1791FF;
      font-size: 16px;
    }
    .pass2 {
      background: url("@/assets/images/act.png") no-repeat center center;
      background-size: contain;
      color: #1791FF;
      font-size: 16px;
    }
    .not-pass2 {
      background: url("@/assets/images/act_s.png") no-repeat center center;
      background-size: contain;
      color: #999999;
      font-size: 16px;
    }
    .pass3 {
      background: url("@/assets/images/act.png") no-repeat center center;
      background-size: contain;
      color: #1791FF;
      font-size: 16px;
    }
    .not-pass3 {
      background: url("@/assets/images/act_s.png") no-repeat center center;
      background-size: contain;
      color: #999999;
      font-size: 16px;
    }
    .pass4 {
      background: url("@/assets/images/vct.png") no-repeat center center;
      background-size: contain;
      color: #1791FF;
      font-size: 16px;
    }
    .not-pass4 {
      background: url("@/assets/images/vct_s.png") no-repeat center center;
      background-size: contain;
      color: #999999;
      font-size: 16px;
    }
    .p-txt {
      display: inline-block;
      width: 25px;
      height: 25px;
      text-align: center;
      line-height: 20px;
      color: #1791FF;
      border: 2px solid #1791FF;
      border-radius: 50px;
      margin-right: 8px;
      font-weight: bold;
    }
    .n-txt {
      display: inline-block;
      width: 25px;
      height: 25px;
      text-align: center;
      line-height: 20px;
      color: #999;
      border-radius: 50px;
      border: 2px solid #999;
      margin-right: 8px;
      font-weight: bold;
    }
  }
  .settings {
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #FFFFFF;
    border-radius: 6px;
    padding: 20px;

    .head {
      height: 110px;
      border-bottom: 1px solid #F1F1F1;

      h4 {
        position: relative;
        padding-left: 18px;
        font-size: 16px;
        color: #333;

        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 5px;
          height: 100%;
          background: #409eff;
        }
      }

      .search-box {
        display: flex;
        justify-content: space-between;

        .lf {
          margin-top: 20px;

          span {
            font-size: 14px;
            color: #333;
            margin-right: 10px;
          }
        }

        .rg {
          margin-top: 20px;
        }
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      flex: 1;
      position: relative;
      margin-top: 20px;

      h4 {
        position: relative;
        padding-left: 18px;
        font-size: 16px;
        color: #333;

        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 5px;
          height: 100%;
          background: #409eff;
        }
      }

      .search-box {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;

        .lf {
          display: flex;
          align-items: center;

          span {
            font-size: 14px;
            color: #333;
            margin-right: 10px;
          }
        }

        .rg {
          display: flex;
          align-items: center;

        }
      }
      .legend{
        display: flex;
        justify-content: right;
        height: 20px;
        i{
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50px;
          margin: 0 8px;
        }
        span{
          color: #999999;
          font-size: 14px;
        }
        li:nth-child(1){
          height: 20px;
          margin-right: 25px;
          i{
            box-shadow: 0px 0px 4px 1px rgba(44,155,253,0.5);
            border: 2px solid #2C9BFD;
          }
        }
        li:nth-child(2){
          margin-right: 50px;
          i{
            box-shadow: 0px 0px 4px 1px rgba(252,127,0,0.5);
            border: 2px solid #FC7F00;
          }
        }
        li:nth-child(3){
          margin-right: 50px;
          i{
            box-shadow: 0px 0px 4px 1px rgba(87, 199, 119, 0.5);
            border: 2px solid #57C777;
          }
        }
      }
      .table-box, .linec-chart {
        flex: 1;
      }

      .empty {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        text-align: center;

        i {
          display: block;
          width: 200px;
          height: 140px;
          background: url("@/assets/images/empty.png") no-repeat center center;
          background-size: contain;
        }

        span {

        }
      }
    }
  }
}
</style>