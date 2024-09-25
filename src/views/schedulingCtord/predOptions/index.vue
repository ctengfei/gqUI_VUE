<template>
  <div class="app-container" style="display:flex;flex-direction: column">
    <div style="display: flex;align-items: center">
      <span class="head-title" style="margin-right: 50px">方案预报结果</span>
      <span style="margin-left: 30px;font-weight: bold">预报区域：</span>
      <el-select v-model="select1">
        <el-option
            v-for="item in options1"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>
      <div v-show="select1 == 1">
        <span style="margin-left: 30px;font-weight: bold">预报河段选择：</span>
        <el-select v-model="select2">
          <el-option
              v-for="item in options2"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </div>
    </div>
    <div class="card-container">
      <li style="display: flex;flex-direction: column;align-items: flex-start">
        <span class="head-sub-title" style="color: #000;margin-bottom: 10px">山洪片区</span>
        <el-select v-model="select3">
          <el-option
              v-for="item in options3"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </li>
      <li>
        <span class="title"><i></i>累积雨量(mm)</span>
        <div class="item-box">
          <div class="item">
            <span>12h</span>
            <span>220.3</span>
          </div>
          <div class="item">
            <span>6h</span>
            <span>220.3</span>
          </div>
          <div class="item">
            <span>3h</span>
            <span>220.3</span>
          </div>
        </div>
      </li>
      <li>
        <span class="title"><i></i>预报雨量(mm)</span>
        <div class="item-box">
          <div class="item">
            <span>24h</span>
            <span>220.3</span>
          </div>
          <div class="item">
            <span>12h</span>
            <span>220.3</span>
          </div>
          <div class="item">
            <span>6h</span>
            <span>220.3</span>
          </div>
          <div class="item">
            <span>3h</span>
            <span>220.3</span>
          </div>
        </div>
      </li>
      <li>
        <span class="title" style="margin-bottom: 10px"><i></i>降雨等级</span>
        <strong>无</strong>
      </li>
      <li>
        <span class="title" style="margin-bottom: 6px"><i></i>预报洪水</span>
        <div class="item-box" style="font-size: 13px">
          <div class="item">
            <span style="margin-bottom: 5px">最高水位(m)</span>
            <span>220.3</span>
          </div>
          <div class="item">
            <span style="margin-bottom: 5px">峰现时间</span>
            <span>2023-8-10 9:00:00</span>
          </div>
        </div>
      </li>
      <li>
        <span class="title" style="margin-bottom: 10px"><i></i>最大流量 (m³/s)</span>
        <strong>1</strong>
      </li>
    </div>
    <div class="pop-container" ref="popContainer">
      <div class="lf" :style="{height:height}">
        <li v-for="cha in chartIds" :id="cha"></li>
      </div>
      <div class="center" :style="{height:height}">
        <div class="head-title">山洪片区面雨量(mm)</div>
        <el-table :data="tableData1" :height="tableHeight" border>
          <el-table-column prop="TM" label="时间" align="center" :formatter="formatter"/>
          <el-table-column v-for="o in tableHead" :prop="o.value" :label="o.label" align="center"/>
        </el-table>
      </div>
      <div class="rg" :style="{height:height}">
        <div class="head-title">新建预报方案</div>
        <el-form
            ref="fromInts"
            label-position="right"
            label-width="140px"
            :model="form1"
        >
          <el-form-item label="方案名称"
                        prop="caseName"
                        :rules="[{
                                required: true,
                                message: '请输入方案名称',
                                trigger: 'change',
                              }]">
            <el-input v-model="form1.caseName" placeholder="请输入方案名称"/>
          </el-form-item>
          <el-form-item style="margin-bottom: 5px" label="开始/结束时间"
                        prop="date"
                        :rules="[{
                                required: true,
                                message: '请选择时间',
                                trigger: 'change',
                              }]">
            <el-date-picker
                v-model="form1.date"
                type="datetimerange"
                range-separator="-"
                clearable
                value-format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
            />
          </el-form-item>
          <el-form-item style="margin-bottom: 6px">
            <el-checkbox v-model="form1.ifForecast" label="是否为预报模式"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="dialogVisible1 = true">模型设置</el-button>
            <el-button type="primary" @click="dialogVisible2 = true">参数设置</el-button>
            <el-button type="primary" @click="handleSave">保存方案</el-button>
          </el-form-item>
          <el-form-item label="选择方案">
            <pro-select v-model="plan" :data="planList" style="margin-right: 20px"/>
            <el-button type="success" @click="handleCompute" :disabled="disabled">方案计算</el-button>
          </el-form-item>
        </el-form>
        <el-divider/>
        <div class="head-title">预报模型权重系数</div>
        <el-table :data="tableData2" height="80" border>
          <el-table-column prop="api" label="预报模型" align="center"/>
          <el-table-column prop="name1" label="重要性" align="center"/>
          <el-table-column prop="name2" label="权重系数" align="center"/>
        </el-table>
        <div class="head-title" style="margin-top: 5px">山洪片区地理位置查看</div>
        <div ref="areaMap" style="width: 540px;height:286px" id="areaMap" >
        </div>
      </div>
    </div>
    <el-dialog
        v-model="dialogVisible1"
        title="预报参数设置"
        width="45%"
        :before-close="handleClose"
    >
      <el-form
          :inline="true"
          label-position="right"
          label-width="180px"
          :model="form2"
      >
        <el-form-item label="计算时间步长(s)">
          <el-input-number  v-model="form2.forecastInterval"/>
        </el-form-item>
        <el-form-item label="预报期长度(时段个数)">
          <el-input-number  v-model="form2.forecastPeriod"/>
        </el-form-item>
        <el-form-item label="降雨预见期长度(时段个数)">
          <el-input-number  v-model="form2.forecastPeriodRainfall"/>
        </el-form-item>
        <el-form-item label="流域汇流的预热期(天)">
          <el-input-number  v-model="form2.spinUpDay1"/>
        </el-form-item>
        <el-form-item label="河道汇流的预热期(天)">
          <el-input-number  v-model="form2.spinUpDay2"/>
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible1 = false">确定</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </span>
      </template>
    </el-dialog>
    <paramsDialog v-model:dialogVisible2="dialogVisible2" />
  </div>
