<template>
  <div class="app-container" style="display: flex;flex-direction: column">
    <div class="card-container" v-show="select1 == 1">
      <li class="tab_1">
        <span class="title"><i></i>累积雨量(mm)</span>
        <div class="item-box">
          <div class="item">
            <span>12h</span>
            <span>{{ statistics.rainfall12h || 0 }}</span>
          </div>
          <div class="item">
            <span>6h</span>
            <span>{{ statistics.rainfall6h || 0 }}</span>
          </div>
          <div class="item">
            <span>3h</span>
            <span>{{ statistics.rainfall3h || 0 }}</span>
          </div>
        </div>
      </li>
      <li class="tab_2">
        <span class="title"><i></i>预报雨量(mm)</span>
        <div class="item-box">
          <div class="item">
            <span>24h</span>
            <span>{{ statistics.forecastRainfall24h || 0 }}</span>
          </div>
          <div class="item">
            <span>12h</span>
            <span>{{ statistics.forecastRainfall12h || 0 }}</span>
          </div>
          <div class="item">
            <span>6h</span>
            <span>{{ statistics.forecastRainfall6h || 0 }}</span>
          </div>
          <div class="item">
            <span>3h</span>
            <span>{{ statistics.forecastRainfall3h || 0 }}</span>
          </div>
        </div>
      </li>
      <li class="tab_3" :style="{backgroundColor:statistics.rainfallLevel.color,flex: 0.5}">
        <span class="title" :style="{'margin-bottom': '10px'}"><i></i>预报降雨等级</span>
        <strong>{{ statistics.rainfallLevel.name }}</strong>
      </li>
      <li class="tab_4">
        <span class="title" style="margin-bottom: 6px"><i></i>山洪监测水位预警</span>
        <div class="item-box" style="font-size: 13px">
          <div class="item">
            <span style="margin-bottom: 5px">断面个数</span>
            <span>{{ floodDetection.sectionNum || 0 }}</span>
          </div>
          <div class="item">
            <span style="margin-bottom: 5px">超警戒个数</span>
            <span>{{ floodDetection.beyondAlarmNum || 0 }}</span>
          </div>
          <div class="item">
            <span style="margin-bottom: 5px">超警戒小时</span>
            <span style="font-size: 16px">{{ floodDetection.beyondAlarmHours || 0 }}</span>
          </div>
        </div>
      </li>
      <li class="tab_5">
        <span class="title" style="margin-bottom: 6px"><i></i>山洪预报水位预警</span>
        <div class="item-box" style="font-size: 13px">
          <div class="item">
            <span style="margin-bottom: 5px">断面个数</span>
            <span>{{ floodForecast.sectionNum || 0 }}</span>
          </div>
          <div class="item">
            <span style="margin-bottom: 5px">超警戒个数</span>
            <span>{{ floodForecast.beyondAlarmNum || 0 }}</span>
          </div>
          <div class="item">
            <span style="margin-bottom: 5px">超警戒小时</span>
            <span style="font-size: 16px">{{ floodForecast.beyondAlarmHours || 0 }}</span>
          </div>
        </div>
      </li>
    </div>
    <div v-show="select1 == 1">
     
      <!-- <el-button style="margin-left: 40px" type="success" @click="dialogVisible1 = true">参数设置</el-button> -->
      <el-button style="margin-left: 10px" type="success" plain @click="select1 = 0">山洪入渠预报结果</el-button>
      <el-button style="margin-left: 40px" type="primary" plain @click="select1 = 3">渠道洪水演进结果</el-button>
      <div style="float: right;">
        <span style="margin-right: 20px"><strong>预报时段</strong>：{{
            `${forecastPeriod.forecastSTime} - ${forecastPeriod.forecastETime}`
          }}</span>
        <el-button style="margin-right: 20px" @click="handleSetStatus" :type="status==1 ?'primary':'success'">
          {{ `${status == 1 ? '启动' : '暂停'}滚动预报` }}
        </el-button>
      </div>
    </div>
    <div v-show="select1 == 0" class="real-time-container" ref="realTimeContainer">
      <div style="padding-bottom: 10px; display: flex; justify-content: space-between; border-bottom: 1px solid #e6e6e6; box-sizing: border-box;">
        <div style="display: flex; align-items: center">
          <div class="head-title">山洪入渠预报结果</div>
          <span style="margin-left: 20px"><strong>预报时段</strong>：{{
              `${forecastPeriod.forecastSTime} - ${forecastPeriod.forecastETime}`
            }}</span>
        </div>
        <div>
          <el-button style="" @click="dialogVisible1 = true" type="primary">山洪预报参数</el-button>
          <el-button type="primary" link :icon="ArrowLeftBold" @click="select1 = 1">返回</el-button>
        </div>
      </div>
      <div style="display: flex;margin-top: 10px">
        <div class="lf" :style="{height:height}">
          <li v-for="cha in chartIds" :id="cha" :key="cha"></li>
        </div>
        <div class="center" :style="{height:height}">
          <div class="head-title">山洪片区面雨量(mm)</div>
          <el-table :data="tableData1" :height="tableHeight" border>
            <el-table-column prop="TM" label="时间" align="center" :formatter="formatter">
            </el-table-column>
            <el-table-column v-for="o in tableHead" :prop="o.value" :label="o.label" :key="o" align="center"/>
          </el-table>
        </div>
        <div class="rg" :style="{height:height}">
          <div class="top">
            <div class="head-title">预报模型权重系数</div>
            <el-table :data="tableData2" height="80" border>
              <el-table-column prop="api" label="预报模型" align="center"/>
              <el-table-column prop="name1" label="重要性" align="center"/>
              <el-table-column prop="name2" label="权重系数" align="center"/>
            </el-table>
          </div>
          <div class="bottom">
            <div class="head-title" style="margin-top: 5px">计算单元基础属性状态查询</div>
            <el-table :data="tableData3" height="520" border>
              <el-table-column prop="wshName" label="单元名称" align="center"/>
              <el-table-column prop="areaWsh" label="单元面积(km²)" width="109" align="center"/>
              <el-table-column prop="lengthRv" label="干流长度(km)" width="109" align="center"/>
              <el-table-column prop="slopeRv" label="河流坡度(%)" align="center"/>
              <el-table-column prop="meanElev" label="平均高程(m)" align="center"/>
            </el-table>
          </div>
        </div>
      </div>
    </div>
    <div v-show="select1 == 1 || select1 == 0" class="real-boo-container">
      <div class="lf" ref="channelMap" id="channelMap">
      </div>
      <div class="rg">
        <div class="head-title" style="display: flex; justify-content: space-between">
          <span>渠道纵剖面</span>
          <el-date-picker
            v-model='channelDateTimes'
            type="datetime" 
            value-format="YYYY-MM-DD HH"
            format="YYYY-MM-DD HH:00"
            placeholder= '请选择开始时间'
            :clearable='true'
            @change="channelTimeChange"
          />
        </div>
        
          <!-- <lineChart :lineData='channelEchartData'/> -->
          <div ref="channelEchart" id="channelEchart" style="width: 100%;height: 200px;"></div>
        
        <!-- <div class="head-title">断面信息</div> -->
        <el-tabs type="bodrder-car" v-model="actTabName" @tab-click="handleTabClick">
          <el-tab-pane label="渠道实时水位"  name='3'>
            <div ref="hdTable" style="flex:1">
              <el-table :data="realTimeTable" height="670" border @row-click="handleRowChangeRain">
                <el-table-column prop="stName" label="名称" align="center"/>
                <el-table-column prop="z" label="水深" align="center"/>
                <el-table-column prop="tm" label="监测时间" align="center"/>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="渠道预报水位" name='1'>
            <div ref="hdTable" style="flex:1">
              <el-table :data="chnnelTable" height="670" border @row-click="handleRowChange" :row-class-name="tableRowClassName">
                <el-table-column prop="bnchName" label="断面名称" align="center"/>
                <el-table-column prop="chanName" label="渠道名称" align="center"/>
                <el-table-column prop="highestWater" label="最高水位(m)" align="center"/>
                <el-table-column prop="alarmWater" label="警戒水位(m)" align="center"/>
                <el-table-column prop="highestTime" label="最高水位时间" align="center"/>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="山洪预报流量"  name='2'>
            <div ref="hdTable" style="flex:1">
              <el-table :data="tableData4" height="670" border>
                <el-table-column prop="bnchName" label="断面名称" align="center"/>
                <el-table-column prop="maxQ" label="洪峰流量(m³/s)" align="center"/>
                <!-- <el-table-column prop="maxZ" label="最高水位(m)" align="center"/> -->
                <el-table-column prop="floodVolume" label="洪量(m³)" align="center"/>
                <el-table-column prop="tm" label="峰现时间" align="center"/>
              </el-table>
            </div>
          </el-tab-pane>
          
        </el-tabs>
      </div>
    </div>
    <div v-show="select1 == 3" class="real-hydrody-container">
      <div style="margin-bottom: 10px; display: flex; justify-content: space-between">
        <div style="display: flex; align-items: center">
          <div class="head-title">渠道洪水演进结果</div>
          <span style="margin-left: 20px"><strong>预报时段</strong>：{{
              `${forecastPeriod.forecastSTime} - ${forecastPeriod.forecastETime}`
            }}</span>
        </div>
        <div>
          <el-button style="" @click="dialogVisible2 = true" type="primary">水动力模型参数</el-button>
          <el-button type="primary" link :icon="ArrowLeftBold" @click="select1 = 1">返回</el-button>
        </div>
      </div>
      <div class="hydrody">
        <div class='lineChartDv'>
          <div>
            <span>时间：</span>
            <el-date-picker
              v-model='chanResTimeModel'
              type="datetime" 
              value-format="YYYY-MM-DD HH:00:00"
              format="YYYY-MM-DD HH:mm:ss"
              placeholder= '请选择开始时间'
              :clearable='true'
            />
            <el-button type='primary' style='margin-left: 20px' @click='chanResTimeModelChange(0)'>查询</el-button>
          </div>
            <signLineChart class="chartsLine" :lineData="chanTimeEchartData"/>

        </div>
        <div class='lineChartDv' style="display: flex; flex-direction: column; flex: 1">
            <div style='height: 50%;'>
                <!-- <div>
                    <span>时间：</span>
                    <el-date-picker
                        v-model='areaRainfallModel'
                        type="datetimerange" 
                        value-format="YYYY-MM-DD HH:00:00"
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder= '请选择时间'
                        :clearable='true'
                        />
                    <el-button type='primary' style='margin-left: 20px' @click='areaRainfallChange()'>查询</el-button>
                </div> -->
                    <!-- <multipleLineChart  class="chartsLine" :lineData="bnchEchartData"/> -->
                    <endLineChart class="rightChartLine" :lineData="areaRainData"/>
            </div>
            <div style='height: 50%;'>
                <div>
                    <span>断面名称：</span>
                    <el-select v-model="bnchCodeModel">
                    <el-option
                        v-for="item in bnchArr"
                        :key="item.bnch"
                        :label="item.bnch"
                        :value="item.bnch"
                    />
                    </el-select>
                    <el-button type='primary' style='margin-left: 20px' @click='chanResTimeModelChange(1)'>查询</el-button>
                </div>
                    <!-- <multipleLineChart  class="chartsLine" :lineData="bnchEchartData"/> -->
                    <signLineChart  class="rightChartLine" :lineData="bnchEchartData"/>
            </div>
        </div>
      </div>
    </div>
  </div>
  <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      class="runoff-dialog"
      width="60%"
  >
    <div class="brchChart" ref="brchChart">

    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">
          关闭
        </el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 参数设置 -->
  <paramsDialog v-model:dialogVisible="dialogVisible1"/>
  <hydrodyModel v-model:dialogVisible="dialogVisible2" />
