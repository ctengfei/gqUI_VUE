<template>
<div class="layer-container">
<!--  <el-select-v2 v-model="select1"-->
<!--                style="position: absolute;z-index: 999;left: 3%;top: 5%;width: 220px"-->
<!--                :options="options1" filterable placeholder="选择遥感图层"></el-select-v2>-->
<!--  <el-select-v2 v-model="select2"-->
<!--                style="position: absolute;z-index: 999;left: 3%;top: 10%;width: 220px"-->
<!--                :options="options2" filterable placeholder="选择土壤墒情图层"></el-select-v2>-->
  <div class="tips" @click="show">
    <i></i>
    <span>遥感监测列表</span>
  </div>
  <div class="point-list" :style="{ left: lef + '%' }">
    <div class="head">
      <h4>遥感监测列表</h4>
      <el-button type="primary" plain @click="hide" circle
                 style="width: 25px;height: 25px;border: 0;align-self: center">
        <ArrowLeftBold style="width: 1em; height: 1em;" />
      </el-button>
    </div>
    <div style="display:flex;align-items: center;margin-bottom: 10px;">
      <span style="margin-right: 10px;white-space: nowrap;width: 112px">遥感图层</span>
      <el-select-v2 v-model="select1" :options="options1" filterable style="width: 100%"
                    placeholder="选择图层"></el-select-v2>
    </div>
    <div style="display:flex;align-items: center;margin-bottom: 10px;">
      <span style="margin-right: 10px;white-space: nowrap">土壤墒情图层</span>
      <el-select-v2 v-model="select2" clearable :options="options2" filterable style="width: 100%"
                    placeholder="选择图层"></el-select-v2>
    </div>
      <el-table :data="tableData" show-summary  :summary-method="getSummaries" @row-click="rowSelect">
        <el-table-column type="index" align="center" label="序号" width="80" />
        <el-table-column prop="primage" align="center" label="含水量" >
          <template #default="{row}">
            <span>{{ formatTisp(row.primage) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="area" align="center" label="面积(km²)" />
      </el-table>
  </div>
  <div class="map-box" id="Amap">
  </div>
  <div class="legend">
    <span>土壤含水量</span>
    <li><span>低</span><span style="background: #f76c06;height: 5px"></span></li>
    <li><span>较低</span><span style="background: #f6aa43;height: 5px"></span></li>
    <li><span>中等</span><span style="background: #93e7fd;height: 5px"></span></li>
    <li><span>较高</span><span style="background: #5694f5;height: 5px"></span></li>
    <li><span>高</span><span style="background: #2c4ce7;height: 5px"></span></li>
  </div>
</div>
</template>
<script setup>
import {Tile as TileLayer, Vector as VectorLayer} from "ol/layer";
import {TileSuperMapRest} from "@supermap/iclient-ol";
import {Vector as VectorSource, XYZ} from "ol/source";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import Map from "ol/Map";
import {defaults as defaultControls, ScaleLine} from "ol/control";
import View from "ol/View";
import { MAP_URL,TDT_URL } from '@/global'
import {sessionStorage} from "@/utils";
import {onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import {getRemoteSelect} from "@/api/remoteMonitoring";
const { proxy } = getCurrentInstance();
const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
import {getRemoteSenseMapPrimageList} from "@/api/soilWaterStatistics";
let map = reactive(null);
let vector = ref();
let select1 = ref(null);
let options1 = ref([]);
let select2 = ref(null);
let options2 = ref([]);
let options3 = ref([
  {label: '高', value: '1'},
  {label: '较高', value: '2'},
  {label: '中等', value: '3'},
  {label: '较低', value: '4'},
  {label: '低', value: '5'},
])
let tableData = ref([]);
let lef = ref(2);
onMounted(()=>{
  const TiandiMap_img = new TileLayer({
    name: "天地图影像图层",
    source: new XYZ({
      url: `${TDT_URL}DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
      wrapX: true
    }),
    properties: { name: "天地图影像图层", id: 'v01',type:'img' },
    visible:true
  });
  const bj = new TileLayer({
    name: "边界",
    source: new TileSuperMapRest({
      url: `/superMapUrl/iserver/services/map-ugcv5-YaoGanYingXiangBianJieXianErWeiYaoGan/rest/maps/%E9%81%A5%E6%84%9F%E5%BD%B1%E5%83%8F%E8%BE%B9%E7%95%8C_%E7%BA%BF%40%E4%BA%8C%E7%BB%B4%E9%81%A5%E6%84%9F`,
      wrapX: true
    }),
    properties: { name: "边界", id: 'v01',type:'bj' },
    visible:true
  });
  vector.value = new VectorSource();
  map = new Map({
    layers: [TiandiMap_img,bj],
    target: "Amap",
    controls: defaultControls({
      zoom: false,
    }).extend([
      new ScaleLine({
        units: 'metric',
      }),
    ]),
    view: new View({
      center: [114.67547065067903 , 29.961664804842535],
      projection: 'EPSG:4326',
      zoom: 11,
    }),
  });

  const layers = map.getLayers().getArray();
  clearLayer();
  // 遥感图层
  getRemoteSelect({mapType:0}).then(res=>{
    if(res.success){
      options1.value = res.data.map(r=> ({ label:r.mapName,value:r.id,...r }));
      select1.value = options1.value.length ? options1.value[0].id : null;
    }
  })
  // 土壤墒情
  getRemoteSelect({mapType:2}).then(res=>{
    if(res.success){
      options2.value = res.data.map(r=> ({ label:r.mapName,value:r.id,...r }));
      select2.value = options2.value.length ? options2.value[0].id : null;
    }
  })

})

watch(select1,(el)=>{
  const ops = options1.value.find(r=> r.id == el);
  if(ops){
    const layers = map.getLayers().getArray();
    layers.find(r=>{
      if(r.getProperties().id ){
        if(r.getProperties().id === 'YAOGAN'){
          map.removeLayer(r);
        }
      }
    });
    const ygLayer = new TileLayer({
      name: ops.mapName,
      source: new TileSuperMapRest({
        url: `${MAP_URL}${ops.mapUrl}`,
        wrapX: true
      }),
      zIndex:22,
      properties:{id:'YAOGAN'},
      visible:true
    });
    map.addLayer(ygLayer);
  }
});

watch(select2,(el)=>{
  const ops = options2.value.find(r=> r.id == el);
  if(ops){
    const layers = map.getLayers().getArray();
    layers.find(r=>{
      if(r.getProperties().id ){
        if(r.getProperties().id === 'SOIL'){
          map.removeLayer(r);
        }
      }
    })
    const soil = new TileLayer({
      name: ops.mapName,
      source: new TileSuperMapRest({
        url: `${MAP_URL}${ops.mapUrl}`,
        wrapX: true
      }),
      zIndex:23,
      properties:{id:'SOIL'},
      visible:true
    });
    map.addLayer(soil)
    getRemoteSenseMapPrimageList({mapId:ops.id}).then(res=>{
      if(res.success){
        tableData.value = res.data;
      }
    })
  }
})

function show() {
  lef.value = 2
}

function hide() {
  lef.value = -100
}

const formatTisp = id => {
  return options3.value.find(r=>r.value == id)?.label
}

const getSummaries = (param) => {
  const { columns, data } = param;
  const sums = [];
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = "合计";
      return;
    }
    if (index === 1) {
      sums[index] = "";
      return;
    }
    const values = data.map((item) => Number(item[column.property]));
    if (!values.every((value) => Number.isNaN(value))) {
      sums[index] = values.reduce((prev, curr) => {
        const value = parseFloat(curr);
        if (!Number.isNaN(value)) {
          return curr + prev;
        } else {
          return prev;
        }
      }, 0);
    } else {
      sums[index] = 0;
    }
  });
  return sums.map((r, i) => {
    if (r == "合计" || r == "") {
      return r;
    } else {
      return r.toFixed(2);
    }
  });
};

function clearLayer() {
  const layers = map.getLayers().getArray();
  layers.find(r=>{
    if(r.getProperties().id ){
      if(r.getProperties().id === 'YAOGAN' || r.getProperties().id === 'SOIL'){
        map.removeLayer(r);
      }
    }
  })
}

onBeforeUnmount(()=>{
  map.setTarget(null);
  map = null;
})


</script>

<style scoped lang="scss">
.layer-container{
  position: relative;
  height: calc(100vh - 105px);
  width: calc(100vw - 270px);
  .map-box {
    height: calc(100vh - 105px);
    width: 100vw;
  }
  .legend{
    position: absolute;
    right: 3%;
    bottom: 5%;
    background: #FFFFFF;
    border-radius: 14px;
    padding: 10px;
    li{
      display: flex;
      align-items: center;
      color: #999;
      font-size: 12px;
      span:nth-child(1){
        flex: 1;
        white-space: nowrap;
        color:#383a3d;
      }
      span:nth-child(2){
        display: inline-block;
        flex: 1;
        width: 40px;
        height: 2px;
        border-radius: 8px;
        margin-left: 5px;
      }
      &:first-child{
        margin-top: 0;
      }
      &:last-child{
        margin-bottom: 0;
      }
    }
  }
  .tips {
    position: absolute;
    left: 3%;
    top: 5%;
    background: #fff;
    width: 50px;
    padding: 8px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 99;
    i {
      display: block;
      width: 40px;
      height: 40px;
      background: url("@/assets/images/dn.png") no-repeat center center;
      background-size: cover;
      margin-bottom: 5px;
    }

    span {
      width: 3px;
      font-size: 16px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #1791FF;
      margin-right: 15px;
    }
  }
  .point-list {
    position: absolute;
    left: 2%;
    top: 5%;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 10px;
    background: #fff;
    transition: left .8s;
    height: 90%;
    min-height: 750px;
    width: 370px;
    padding: 15px;
    z-index: 99;
    .head {
      display: flex;
      height: 30px;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      margin-bottom: 10px;
      border-bottom: 1px solid #F1F1F1;

      h4 {
        font-size: 18px;
        color: #1791FF;
        font-weight: 600;
        margin-bottom: 0;
      }
    }

    .search {
      margin: 0 auto;
      width: 90%;
      margin-bottom: 15px;
    }
  }
}
</style>