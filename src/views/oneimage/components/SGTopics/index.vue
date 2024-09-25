<template>
  <el-tag type="success" class="man-tags" @click="dialogVisible = true">水库管理专题</el-tag>
  <el-dialog
      v-model="dialogVisible"
      title="水库管理专题"
      width="1500"
      append-to-body
      destroy-on-close
      custom-class="dialog2"
  >
    <el-tabs v-model="activeName" class="custom-tab" >
      <el-tab-pane lazy label="水库业务统计" name="1" >
          <Statistics  />
      </el-tab-pane>
      <el-tab-pane lazy label="水库面积图" name="2" style="width: 100%;height: 100%;position: relative">
        <div id="area-map"  ref="areaMap" style="width: 100%;height: 100%">
        </div>
        <div class="tipBox">
          <li>
            <h3>总库容</h3>
            <p class="p1"><span>王英水库</span><span>{{ (wyData.totCap / 10000) || 0 }} 亿m³</span></p>
            <p class="p2"><span>蔡贤水库</span><span>{{ (cxData.totCap / 10000) || 0 }} 亿m³</span></p>
          </li>
          <li>
            <h3>防洪库容</h3>
            <p class="p1"><span>王英水库</span><span>{{ wyData.flcoCap / 10000 || 0 }} 亿m³</span></p>
            <p class="p2"><span>蔡贤水库</span><span>{{ cxData.flcoCap / 10000 || 0 }} 亿m³</span></p>
          </li>
          <li>
            <h3>兴利库容</h3>
            <p class="p1"><span>王英水库</span><span>{{ wyData.benResCap /10000 || 0 }} 亿m³</span></p>
            <p class="p2"><span>蔡贤水库</span><span>{{ cxData.benResCap /10000 || 0 }} 亿m³</span></p>
          </li>
          <li>
            <h3>集水面积</h3>
            <p class="p1"><span>王英水库</span><span>{{ wyData.watShedArea || 0}} km²</span></p>
            <p class="p2"><span>蔡贤水库</span><span>{{ cxData.watShedArea || 0}} km²</span></p>
          </li>
          <li>
            <h3>防洪高水位</h3>
            <p class="p1"><span>王英水库</span><span>{{ wyData.uppLevFlco || 0 }} m</span></p>
            <p class="p2"><span>蔡贤水库</span><span>{{ cxData.uppLevFlco || 0 }} m</span></p>
          </li>
          <li>
            <h3>正常蓄水位</h3>
            <p class="p1"><span>王英水库</span><span>{{ wyData.normWatLev || 0 }} m</span></p>
            <p class="p2"><span>蔡贤水库</span><span>{{ cxData.normWatLev || 0 }} m</span></p>
          </li>
        </div>
      </el-tab-pane>
    </el-tabs>
    <!-- <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template> -->
  </el-dialog>
</template>