</template>

<script setup>
import {nextTick, onMounted, ref, watch, onBeforeUnmount} from 'vue';
import {
  getBaseData, getBasinBachList, getCardForecaset,
  getChanChart, getForecastResultListByBnch, getIrrFloodRollForecastDetails, getPlanForecastSectionList,
  getRainInfo,
  getRainShChart,
  getRainTable,
  getReachInfo,
  getSluice, setIrrFloodRollForecastStatus,
  floodDetectionAlarm,
  floodForecastAlarm,
  parmAlarmStList,
  preBnchlist,
  getRiverRBy,
  getResultBnchHydro,
  getChannelProfile,
  getPreAlarmList,
  getChaneParmList,
  getRealWater
} from "@/api/schedulingCtord/realtimeFor";
import useDictionaryStore from "@/store/modules/dictionary";
import {getPlanList, getShList, getChanFloodReultBy,getIrrAreaRainfallList} from "@/api/schedulingCtord/schSetting";
import paramsDialog from './components/paramsDialog'
import * as echarts from "echarts";
import channelJSON from '@/global/main_channel.json';
import GeoJSON from 'ol/format/GeoJSON';
import {sessionStorage, sleep} from "@/utils";
import dayjs from "dayjs";
import Map from "ol/Map";
import {defaults as defaultControls, ScaleLine} from "ol/control";
import View from "ol/View";
import {Tile as TileLayer, Vector as VectorLayer} from "ol/layer";
import {Vector as VectorSource, XYZ} from "ol/source";
import {Fill, Icon, Stroke, Style, Text} from "ol/style";
import CircleStyle from "ol/style/Circle";
import {Feature} from "ol";
import {Point, LineString} from "ol/geom";
import {TileSuperMapRest} from "@supermap/iclient-ol";
import {MAP_URL,TDT_URL} from "@/global";
import { ArrowLeftBold, Edit, Finished, Setting } from '@element-plus/icons-vue';
import signLineChart from './components/signLineChart'
import endLineChart from './components/endLineChart'
import multipleLineChart from './components/multipleLineChart'
import hydrodyModel from './components/hydrodyModel'


