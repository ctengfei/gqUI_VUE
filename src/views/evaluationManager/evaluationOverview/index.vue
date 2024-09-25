<template>
  <div class="card_container">
    <div style="display: flex;width: 100%;height: 50%">
      <el-card style="flex: 1;margin-right: 20px" :body-style="{height:'100%',width:'100%'}">
        <div class="box-card">
          <div class="filter_box">
            季度：
            <a-range-picker v-model:value="quarter"
                            allowClear
                            :placeholder="['开始季度','结束季度']"
                            picker="quarter"/>
          </div>
          <div class="quarterChart" ref="quarterChart">

          </div>
        </div>
      </el-card>
      <el-card style="flex: 1" :body-style="{height:'100%',width:'100%'}">
        <div class="box-card">
          <div class="filter_box">
            <a-config-provider :locale="locale">
              月度：
              <a-range-picker
                  v-model:value="month"
                  allowClear
                  :locale="locale"
                  format="YYYY-MM"
                  valueFormat="YYYY-MM"
                  :placeholder="['开始月份','结束月份']"
                  picker="month"/>
            </a-config-provider>
          </div>
          <div class="monthChart" ref="monthChart">

          </div>
        </div>
      </el-card>
    </div>
    <div style="width: 100%;height: calc(50% - 20px);margin-top: 20px">
      <el-card style="width: 100%;height: 100%" :body-style="{height:'100%',width:'100%'}">
        <div class="box-card">
          <div class="filter_box">
            年度：
            <a-range-picker
                v-model:value="year"
                allowClear
                format="YYYY"
                valueFormat="YYYY"
                :placeholder="['开始年份','结束年份']"
                picker="year"/>
          </div>
          <div class="yearChart" ref="yearChart">

          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from "vue";
import dayjs from "dayjs";
import 'dayjs/locale/zh-cn';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import {getMonth, getQuarter, getYear} from "@/api/evaluationManager/evaluationOverview";
import * as echarts from "echarts";

const quarterChart = ref();
const monthChart = ref();
const yearChart = ref();
let quarter = ref([dayjs().subtract(3, 'quarter'), dayjs().endOf('quarter')]);
let month = ref([dayjs().subtract(5, 'month').format('YYYY-MM'), dayjs().endOf('month').format('YYYY-MM')]);
let year = ref([dayjs().subtract(4, 'year').format('YYYY'), dayjs().endOf('year').format('YYYY')]);

onMounted(() => {
  dayjs.extend(quarterOfYear);
  dayjs.locale('zh-cn');
  watch(quarter, (qu) => {
    const date = [dayjs(qu[0]).format('YYYY-QQ'), dayjs(qu[1]).format('YYYY-QQ')];
    getQuarter({startTime: date[0], endTime: date[1]}).then(res => {
      const chart1 = echarts.init(quarterChart.value);
      if (res.success) {
        const result = res.data;
        const mapData = result.dataInfoMap;
        const x = result.dateList;
        const series = [];
        let key = '';
        for (const xKey in mapData) {
          key = xKey.split('/')[1];
          series.push({
            name: key,
            type: 'bar',
            barMaxWidth: '20',
            data: mapData[xKey].map(r=>({...r,value:r.examScore}))
          });
        }
        chart1.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            },
            formatter:function (params){
              var arr = []; // 接收所有数据
              var arrStr = ""; // 每一个数据
              for (var i = 0; i < params.length; i++) {
                arr.push(
                    `
                      <h3>${params[i].marker} ${params[i].seriesName}</h3>
                      <div>考核得分：${params[i].value || '-'}分（标准得分：${params[i].data.standardScore || '-'}分）</div>
                      <div>考核结果：${params[i].data.examResult || '-'}</div>
                    `
                );
              }
              arrStr = arr.join("<br/>");
              return  arrStr ;
              // return `
              //         <h3>${data.marker} ${data.seriesName}</h3>
              //         <div>考核得分：${data.value || '-'}分（标准得分：${data.data.standardScore || '-'}分）</div>
              //         <div>考核结果：${data.data.examResult || '-'}</div>
              //       `
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
            name: '分',
            type: 'value',
          },
          series: series
        });
      }
    })
  }, {immediate: true})

  watch(month, (qu) => {
    getMonth({startTime: qu[0], endTime: qu[1]}).then(res => {
      const chart1 = echarts.init(monthChart.value);
      if (res.success) {
        const result = res.data;
        const mapData = result.dataInfoMap;
        const x = result.dateList;
        const series = [];
        let key = ''
        for (const xKey in mapData) {
          key = xKey.split('/')[1];
          series.push({
            name: key,
            type: 'bar',
            barMaxWidth: '20',
            data: mapData[xKey].map(r=>({...r,value:r.examScore}))
          });
        }
        chart1.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            },
            formatter:function (params){
              const data = params[0];
              return `
                      <h3>${data.marker} ${data.seriesName}</h3>
                      <div>考核得分：${data.value || '-'}分（标准得分：${data.data.standardScore || '-'}分）</div>
                      <div>考核结果：${data.data.examResult || '-'}</div>
                    `
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
            name: '分',
            type: 'value',
          },
          series: series
        });
      }
    })
  }, {immediate: true})

  watch(year, (qu) => {
    getYear({startTime: qu[0], endTime: qu[1]}).then(res => {
      const chart1 = echarts.init(yearChart.value);
      if (res.success) {
        const result = res.data;
        const mapData = result.dataInfoMap;
        const x = result.dateList;
        const series = [];
        let key = ''
        for (const xKey in mapData) {
          key = xKey.split('/')[1];
          series.push({
            name: key,
            type: 'bar',
            barMaxWidth: '20',
            data: mapData[xKey].map(r=>({...r,value:r.examScore}))
          });
        }
        chart1.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            },
            formatter:function (params){
              const data = params[0];
              return `
                      <h3>${data.marker} ${data.seriesName}</h3>
                      <div>考核得分：${data.value || '-'}分（标准得分：${data.data.standardScore || '-'}分）</div>
                      <div>考核结果：${data.data.examResult || '-'}</div>
                    `
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
            name: '分',
            type: 'value',
          },
          series: series
        });
      }
    })
  }, {immediate: true})
})

</script>

<style scoped lang="scss">
.card_container {
  height: calc(100vh - 105px);
  width: calc(100vw - 270px);
  padding: 20px;

  .box-card {
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;

    .filter_box {
      margin-bottom: 8px;
    }

    .quarterChart, .monthChart, .yearChart {
      flex: 1;
    }
  }
}
</style>