</template>

<script setup>
import {getCurrentInstance, nextTick, onMounted, ref, watch} from 'vue';
import {addPlan, getSchemeCalculation} from "@/api/schedulingCtord/predOptions";
import {ElLoading, ElMessage} from "element-plus";
import paramsDialog from './component/paramsDialog'
import {getHdList, getPlanList, getShList} from "@/api/schedulingCtord/schSetting";
import {getBaseData, getRainInfo, getRainShChart, getRainTable} from "@/api/schedulingCtord/realtimeFor";
import {sessionStorage, sleep} from "@/utils";
import * as echarts from "echarts";
import dayjs from "dayjs";
import {MAP_URL,TDT_URL} from "@/global";
import Map from "ol/Map";
import {defaults as defaultControls, ScaleLine} from "ol/control";
import View from "ol/View";
import {Tile as TileLayer} from "ol/layer";
import {XYZ} from "ol/source";
import {TileSuperMapRest} from "@supermap/iclient-ol";
import useDictionaryStore from "@/store/modules/dictionary";
const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
const dictStore = useDictionaryStore();
const popContainer = ref();
const { proxy } = getCurrentInstance();
const areaMap =ref(null);
const fromInts = ref(null);
let form1 = ref({});
let form2 = ref({
  forecastInterval: '3600',
  forecastPeriod: '12',
  forecastPeriodRainfall: '12',
  spinUpDay1: '2',
  spinUpDay2: '2'
});
let height = ref('100%');
let width = ref('100%');
let tableHeight = ref(400);
let statistics = ref({});
let chartIds = ref([]);
let plan = ref('DEFAULT');
let tableHead = ref([]);
let planList = ref([]);
let select1 = ref('0');
let options1 = ref(dictStore.getDict('IRR_FLOOD_FORECAST_UNIT'))
let select2 = ref('1');
let options2 = ref([]);
let select3 = ref();
let options3 = ref([]);
let tableData1 = ref([]);
let tableData2 = ref([{api: 'API模型', name1: '1', name2: '1'}]);
let tableData3 = ref([]);
let disabled = ref(false);
let dialogVisible1 = ref(false);
let dialogVisible2 = ref(false);
let activeName = ref('1');
let downloadLoadingInstance = null
const TiandiMap_img = new TileLayer({
  name: "天地图影像图层",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true
  }),
  properties: {name: "天地图影像图层", id: 'v01', type: 'img'},
  visible: true
});
const TiandiMap_imgLabel = new TileLayer({
  name: "天地图影像注记",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=cia_w&tk=${MAP_TOKEN}&x={x}&y={y}&l={z}`,
    wrapX: true
  }),
  properties: {name: "天地图影像注记", id: 'v01', type: 'img'},
  visible: true
});
const pianQu = new TileLayer({
  source: new TileSuperMapRest({
    url: `/superMapUrl/iserver/services/map-ShanHongPianQuFanWei/rest/maps/basin_14_geo@%E5%B1%B1%E6%B4%AA%E7%89%87%E5%8C%BA%E8%8C%83%E5%9B%B4?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
    wrapX: true,
  }),
})
let map = ref(null);
const formatter = (row) => {
  return dayjs(row.TM).format('MM-DD HH:mm')
}