const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
const {proxy} = getCurrentInstance();
const dictStore = useDictionaryStore();
const realTimeContainer = ref();
const brchChart = ref();
const hdTable = ref();
let height = ref('700px');
let width = ref('700px');
let tableHeight = ref(400);
let hdHeight = ref('100%');
let statistics = ref({rainfallLevel:{}});
let select1 = ref('1'); // 预报区域
let options1 = ref(dictStore.getDict('IRR_FLOOD_FORECAST_UNIT'))
let select2 = ref(''); // 预报河段选择
let options2 = ref([]);
let select3 = ref();
let options3 = ref([]);
let chartIds = ref([]);
const channelMap = ref(null);
const tableHead = ref([]);
let tableData1 = ref([]);
let tableData2 = ref([{api: 'API模型', name1: '1', name2: '1'}]);
let tableData3 = ref([]);
let tableData4 = ref([]);
let dialogVisible = ref(false);
let dialogTitle = ref('');
let rvskCode = ref('');
let forecastPeriod = ref({
  forecastSTime:"",
  forecastETime:""
});
let dialogVisible1 = ref(false);
let status = ref(1) // 0启动 1 暂停
let x = [], y = [], maxX, maxY, minX, minY;
let dateTimes = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));
let lineData = ref({});
let actTabName = ref('3');
let dialogVisible2 = ref(false);
let floodForecast = ref({}); // 山洪预报
let floodDetection = ref({}); // 山洪监测
let channelEchartData = ref({}); 
let channelDateTimes = ref(dayjs().format('YYYY-MM-DD HH:00:00'));
let chanResTimeModel = ref(dayjs().format('YYYY-MM-DD HH:00:00'));
let areaRainfallModel = ref([dayjs().format('YYYY-MM-DD HH:00:00'), dayjs().format('YYYY-MM-DD HH:00:00')])
let channelEchart = ref();
let chnnelTable = ref([]);
let realTimeTable = ref([]);
let bnchArr = ref([]);
let bnchCodeModel = ref('');
let chanTimeEchartData = ref({});
let bnchEchartData = ref({});
let areaRainData = ref({});

