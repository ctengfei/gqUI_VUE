<template>
<div class="app-container" style="display: flex">
  <div id="OlMap">
  </div>
  <div class="custable-container">
    <div class="head">
      阈值(mm)<el-input-number  v-model="threshol" placeholder="阈值" style="width:160px;margin-left: 15px;margin-right: 15px" />
      超过阈值 <strong style="color: #BE4242">{{ num }}</strong> 个
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
    <div class="tableBox" ref="tableBox">
      <el-table :data="tableData" border :style="{width:'100%',height:height}">
        <el-table-column prop="tm1" align="center" label="开始时间" />
        <el-table-column prop="areaRainfall" align="center" label="面雨量(mm)" >
          <template #default="{row}">
            <span :style="{color:row.isWarn ? 'red' : '#000'}">{{ row.areaRainfall }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</div>
</template>

<script setup>
import {getCurrentInstance, onBeforeUnmount, onMounted, reactive} from "vue";
import {Tile as TileLayer} from "ol/layer";
import {XYZ} from "ol/source";
const { proxy } = getCurrentInstance();
import Map from "ol/Map";
import {defaults as defaultControls, ScaleLine} from "ol/control";
import View from "ol/View";
import {TileSuperMapRest} from "@supermap/iclient-ol";
import {MAP_URL,TDT_URL} from "@/global";
import {
  addAreaRainfallWaring,
  getAreaRainfallWaring, getAreaRainfallWaringList,
  putAreaRainfallWaring
} from "@/api/schedulingCtord/forecastWaring";
import {ElMessage} from "element-plus";
import {sessionStorage} from "@/utils";
const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
let map = reactive(null);
const threshol = ref('');
let maxThreshol= ref(10);
const tableBox = ref('100%');
let height = ref('100%');
let tableData = ref([]);
let num = ref(0)
onMounted(()=>{
  height.value = `${tableBox.value.clientHeight}px`;
  const TiandiMap_img = new TileLayer({
    name: "天地图影像图层",
    source: new XYZ({
      url: `${TDT_URL}DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
      wrapX: true
    }),
    properties: { name: "天地图影像图层", id: 'v01', type: 'img' },
    visible: true
  });
  const pianQu = new TileLayer({
    source: new TileSuperMapRest({
      url: `/superMapUrl/iserver/services/map-ShanHongPianQuFanWei/rest/maps/basin_14_geo@%E5%B1%B1%E6%B4%AA%E7%89%87%E5%8C%BA%E8%8C%83%E5%9B%B4?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
      wrapX: true,
    }),
  })
  map = new Map({
    layers: [TiandiMap_img,pianQu],
    target: "OlMap",
    controls: defaultControls({
      zoom: false,
    }).extend([
      new ScaleLine({
        units: 'metric',
      }),
    ]),
    view: new View({
      center: [114.65208746275314, 29.884163408981514],
      projection: 'EPSG:4326',
      zoom: 13.7,
    }),
  });
  // 查询阈值
  getAreaRainfallWaring().then(res=>{
    if(res.success){
      if(res.data.length){
        const af = res.data[0];
        threshol.value = af.wv
      }else{
        threshol.value = 0
      }
      getData();
    }
  })

})

const getData = () => {
  getAreaRainfallWaringList({WV:threshol.value}).then(res=>{
    if(res.success){
      tableData.value = res.data;
      res.data.forEach((r,i)=>{
        if(parseFloat(r.areaRainfall) > parseFloat(threshol.value)){
           num.value++;
        }
      })
    }
  })
}

const handleSave = () =>{
  getAreaRainfallWaring().then(res=>{
      if(res.success){
        if(res.data.length){ // 修改
          const af = res.data[0];
          putAreaRainfallWaring(af.id,{wv:threshol.value}).then(res=>{
            ElMessage({
              message: '修改成功',
              type: 'success',
            });
          })
        }else{ // 没有阈值 就新增
          addAreaRainfallWaring({wv:threshol.value}).then(res=>{
            if(res.success){
              ElMessage({
                message: '保存成功',
                type: 'success',
              });
            }
          })
        }
      }
  })
}

onBeforeUnmount(() => {
  map.setTarget(null);
  map = null;
})
</script>

<style scoped lang="scss">
#OlMap{
  position: relative;
  height: calc(100vh - 185px);
  width: 70%;
}
.custable-container{
  display: flex;
  flex-direction: column;
  width: 30%;
  height: calc(100vh - 185px);
  margin-left: 10px;
  .head{
    font-weight: 600;
  }
  .tableBox{
    flex: 1;
    margin-top: 15px;
  }
}
</style>