const handleClose = () => {
  form2.value = {
    forecastInterval: '3600',
    forecastPeriod: '12',
    forecastPeriodRainfall: '12',
    spinUpDay1: '2',
    spinUpDay2: '2'
  };
  dialogVisible1.value = false;
}

onMounted(() => {
  height.value = `${popContainer.value.clientHeight}px`;
  width.value = `${popContainer.value.clientWidth}px`;
  tableHeight.value = popContainer.value.clientHeight - 27;
  nextTick(()=>{
    map.value = new Map({
      target: 'areaMap',
      controls: defaultControls({
        zoom: false,
      }).extend([
        new ScaleLine({
          units: 'metric',
        }),
      ]),
      view: new View({
        center: [114.66207740965247, 29.87407547540882],
        projection: 'EPSG:4326',
        zoom: 12,
      }),
    });
    map.value.addLayer(TiandiMap_imgLabel)
    map.value.addLayer(TiandiMap_img)
    map.value.addLayer(pianQu);
  });

  // 山洪片区
  getShList().then(res=>{
    if(res.success){
      options3.value = res.data.map(r=>({label:r.wshName,value:r.wshCode}));
      select3.value = res.data.length ?res.data[0].wshCode : '';
    }
  })

  // 河段
  getHdList().then(res=>{
    if(res.success){
      options2.value = res.data.map(r=>({label:r.riverName,value:r.riverCode}));
      select2.value = options2.value.length ? options2.value[0].value : '';
    }
  })


  // 方案下拉
  getPlanList({
    pageNum: 1,
    pageSize: 999999999,
  }).then(res => {
    if (res.success) {
      planList.value = res.data.data.map(r => ({label: r.caseName, value: r.caseCode}));
      plan.value = planList.value.length ? planList.value[0].value : '';
    }
  })

  // 山洪片区
  getShList().then(res => {
    if (res.success) {
      tableHead.value = res.data.reverse().map(r => ({label: r.wshName, value: r.wshCode}))
      // options1.value = res.data.map(r => ({label: r.wshName, value: r.wshCode}));
      // select1.value = res.data.length ? res.data[0].wshCode : '';
    }
  })

  //基本属性
  getBaseData().then(res => {
    if (res.success) {
      tableData3.value = res.data;
    }
  })

  // 中间表格
  getRainTable({caseCode: plan.value}).then(res => {
    if (res.success) {
      tableData1.value = res.data;
    }
  })

  //左边径流图
  getRainShChart({caseCode: plan.value}).then(async (res) => {
    if (res.success) {
      let mergedData = {};
      res.data.forEach(r => {
        mergedData[r.wshCode] = mergedData[r.wshCode] || [];
        mergedData[r.wshCode].push(r);
      })
      chartIds.value = Object.keys(mergedData);
      // 延时一下代码执行  等容器渲染完
      await sleep(500);
      let dom = {};
      chartIds.value.forEach(r => {
        dom[r] = echarts.init(document.querySelector(`#${r}`))
      })
      Object.keys(mergedData).forEach(r => {
        const data = mergedData[r];
        let title = data[0].wshName;
        let x = data.map(r => dayjs(r.tm).format('MM-DD HH:mm'));
        let bar = data.map(r => r.p); //面雨量
        let line2 = data.map(r => r.qnat); //流量
        dom[r].setOption({
          title: {
            text: title,
            left: '100',
            textStyle: {
              fontSize: 14
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            }
          },
          grid: {
            left: '7%',
            right: '5%',
            bottom: '5%',
            top: '18%',
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
            }
          ],
          series: [
            {
              name: '流量',
              type: 'line',
              yAxisIndex: 0,
              tooltip: {
                valueFormatter: function (value) {
                  return value + ' m³/s';
                }
              },
              data: line2
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
          ]
        });
      })
    }
  })
})

watch(select1, (s1) => {
  // 头部统计
  getRainInfo({wshCode: s1, caseCode: plan.value}).then(res => {
    if (res.success) {
      statistics.value = res.data;
    }
  })
}, {immediate: true})