const vector = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vector,
  properties: {title: `base-vector`, id: 'v01'},
  style: new Style({
    fill: new Fill({
      color: 'rgba(249, 231, 159 , 0.2)',
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 6,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: 'rgba(2231, 76, 60 , 0.5)',
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
    }),
  }),
  zIndex: 25,
  declutter: true,
  visible: true,
});
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
const geoJson = new GeoJSON();
let map = ref(null);
const formatter = (row) => {
  return dayjs(row.TM).format('MM-DD HH:mm')
}
onBeforeUnmount(() => {
  map.value.setTarget(null);
  map.value = null;
})

function useFile(name) {
  return new URL(`../../../assets/imgs/${name}.png`, import.meta.url).href;
}

function handleRowChange(row) {
  const features = vector.getFeatures().find((r) => r.getProperties().bnch == row.bnch);
  map.value.getView().fit(features.getGeometry(), { duration: 600, maxZoom: 16 });
}
function handleRowChangeRain(row) {
  const features = vector.getFeatures().find((r) => r.getProperties().stcd == row.stcd);
  map.value.getView().fit(features.getGeometry(), { duration: 600, maxZoom: 16 });
}

function handleSetStatus() {
  setIrrFloodRollForecastStatus({status:status.value == 1 ? 0 : 1}).then(res=>{
    if(res.success){
      getPreioStatus()
    }
  })
}

function handleTabClick(row) {
  if(row.props.name==1){
      // 预报断面列表
      preBnchlist().then(res=>{
        vector.getFeatures().forEach(r => {
          if (r.getProperties().types == 'pre' || r.getProperties().types == 'param') {
            vector.removeFeature(r)
          }
        })
        const features = res.data.map(r => {
          const feature = new Feature({
            geometry: new Point([parseFloat(r.lon), parseFloat(r.lat)]),
          });
          feature.setStyle(new Style({
            image: new Icon({
              src: useFile('duchao'),
              scale: 1,
              size: [50, 50],
            }),
            text: new Text({
              text: r.bnchName,
              textAlign: 'center',
              textBaseline: 'middle',
              font: '14px font-size',
              fill: new Fill({
                color: '#fff'
              }),
              backgroundFill: new Fill({
            color: '#1a8dff',
          }),
          backgroundStroke: new Stroke({
            color: '#1a8dff',
            lineCap: 'round',
            lineJoin: 'round',
            width: 10
          }),
          padding: [6, 4, 4, 4],
              offsetY: '-39',
              offsetX: '-15',
            })
          }));
          feature.setProperties({...r, types: 'pre'});
          return feature;
        })
        vector.addFeatures(features)
        const coordinates = features.map((r) => r.getGeometry().getCoordinates());
        const str = JSON.stringify(coordinates);
        const coord = str.match(/\[\d+.?(\d+)?,\d+.?(\d+)?\]/g).map((r) => JSON.parse(r));
        coord.forEach((r) => {
          x.push(r[0]);
          y.push(r[1]);
        });
        maxX = Math.max(...x);
        maxY = Math.max(...y);
        minX = Math.min(...x);
        minY = Math.min(...y);
        const coords = [
          [minX, maxY],
          [maxX, maxY],
          [maxX, minY],
          [minX, minY],
          [minX, maxY],
        ];
        const feature = new Feature({geometry: new LineString(coords)});
        vector.addFeatures(feature)
        // map.value.getView().fit(feature.getGeometry(), {duration: 600, padding: [0, 90, 0, 90]});
      })
  }
  if(row.props.name==3){
    console.log("-----"+3)
    parmAlarmStListFunc()
  }
}

//渠道预报水位-超警戒高亮展示
const tableRowClassName = (row, rowIndex) =>{
  if(row.row.isBeyondAlarm === 1){
    return 'rowHightclass';
  }else{
    return '';
  }
};

