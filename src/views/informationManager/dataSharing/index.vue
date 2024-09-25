<template>
<div class="app-container">
  <el-table :data="tableData" style="width: 100%" border>
    <el-table-column type="index" label="序号" width="100" align="center" />
    <el-table-column prop="name1" label="数据名称" align="center" />
    <el-table-column prop="name2" label="数据类型" align="center" />
    <el-table-column prop="name3" label="接口地址" align="center" />
    <el-table-column prop="name4" label="数据来源" align="center" />
    <el-table-column prop="name5" label="备注" align="center" />
  </el-table>
</div>
</template>

<script setup>
import {MAP_URL} from "@/global";
import { ref } from 'vue';
let tableData = ref([
  {
    name1:'王英灌区行政区划',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-WangYingGuanQu-XingZhengQuHua/rest/maps`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'王英灌区罐区边界',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-wangyinggq/rest/maps/wangyingouter`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'王英灌区罐主干渠',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-wangyinggq/rest/maps/wangyingmain`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'王英灌区罐干渠',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-wangyinggq/rest/maps/wangyingtrunk`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'灌溉范围图层',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-wangyinggq/rest/maps/wangyinginner`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'水库@划界确权',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-WangYingCaiXianHuaJieQueQuan/rest/maps`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'水库@水库@面图层，河流水系、供水范围',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-wangyinggq/rest/maps`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'遥感底图',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-china400/rest/maps/ChinaDark`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'抗旱预警一期遥感影像地图',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-ugcv5-tile0ErWeiYaoGan/rest/maps`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'抗旱预警一期遥感影像-种植结构',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-ugcv5-ZhongZhiJieGouErWeiYaoGan/rest/maps`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'抗旱预警一期遥感影像-土壤墒情',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-ugcv5-TuRangShangQingErWeiYaoGan/rest/maps`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'底图',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-china400/rest/maps/China_4326`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'大屏防汛形势-降雨预报所用底图',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/map-china400/rest/maps/ChinaDark`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'大屏公用底图图层',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/3D-local3DCache-HuBeiShengYingXiang12HuBeiShengYaoGanYingXiang12Ji/rest/realspace`,
    name4:'王英灌区',
    name5:''
  },
  {
    name1:'大屏公用水库三维图层',
    name2:'二维图层',
    name3:`${MAP_URL}iserver/services/3D-WangYingGuanQuSanWei/rest/realspace`,
    name4:'王英灌区',
    name5:''
  },
]);
</script>

<style scoped>

</style>