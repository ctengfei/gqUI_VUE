<template>
    <div class="app-container" style="display: flex;flex-direction: column">
      <div class="real-time-container" ref="realTimeContainer">
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
              <el-table-column prop="qbaseflow" label="单元面积(km²)" width="109" align="center"/>
              <el-table-column prop="lengthRv" label="干流长度(km)" width="109" align="center"/>
              <el-table-column prop="slopeRv" label="河流坡度(%)" align="center"/>
              <el-table-column prop="meanElev" label="平均高程(m)" align="center"/>
            </el-table>
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
    getSluice, setIrrFloodRollForecastStatus
  } from "@/api/schedulingCtord/realtimeFor";
  import useDictionaryStore from "@/store/modules/dictionary";
  import {getPlanList, getShList} from "@/api/schedulingCtord/schSetting";
  import paramsDialog from '../paramsDialog'
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
  let select1 = ref('0'); // 预报区域
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
  let forecastPeriod = ref('');
  let dialogVisible1 = ref(false);
  let status = ref(1) // 0启动 1 暂停
  let x = [], y = [], maxX, maxY, minX, minY;
  let dateTimes = ref('')
  let lineData = ref({})
  
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

  
  function handleSetStatus() {
    setIrrFloodRollForecastStatus({status:status.value == 1 ? 0 : 1}).then(res=>{
      if(res.success){
        getPreioStatus()
      }
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
        if (properties.types == 'bch') {
          dialogTitle.value = properties.bnchName;
          dialogVisible.value = true;
          getForecastResultListByBnch({
            bnch: properties.bnch,
            caseCode: 'DEFAULT',
            rvskCode: properties.rvskCode,
          }).then(res => {
            if (res.success) {
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
          });
        }
        return true; // 停止遍历其他要素
      }, {hitTolerance: 50});  // hitTolerance 增加点击容错率
    });
  
    //获取方案预报时段
    getPlanList({
      caseCode: 'DEFAULT'
    }).then(res => {
      if (res.success) {
        forecastPeriod.value = res.data.data.filter(r => r.caseCode == 'DEFAULT')[0]
      }
    })
  
    //获取滚动预报状态
    getPreioStatus()
  
    //地图断面点位 & 预报河段
    getBasinBachList().then(res => {
      if (res.success) {
        options2.value = res.data.map(r => ({label: r.bnchName, value: r.bnch}));
        select2.value = options2.value.length ? options2.value[0].value : '';
        rvskCode.value = res.data[0].rvskCode;
        vector.getFeatures().forEach(r => {
          if (r.getProperties().types == 'bch') {
            vector.removeFeature(r)
          }
        })
        const features = res.data.map(r => {
          const feature = new Feature({
            geometry: new Point([parseFloat(r.bnchLon), parseFloat(r.bnchLat)]),
          });
          feature.setStyle(new Style({
            image: new Icon({
              src: useFile('yuliangzhan'),
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
                color: '#0821c3',
              }),
              backgroundStroke: new Stroke({
                color: 'rgba(255,255,255,.5)',
                lineCap: 'round',
                lineJoin: 'round',
                width: 1
              }),
              padding: [6, 30, 4, 30],
              offsetY: '-39',
              offsetX: '-15',
            })
          }));
          feature.setProperties({...r, types: 'bch'});
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
      }
    })
  
    // 断面列表
    getPlanForecastSectionList({caseCode: 'DEFAULT'}).then(res => {
      if (res.success) {
        tableData4.value = res.data;
      }
    })
  
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
  })
  
   
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
  
  watch([select1, hdTable], ([s1, hd]) => {
    if (s1 == 1 && hd) {
      hdHeight.value = hd.clientHeight;
    }
  })
  
  watch([select1, select2], ([s1, s2]) => {
    if (s1 == 1 && s2 && s2.length) { //阳武干渠
      // 头部统计
      getCardForecaset({
        rvskCode: rvskCode.value,
        caseCode: 'DEFAULT',
        type: '2',
        bnch: s2
      }).then(res => {
        if (res.success) {
          const result = res.data;
          statistics.value = result;
          statistics.value.rainfallLevel = foramtLevel(result.forecastRainfall24h)
        }
      })
    }
  }, {immediate: true})
  
  watch([select1, select3], ([s1, s3]) => {
    if (s1 == 0 && s3 && s3.length) { // 山洪片区
      // 头部统计
      getCardForecaset({
        wshCode: s3,
        caseCode: 'DEFAULT',
        type: '1'
      }).then(res => {
        if (res.success) {
          const result = res.data;
          statistics.value =result;
          statistics.value.rainfallLevel = foramtLevel(result.forecastRainfall24h)
        }
      })
    }
  }, {immediate: true})
  
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
    } else {
  
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
  </style>