function parmAlarmStListFunc(){
  // 实际监测断面列表
  parmAlarmStList().then(res=>{
    vector.getFeatures().forEach(r => {
      if (r.getProperties().types == 'param' || r.getProperties().types == 'pre') {
        vector.removeFeature(r)
      }
    })
    const features = res.data.map(r => {
      const feature = new Feature({
        geometry: new Point([parseFloat(r.lon), parseFloat(r.lat)]),
      });
      feature.setStyle(new Style({
        image: new Icon({
          src: useFile('shuiweizhan'),
          scale: 1,
          size: [50, 50],
        }),
        text: new Text({
          text: r.stnm,
          textAlign: 'center',
          textBaseline: 'middle',
          font: '14px font-size',
          fill: new Fill({
            color: '#fff'
          }),
          backgroundFill: new Fill({
            color: '#1a8dff',
          }),
          backgroundStroke: new Stroke({
            color: '#1a8dff',
            lineCap: 'round',
            lineJoin: 'round',
            width: 10
          }),
          padding: [6, 4, 4, 4],
          offsetY: '-45',
          offsetX: '-15',
        })
      }));
      feature.setProperties({...r, types: 'param'});
      return feature;
    })
    vector.addFeatures(features)
    const coordinates = features.map((r) => r.getGeometry().getCoordinates());
    const str = JSON.stringify(coordinates);

    const coord = str.match(/\[\d+.?(\d+)?,\d+.?(\d+)?\]/g).map((r) => JSON.parse(r));
    coord.forEach((r) => {
      x.push(r[0]);
      y.push(r[1]);
    });
    maxX = Math.max(...x);
    maxY = Math.max(...y);
    minX = Math.min(...x);
    minY = Math.min(...y);
    const coords = [
      [minX, maxY],
      [maxX, maxY],
      [maxX, minY],
      [minX, minY],
      [minX, maxY],
    ];
    const feature = new Feature({geometry: new LineString(coords)});
    vector.addFeatures(feature)
    map.value.getView().fit(feature.getGeometry(), {duration: 600, padding: [0, 90, 0, 90]});
  })
}

onMounted(() => {
  map.value = new Map({
    target: 'channelMap',
    controls: defaultControls({
      zoom: false,
    }).extend([
      new ScaleLine({
        units: 'metric',
      }),
    ]),
    view: new View({
      center: [114.78552598843835, 29.85968153139809],
      projection: 'EPSG:4326',
      zoom: 10,
    }),
  });
  map.value.addLayer(TiandiMap_img);
  map.value.addLayer(TiandiMap_imgLabel);
  map.value.addLayer(pianQu);
  map.value.addLayer(vectorLayer);
  // 干渠
  const features = geoJson.readFeatures(channelJSON);
  //添加干渠
  vector.addFeatures(features);
  map.value && map.value.on('click', (event) => {
    map.value.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
      let properties = feature.getProperties();
      if (properties.types == 'param') {
        dialogTitle.value = properties.stnm;
        dialogVisible.value = true;
        getRiverRBy({stcd: properties.stcd}).then(res=>{
          if(res.success) {
            const char = echarts.init(brchChart.value);
            const result = res.data.reverse();
            const xAxis = result.map(r => dayjs(r.tm).format('MM-DD HH:mm'));
            const sw = result.map(r => r.z);
            const ll = result.map(r => r.q);
            char.setOption({
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
                  data: xAxis,
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
                  name: '水位(m)',
                  type: 'value',
                  nameLocation: 'end',
                },
              ],
              series: [
                {
                  name: '流量',
                  type: 'line',
                  yAxisIndex: 0,
                  showSymbol: false,
                  smooth: true,
                  tooltip: {
                    valueFormatter: function (value) {
                      return value + ' m³/s';
                    }
                  },
                  data: ll
                },
                {
                  name: '水位',
                  type: 'line',
                  yAxisIndex: 1,
                  showSymbol: false,
                  smooth: true,
                  tooltip: {
                    valueFormatter: function (value) {
                      return value + ' m';
                    }
                  },
                  data: sw
                },
              ]
            }, true);
          }
        })
      }else if(properties.types == 'pre'){
        dialogTitle.value = properties.bnchName;
        dialogVisible.value = true;
        getResultBnchHydro({
          bnch: properties.bnch,
          chanCode: properties.chanCode,
          planStartTime:forecastPeriod.value.forecastSTime,
          planEndTime:forecastPeriod.value.forecastETime
        }).then(res=>{
          //  console.log(res);
          if(res.success) {
            const char = echarts.init(brchChart.value);
            const result = res.data.reverse();
            const xAxis = result.map(r => dayjs(r.tm).format('MM-DD HH:mm'));
            const sw = result.map(r => r.z);
            const ll = result.map(r => r.q);
            const WD = result.map(r => r.waterDepth);
            char.setOption({
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
                  data: xAxis,
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
                  name: '水位(m)',
                  type: 'value',
                  nameLocation: 'end',
                },
              ],
              series: [
                {
                  name: '流量',
                  type: 'line',
                  yAxisIndex: 0,
                  showSymbol: false,
                  smooth: true,
                  tooltip: {
                    valueFormatter: function (value) {
                      return value + ' m³/s';
                    }
                  },
                  data: ll
                },
                {
                  name: '水位',
                  type: 'line',
                  yAxisIndex: 1,
                  showSymbol: false,
                  smooth: true,
                  tooltip: {
                    valueFormatter: function (value) {
                      return value + ' m';
                    }
                  },
                  data: sw
                },
                {
                  name: '水深',
                  type: 'line',
                  yAxisIndex: 1,
                  showSymbol: false,
                  smooth: true,
                  tooltip: {
                    valueFormatter: function (value) {
                      return value + ' m';
                    }
                  },
                  data: WD
                },
              ]
            }, true);
          }
        })
      }
      return true; // 停止遍历其他要素
    }, {hitTolerance: 50});  // hitTolerance 增加点击容错率
  });

  //获取方案预报时段
  getPlanList({
    caseCode: 'DEFAULT'
  }).then(res => {
    if (res.success) {
      forecastPeriod.value = res.data.data.filter(r => r.caseCode == 'DEFAULT')[0];
      getCardForecaset({
          endTime: forecastPeriod.value.forecastSTime
        }).then(res => {
          if (res.success) {
            const result = res.data;
            statistics.value = result;
            statistics.value.rainfallLevel = foramtLevel(result.forecastRainfall24h)
          }
        })
      //模拟一个预报时段时间(后续模型程序成功后删除)
      // const currentTime = new Date();
      // let month = currentTime.getMonth()+1;
      // if(month < 10){
      //   month = '0' + month;
      // }
  
      // if(currentTime.getHours() >= 9 && currentTime.getHours() < 18 ){
      //   forecastPeriod.value.forecastSTime = currentTime.getFullYear()+'-'+ month + '-' + currentTime.getDate() + ' '+ '08:00';
      //   forecastPeriod.value.forecastETime = currentTime.getFullYear()+'-'+ month + '-' + (currentTime.getDate()+1) + ' '+ '08:00';
      // }else if(currentTime.getHours() >= 18 ){
      //   forecastPeriod.value.forecastSTime = currentTime.getFullYear()+'-'+ month + '-' + currentTime.getDate() + ' '+ '18:00';
      //   forecastPeriod.value.forecastETime = currentTime.getFullYear()+'-'+ month + '-' + (currentTime.getDate()+1) + ' '+ '18:00';
      // }else if(currentTime.getHours() < 9){
      //   forecastPeriod.value.forecastSTime = currentTime.getFullYear()+'-'+ month + '-' + (currentTime.getDate()-1) + ' '+ '18:00';
      //   forecastPeriod.value.forecastETime = currentTime.getFullYear()+'-'+ month + '-' + currentTime.getDate() + ' '+ '18:00';
      // }
      // dayjs(forecastPeriod.value.forecastSTime).format('YYYY-MM-DD HH:00');
      // dayjs(forecastPeriod.value.forecastETime).format('YYYY-MM-DD HH:00')

        // 断面列表
        getPlanForecastSectionList({
          caseCode: 'DEFAULT',
          startTime: forecastPeriod.value.forecastSTime,
          endTime: forecastPeriod.value.forecastETime
        }).then(ress => {
          if (ress.success) {
            tableData4.value = ress.data;
          }
        })

        //渠道预报水位列表
        getPreAlarmList(
          {
            caseCode: 'DEFAULT',
            startTime: forecastPeriod.value.forecastSTime,
            endTime: forecastPeriod.value.forecastETime
          }
        ).then(res=>{
          if(res.success) {
            chnnelTable.value = res.data;
          }
        })

        // 山洪预报预警(断面个数) floodForecastAlarm,
        floodForecastAlarm(
          {
            caseCode: 'DEFAULT',
            startTime: forecastPeriod.value.forecastSTime,
            endTime: forecastPeriod.value.forecastETime
          }
        ).then(res=>{
          floodForecast.value = res.data;
        })

    }
  })


  // 山洪监测预警 floodDetectionAlarm,
  floodDetectionAlarm().then(res => {
    floodDetection.value = res.data;
  })