<script setup>
import { MAP_URL } from '@/global'
import Statistics from './components/Statistics';
import {nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, watchEffect} from 'vue';
import Map from "ol/Map";
import {defaults as defaultControls, ScaleLine} from "ol/control";
import View from "ol/View";
import {Tile as TileLayer} from "ol/layer";
import {TileSuperMapRest} from "@supermap/iclient-ol";
import {getSk} from "@/api/oneimage";
let Amap = ref(null);
let areaMap = ref(null)
let dialogVisible = ref(false);
let activeName = ref('1');
let wyData = ref({}); //王英
let cxData = ref({}); //蔡贤
watch([()=>areaMap.value,activeName],([map,tab])=>{
  if(map && tab === '2'){
    nextTick(()=>{
      Amap.value = new Map({
        target:map,
        controls: defaultControls({
          zoom: false,
        }).extend([
          new ScaleLine({
            units: 'metric',
          }),
        ]),
        view: new View({
          center: [114.81904566006176, 29.82280711507997],
          projection: 'EPSG:4326',
          zoom: 12,
        }),
      });
      const baseLayer = new TileLayer({
        source: new TileSuperMapRest({
          url: `${MAP_URL}iserver/services/map-china400/rest/maps/China_4326`,
          wrapX: true
        }),
        properties: { id: 'v01',type:'vector' },
        visible:true
      })
      Amap.value.addLayer(baseLayer);
      const wy = new TileLayer({
        source: new TileSuperMapRest({
          url: `${MAP_URL}iserver/services/map-WangYingCaiXianHuaJieQueQuan/rest/maps/%E7%8E%8B%E8%8B%B1%E6%B0%B4%E5%BA%93@%E5%88%92%E7%95%8C%E7%A1%AE%E6%9D%83?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
          wrapX: true,
        }),
        zIndex:23
      });
      wy.setProperties({id: 'wy'});
      Amap.value.addLayer(wy)
      const cx = new TileLayer({
        source: new TileSuperMapRest({
          url: `${MAP_URL}iserver/services/map-WangYingCaiXianHuaJieQueQuan/rest/maps/%E8%94%A1%E8%B4%A4%E6%B0%B4%E5%BA%93@%E5%88%92%E7%95%8C%E7%A1%AE%E6%9D%83?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
          wrapX: true,
        }),
        zIndex:23
      });
      cx.setProperties({id: 'cx'});
      Amap.value.addLayer(cx)
      const wySurface = new TileLayer({
        source: new TileSuperMapRest({
          url: `${MAP_URL}iserver/services/map-WangYingCaiXianShuiKuMianTuCeng/rest/maps/%E7%8E%8B%E8%8B%B1%E6%B0%B4%E5%BA%93_%E9%9D%A2@%E6%B0%B4%E5%BA%93%E9%9D%A2%E6%95%B0%E6%8D%AE%E9%9B%86?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
          wrapX: true,
        }),
        zIndex:23
      });
      wySurface.setProperties({id: 'wySurface'});
      Amap.value.addLayer(wySurface)
      const cxSurface = new TileLayer({
        source: new TileSuperMapRest({
          url: `${MAP_URL}iserver/services/map-WangYingCaiXianShuiKuMianTuCeng/rest/maps/%E8%94%A1%E8%B4%A4%E6%B0%B4%E5%BA%93_%E9%9D%A2@%E6%B0%B4%E5%BA%93%E9%9D%A2%E6%95%B0%E6%8D%AE%E9%9B%86?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
          wrapX: true,
        }),
        zIndex:23
      });
      cxSurface.setProperties({id: 'cxSurface'});
      Amap.value.addLayer(cxSurface);

      getSk().then(res=>{
        if(res.success){
          res.data.forEach(r=>{
            if(r.resCode == '42022220001'){ // 王英
              wyData.value = r;
            }else if(r.resCode == '42022230001'){
              cxData.value = r;
            }
          });
        }
      })
    })
  }else{
    if(Amap.value){
      Amap.value.setTarget(null);
      Amap.value = null;
    }
  }
})

</script>

<style scoped lang="scss">
li{
  list-style-type: none;
}
.man-tags{
  padding: 17px;
  margin: 5px;
  cursor: pointer;
}
.custom-tab{
  height:100%;
  :deep(.el-tabs__content){
    height: calc(100% - 40px);
    overflow-y: hidden;
    overflow-x: hidden;
  }
  :deep(.el-tabs__header){
    margin: 0!important;
  }
}
.tipBox{
  position: absolute;
  left: 20px;
  top: 20px;
  display: flex;
  li{
    width: 152px;
    height: 98px;
    background: #F4F8FB;
    border-radius: 4px;
    margin-right: 10px;
    padding-top: 15px;
    h3{
      position: relative;
      color: #1791FF;
      margin-bottom: 12px;
      padding-left: 10px;
      margin-left: 20px;
      line-height: 10px;
      border-left: 3px solid #1791FF;
    }
    p{
      display: flex;
      justify-content: space-around;
      span:nth-child(1){
        color: #666666;
      }
      span:nth-child(2){
        color: #333333;
      }
    }
    .p1{
      margin-bottom: 5px;
    }
    .p2{
      margin-top: 0;
      margin-bottom: 5px;
    }
  }
}
</style>
<style lang="scss">
.dialog2 .el-dialog__body{
  padding-top: 0!important;
  padding-bottom: 0!important;
  height: 800px
}
</style>