// 方案计算
const handleCompute = () => {
  disabled.value = true;
  downloadLoadingInstance = ElLoading.service({ text: "数据计算中，请稍候", background: "rgba(0, 0, 0, 0.7)", });
  getSchemeCalculation({planId: plan.value}).then(res=>{
    if(res.success){
      const timer = setTimeout(()=>{
        clearTimeout(timer);
        disabled.value = false;
        computeData();
        downloadLoadingInstance.close();
      },10000);
    }
  }).catch(e=>{
    disabled.value = false;
    downloadLoadingInstance.close();
  })
}
// 计算后刷新
const computeData = () => {
  // 头部统计
  getRainInfo({wshCode: select1.value, caseCode: plan.value}).then(res => {
    if (res.success) {
      statistics.value = res.data;
    }
  })
  // 山洪片区
  getShList().then(res => {
    if (res.success) {
      tableHead.value = res.data.reverse().map(r => ({label: r.wshName, value: r.wshCode}))
      // options1.value = res.data.map(r => ({label: r.wshName, value: r.wshCode}));
      // select1.value = res.data.length ? res.data[0].wshCode : '';
    }
  })

  //基本属性
  getBaseData().then(res => {
    if (res.success) {
      tableData3.value = res.data;
    }
  })

  // 中间表格
  getRainTable({caseCode: plan.value}).then(res => {
    if (res.success) {
      tableData1.value = res.data;
    }
  })

  //左边径流图
  getRainShChart({caseCode: plan.value}).then(async (res) => {
    if (res.success) {
      let mergedData = {};
      res.data.forEach(r => {
        mergedData[r.wshCode] = mergedData[r.wshCode] || [];
        mergedData[r.wshCode].push(r);
      })
      chartIds.value = Object.keys(mergedData);
      // 延时一下代码执行  等容器渲染完
      await sleep(500);
      let dom = {};
      chartIds.value.forEach(r => {
        dom[r] = echarts.init(document.querySelector(`#${r}`))
      })
      Object.keys(mergedData).forEach(r => {
        const data = mergedData[r];
        let title = data[0].wshName;
        let x = data.map(r => dayjs(r.tm).format('MM-DD HH:mm '));
        let bar = data.map(r => r.p); //面雨量
        let line2 = data.map(r => r.qnat); //流量
        dom[r].setOption({
          title: {
            text: title,
            left: '100',
            textStyle: {
              fontSize: 14
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            }
          },
          grid: {
            left: '7%',
            right: '5%',
            bottom: '5%',
            top: '18%',
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
            }
          ],
          series: [
            {
              name: '流量',
              type: 'line',
              yAxisIndex: 0,
              tooltip: {
                valueFormatter: function (value) {
                  return value + ' m³/s';
                }
              },
              data: line2
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
          ]
        });
      })
    }
  })
}

// 新建预报方案
const handleSave = () => {
  fromInts.value.validate((valid) => {
    if (valid) {
      addPlan({
        ...form1.value,
        ...form2.value,
        ifForecast:form1.value ? 1 : 0,
        "forecastEndTime": form1.value.date[0],
        "forecastStartTime": form1.value.date[1],
      }).then(res => {
        if (res.success) {
          ElMessage({
            message: '保存成功',
            type: 'success',
          });
          form1.value = {};
          form2.value = {
            forecastInterval: '3600',
            forecastPeriod: '12',
            forecastPeriodRainfall: '12',
            spinUpDay1: '2',
            spinUpDay2: '2'
          };
          getPlanList({
            pageNum: 1,
            pageSize: 999999999,
          }).then(res => {
            if (res.success) {
              planList.value = res.data.data.map(r => ({label: r.caseName, value: r.caseCode}));
            }
          })
        }
      })
    }
  })

}

</script>

<style scoped lang="scss">
.card-container {
  display: flex;
  margin: 10px 0;
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
    background-position: -100% 145%;
    background-repeat: no-repeat;
    background-size: 108%;
    color: #fff;

    .title {
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
    .item-box{
      display: flex;
      width: 100%;
      font-weight: bold;
      font-size: 16px;
      font-weight: bold;
      .item{
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }
    }
    strong {
      font-size: 25px;
    }

    &:nth-child(1) span i {

    }

    &:nth-child(2) span i {
      background: #2C9BFD;
    }

    &:nth-child(3) span i {
      background: #57C777;
    }

    &:nth-child(4) span i {
      background: #FC7F00;
    }

    &:nth-child(5) span i {
      background: #AB82FF;
    }

    &:nth-child(6) span i {
      background: #cb4a7a;
    }

    &:nth-child(1) {
    }

    &:nth-child(2) {
      background-color: #4ca2f1;
    }

    &:nth-child(3) {
      background-color: #75bcf7;
    }

    &:nth-child(4) {
      background-color: #bd9dff;
    }

    &:nth-child(5) {
      background-color: #4acbb9;
    }

    &:nth-child(6) {
      background-color: #89ce66;
    }

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }
}

.pop-container {
  display: flex;
  flex: 1;
  min-height: 730px;
  .lf {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    li {
      flex: 1;
      margin-bottom: 10px;
      min-height: 240px;
    }
    li:last-child {
      margin-bottom: 0;
    }
  }

  .center {
    width: 515px;
    margin: 0 10px;
  }

  .rg {
    display: flex;
    flex-direction: column;
    flex: 1;
    #areaMap{
      flex: 1;
    }
  }
}
:deep(.paramsDialog  .el-dialog__body){
  padding-top: 20px!important;
}
</style>