parmAlarmStListFunc();
  
  //获取滚动预报状态
  getPreioStatus()

  // 山洪片区
  getShList().then(res => {
    if (res.success) {
      tableHead.value = res.data.reverse().map(r => ({label: r.wshName, value: r.wshCode}))
      options3.value = res.data.map(r => ({label: r.wshName, value: r.wshCode}));
      select3.value = res.data.length ? res.data[0].wshCode : '';
    }
  })

  // 山洪片区面雨量
  getRainTable({caseCode: 'DEFAULT',}).then(res => {
    if (res.success) {
      tableData1.value = res.data;
    }
  })


  //基本属性
  getBaseData().then(res => {
    if (res.success) {
      tableData3.value = res.data;
    }
  })
  getChannelEchart();


  // 获取实时水位
  getRealWater().then(res=>{
    if(res.success) {
      realTimeTable.value = res.data;
    }
  })


  // 获取渠道断面列表
  getChaneParmList(
        
    ).then(res=>{
        bnchArr.value = res.data.parmRoughnessHydraulicVOs
    })
})

// 渠道洪水演进结果  时间  断面查询
const chanResTimeModelChange = (val) => {
  if(!val){
    getChanFloodReultBy(
      {
        byType: val,
        caseCode: 'DEFAULT',
        time: chanResTimeModel.value
      }
    ).then(res=>{
      
      let temp = res.data;
      let xData = [];
      let yData = [];
      let y1Data = [];
      let xLine = "底高"
      xData = temp.map(item=>item.distance);
      yData = temp.map(item=>item.z);
      y1Data = temp.map(item=>item.q);
      chanTimeEchartData.value = { xData, yData,y1Data,xLine }
    })
  }else{
    let chanList =[];
    let areaRainfallList =[];
    getChanFloodReultBy(
      {
        byType: val,
        caseCode: 'DEFAULT',
        banchCode: bnchCodeModel.value,
        startTime:forecastPeriod.value.forecastSTime,
        endTime:forecastPeriod.value.forecastETime
      }
    ).then(res=>{
      chanList = res.data;
      let xData = [];
      let yData = [];
      let y1Data = [];
      let y2Data = [];
      let xLine = "时间"
      xData = chanList.map(item=>item.tm);
      yData = chanList.map(item=>item.z);
      y1Data = chanList.map(item=>item.q);
    //   y2Data = areaRainfallList.map(item=>item.p);
      bnchEchartData.value = { xData, yData,y1Data, xLine }
    })
    // getIrrAreaRainfallList(
    //   {
    //     startTime: forecastPeriod.value.forecastSTime,
    //     endTime: forecastPeriod.value.forecastETime,
    //     banchCode: bnchCodeModel.value,
    //   }
    // ).then(res=>{
    //   areaRainfallList = res.data;
    // })
      
  }
}

// 渠道纵剖面图时间查询
const channelTimeChange = (val)=>{
  channelDateTimes.value = val
  getChannelEchart();
}


// 渠道洪水面雨量查询
const areaRainfallChange = () => {
    getIrrAreaRainfallList(
      {
        startTime: forecastPeriod.value.forecastSTime,
        endTime: forecastPeriod.value.forecastETime,
      }
    ).then(res=>{
        let temps = res.data;
        let xData = temps.map(item=>item.tm);
        let yData = temps.map(item=>item.p);
        areaRainData.value = { xData, yData}
    //   areaRainfallList = res.data;
    })
}


// 渠道纵剖面图
const getChannelEchart = () => {
  getChannelProfile(
    {
      caseCode: 'DEFAULT',
      chanCode: '',
      tm: channelDateTimes.value,
    }
  ).then(res=>{
    if(res.success) {
      let temp = res.data;
      let xData = [];
      let yData = [];
      let yzData = [];
      let yalertData = [];
      //获取y轴范围
      let maxVal = 60;
      let minVal = 0;
      if(temp.length > 0) {
        yData = temp.map(item=>item.elevMin)
        xData = temp.map(item=>item.distance)
        yzData = temp.map(item=>item.z)
        yalertData = temp.map(item=>item.alarmV)

        //获取y轴最小值与最大值
        let maxvaly = Math.max(...Object.values(yData));
        maxvaly = Math.ceil(maxvaly);
        let minvaly = Math.min(...Object.values(yData));
        minvaly = Math.floor(minvaly);

        let maxvalyz = Math.max(...Object.values(yzData));
        maxvalyz = Math.ceil(maxvalyz);
        let minvalyz = Math.min(...Object.values(yzData));
        minvalyz = Math.floor(minvalyz);

        let maxvalyalert = Math.max(...Object.values(yalertData));
        maxvalyalert = Math.ceil(maxvalyalert);

        maxVal = Math.max(maxvaly, maxvalyz, maxvalyalert);
        minVal = Math.min(minvaly,minvalyz);
        console.log(xData)

      }
      const lines = echarts.init(channelEchart.value);
    //灌溉流量图
    lines.setOption({
        title: {
            text: '总干渠',
            textStyle: {
                color: '#1791FF',
                fontSize: 16
            },
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['底高','预报水位','警戒线']
        },
        grid: {
            left: '5%',
            right: '9%',
            bottom: '4%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: '距离',
            axisLabel: {
              formatter: function (value) {
                // 找到最接近 value 的 xData 元素的索引
                let closestIndex = xData.reduce((prev, curr, index) => Math.abs(curr - value) < Math.abs(xData[prev] - value) ? index : prev, 0);
                return xData[closestIndex].toFixed(1); // 根据需要调整小数点后位数
              }
          }
        },
        yAxis: {
            name: '高度(m)',
            type: 'value',
            min: minVal, // 设置最小值
            max: maxVal, // 设置最大值
        },
        series: [
            {
                name: '底高',
                type: 'line',
                // stack: 'Total',
                data: xData.map((x, i) => [x, yData[i]])
            },
            {
                name: '预报水位',
                type: 'line',
                // stack: 'Total',
                data: xData.map((x, i) => [x, yzData[i]])
            },
            {
                name: '警戒线',
                type: 'line',
                // stack: 'Total',
                data: xData.map((x, i) => [x, yalertData[i]]),
                lineStyle: {
                    color: 'red', // 设置曲线颜色
                }
            },
        ],
        animationDuration: 0,
        animationEasing: 'cubicInOut'
    }, true);
    }
  })
}

// 水动力参数
const getChanFloodResult = () => {
  
}

function getPreioStatus() {
  getIrrFloodRollForecastDetails().then(res => {
    if (res.success) {
      status.value = res.data;
    }
  })
}

function foramtLevel(val) {
  if(val == 0){ // 无雨
    return  {
      name:'无雨',
      color:'#ddd',
      level:'0'
    }
  }else if(val >=250){ // 特大暴雨
    return {
      name:'特大暴雨',
      color:'#cc00ff',
      level:'250'
    }
  }else if(val > 0 && val < 10){ // 小雨
    return {
      name:'小雨',
      color:'#4adb1b',
      level:'0-10'
    }
  }else if(val >= 10 && val < 25){ // 中雨
    return {
      name:'中雨',
      color:'#ebeb00',
      level:'10-25'
    }
  }else if(val >= 25 && val < 50){ // 大雨
    return {
      name:'大雨',
      color:'#ff8100',
      level:'25-50'
    }
  }else if(val >= 50 && val < 100){ // 暴雨
    return {
      name:'暴雨',
      color:'#e55050',
      level:'50-100'
    }
  }else if(val >= 100 && val < 250){ // 大暴雨
    return {
      name:'大暴雨',
      color:'#a907a9',
      level:'100-250'
    }
  }
}

watch(select1, (s1) => {
  if (s1 == 0) {
    nextTick(() => {
      height.value = `${realTimeContainer.value.clientHeight}px`;
      width.value = `${realTimeContainer.value.clientWidth}px`;
      tableHeight.value = realTimeContainer.value.clientHeight - 27;
    })
    //山洪径流图
    getRainShChart({caseCode: 'DEFAULT',}).then(async (res) => {
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
              },
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
  } else if(s1 == 3){
    // 获取渠道断面列表
    getChaneParmList().then(res=>{
        bnchArr.value = res.data.parmRoughnessHydraulicVOs;
        bnchCodeModel.value = res.data.parmRoughnessHydraulicVOs[0].bnch;
        getChanFloodReultBy(
          {
            byType: 1,
            caseCode: 'DEFAULT',
            banchCode: bnchCodeModel.value,
            startTime:forecastPeriod.value.forecastSTime,
            endTime:forecastPeriod.value.forecastETime
          }
        ).then(res=>{
          if(res.success) {
            let temp = res.data;
            let xData = [];
            let yData = [];
            let xLine = "时间"
            xData = temp.map(item=>dayjs(item.tm).format('MM-DD HH:mm'));
            yData = temp.map(item=>item.z);
            bnchEchartData.value = { xData, yData, xLine }
          }
        })
        areaRainfallChange();
        //获取预报时间段降雨量
        // getIrrAreaRainfallList({
        //   startTime: forecastPeriod.value.forecastSTime,
        //   endTime: forecastPeriod.value.forecastETime,
        //   banchCode: bnchCodeModel.value,
        // }
        // ).then(res=>{
        //   let areaRainfallList = res.data;
        // })
    })
    getChanFloodReultBy(
      {
        byType: 0,
        caseCode: 'DEFAULT',
        time: chanResTimeModel.value
      }
    ).then(res=>{
      if(res.success) {
        let temp = res.data;
        let xData = [];
        let yData = [];
        let xLine = "距离"
        xData = temp.map(item=>item.distance);
        yData = temp.map(item=>item.z);
        chanTimeEchartData.value = { xData, yData, xLine }
      }
    })
  }
}, {immediate: true})
</script>

<style lang="scss">
.runoff-dialog .el-dialog__body {
  padding-bottom: 0 !important;
  padding-top: 10px !important;
}
</style>
<style scoped lang="scss">

:deep(.el-tabs__content){
  padding: 0 !important;
  margin-top: 5px !important;
}
.brchChart {
  height: 500px;
  width: 100%;
}

.head {
  display: flex;
  align-items: center;
}

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
    padding: 10px;
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

    .item-box {
      display: flex;
      width: 100%;
      font-weight: bold;
      font-size: 16px;
      font-weight: bold;

      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }
    }

    strong {
      font-size: 25px;
    }

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }

  .tab_1 span i {
    background: #2C9BFD;
  }

  .tab_2 span i {
    background: #57C777;
  }

  .tab_3 span i {
    background: #FC7F00;
  }

  .tab_4 span i {
    background: #AB82FF;
  }

  .tab_5 span i {
    background: #b69898;
  }

  .tab_1 {
    background-color: #4ca2f1;
  }

  .tab_2 {
    background-color: #75bcf7;
  }

  .tab_3 {
    background-color: #bd9dff;
  }

  .tab_4 {
    background-color: #4acbb9;
  }

  .tab_5 {
    background-color: #e48342;
  }
}

.real-time-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 700px;
  flex: 1;

  .lf {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    li {
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

    .top {
      flex: 1;
    }

    .bottom {
      flex: 1;
    }
  }
}

.runoff {
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
  overflow-x: hidden;

  li {
    width: calc(calc(100% / 2) - 5px);
    background: #F4F8FB;
    border-radius: 8px;
    height: 345px;
    margin-bottom: 10px;
  }

  li:nth-child(odd) {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}

.real-boo-container {
  display: flex;
  min-height: 700px;
  flex: 1;
  margin-top: 10px;

  .lf {
    display: flex;
    flex-wrap: wrap;
    flex: 0.7;
    overflow-y: auto;
    overflow-x: hidden;

    li {
      width: calc(calc(100% / 2) - 5px);
      background: #F4F8FB;
      border-radius: 8px;
      height: 345px;
      margin-bottom: 10px;
    }

    li:nth-child(odd) {
      margin-right: 10px;
      margin-bottom: 10px;
    }
  }

  .rg {
    display: flex;
    flex-direction: column;
    flex: 0.3;
    margin-left: 10px;
  }
}
.real-hydrody-container{
  display: flex;
  flex-direction: column;
  .hydrody{
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: space-between;
  }
  .lineChartDv{
    width: 49%;
    .chartsLine{
      width: 40vw;
      height: 70vh;
    }
    .rightChartLine{
        width: 40vw;
        height: 33vh;
    }
  }
  
}

:deep(.rowHightclass){
  background-color: red !important;
}

</style>