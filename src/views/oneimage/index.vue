<template>
<div class="map-container">
  <div class="map-box" ref="maps" id="map-box">
  </div>
  <ToolBar @getTool="getTool" />
  <Monitor />
  <MonitorList />
  <div class="ol-popup" ref="popupTime" v-show="show">
    <div class="head">
      <h4>{{ currentRealTime.stName || currentRealTime.wmstName }}</h4>
      <el-button type="primary" plain @click="closeTime" circle
        style="width: 25px;height: 25px;border: 0;align-self: center">
        <Close style="width: 1.3em; height: 1.3em;" />
      </el-button>
    </div>
    <el-tabs v-model="activeName" v-show="currentRealTime.type !== 'VD'">
      <el-tab-pane label="基础数据" name="1">
        <div class="realTime box">
          <template v-if="currentRealTime.type == 'RR'">
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>测站名称：</span>
                <span>{{ currentRealTime.stName }}</span>
              </el-col>
              <!-- <el-col :span="12">
                <span>库水特征码：</span>
                <span>{{ currentRealTime.rwchrcd }}</span>
              </el-col> -->
              <el-col :span="12">
                <span>站点编码：</span>
                <span>{{ currentRealTime.stcd }}</span>
              </el-col>
            </el-row>
            <el-row style="margin-bottom: 8px" justify="space-between">
              <!-- <el-col :span="12">
                <span>站点编码：</span>
                <span>{{ currentRealTime.stcd }}</span>
              </el-col> -->
              <el-col :span="12">
                <span>蓄水量(亿m³)：</span>
                <span>{{ (currentRealTime.w / 100).toFixed(3) || 0 }}</span>
              </el-col>
              <el-col :span="12">
                <span>库上水位(m)：</span>
                <span>{{ currentRealTime.rz }}</span>
              </el-col>
            </el-row>
            <!-- <el-row style="margin-bottom: 8px" justify="flex-start">
              <span>站点地址：</span>
              <span>{{ currentRealTime.stLoc }}</span>
            </el-row> -->
            <!-- <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>库上水位(m)：</span>
                <span>{{ currentRealTime.rz }}</span>
              </el-col>
              <el-col :span="12">
                <span>出库流量(m³/s)：</span>
                <span>{{ currentRealTime.otq }}</span>
              </el-col>
            </el-row> -->
            <!-- <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>库下水位(m)：</span>
                <span>{{ currentRealTime.blrz }}</span>
              </el-col>
              <el-col :span="12">
                <span>入库流量(m³/s)：</span>
                <span>{{ currentRealTime.inq }}</span>
              </el-col>
            </el-row> -->
            <!-- <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>入流时段长：</span>
                <span>{{ currentRealTime.inqdr }}</span>
              </el-col>
              <el-col :span="12">
                <span>测流方法：</span>
                <span>{{ currentRealTime.msqmt }}</span>
              </el-col>
            </el-row> -->
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>经度(°)：</span>
                <span>{{ currentRealTime.stLong }}</span>
              </el-col>
              <el-col :span="12">
                <span>纬度(°)：</span>
                <span>{{ currentRealTime.stLat }}</span>
              </el-col>
            </el-row>
            <el-row justify="space-between">
              <!-- <el-col :span="12">
                <span>库水水势：</span>
                <span>{{ currentRealTime.rwptn }}</span>
              </el-col> -->
              <el-col :span="12">
                <span>数据时间：</span>
                <span>{{ currentRealTime.tm }}</span>
              </el-col>
            </el-row>
          </template>
          <template v-if="currentRealTime.type == 'PPS'">
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>测站名称：</span>
                <span>{{ currentRealTime.stName }}</span>
              </el-col>
              <el-col :span="12">
                <span>测站编码：</span>
                <span>{{ currentRealTime.stcd }}</span>
              </el-col>
            </el-row>
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>日降水量(mm)：</span>
                <span>{{ currentRealTime.oneDayDrp }}</span>
              </el-col>
              <el-col :span="12">
                <span>时段降水量(mm)：</span>
                <span>{{ currentRealTime.drp }}</span>
              </el-col>
            </el-row>
            <el-row style="margin-bottom: 8px" justify="flex-start">
              <span>站点地址：</span>
              <span>{{ currentRealTime.stLoc }}</span>
            </el-row>
            <!-- <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>时段长(h)：</span>
                <span>{{ currentRealTime.intv }}</span>
              </el-col>
              <el-col :span="12">
                <span>降水历时：</span>
                <span>{{ currentRealTime.pdr }}</span>
              </el-col>
            </el-row> -->
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>经度(°)：</span>
                <span>{{ currentRealTime.stLong }}</span>
              </el-col>
              <el-col :span="12">
                <span>纬度(°)：</span>
                <span>{{ currentRealTime.stLat }}</span>
              </el-col>
            </el-row>
            <el-row justify="space-between">
              <!-- <el-col :span="12">
                <span>天气状况：</span>
                <span>{{ currentRealTime.wth }}</span>
              </el-col> -->
              <el-col :span="12">
                <span>数据时间：</span>
                <span>{{ currentRealTime.tm }}</span>
              </el-col>
            </el-row>
          </template>
          <template v-if="currentRealTime.type == 'DD'">
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>测站名称：</span>
                <span>{{ currentRealTime.stName }}</span>
              </el-col>
              <el-col :span="12">
                <span>测站编码：</span>
                <span>{{ currentRealTime.stcd }}</span>
              </el-col>
            </el-row>
            <!-- <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>闸上水势：</span>
                <span>{{ currentRealTime.supwptn }}</span>
              </el-col>
              <el-col :span="12">
                <span>闸下水势：</span>
                <span>{{ currentRealTime.sdwwptn }}</span>
              </el-col>
            </el-row> -->
            <el-row style="margin-bottom: 8px" justify="flex-start">
              <span>站点地址：</span>
              <span>{{ currentRealTime.stLoc }}</span>
            </el-row>
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>闸上水位(m)：</span>
                <span>{{ currentRealTime.upz }}</span>
              </el-col>
              <el-col :span="12">
                <span>总过闸流量(m³/s)：</span>
                <span>{{ currentRealTime.tgtq }}</span>
              </el-col>
              <!-- <el-col :span="12">
                <span>闸下水位(m)：</span>
                <span>{{ currentRealTime.dwz }}</span>
              </el-col> -->
            </el-row>
            <!-- <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>开启高度：</span>
                <span>{{ currentRealTime.gtophgt }}</span>
              </el-col>
              <el-col :span="12">
                <span>测流方法：</span>
                <span>{{ currentRealTime.msqmt }}</span>
              </el-col>
            </el-row> -->
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>经度(°)：</span>
                <span>{{ currentRealTime.stLong }}</span>
              </el-col>
              <el-col :span="12">
                <span>纬度(°)：</span>
                <span>{{ currentRealTime.stLat }}</span>
              </el-col>
            </el-row>
            <el-row style="margin-bottom: 8px" justify="space-between">
              <!-- <el-col :span="12">
                <span>闸水特征码：</span>
                <span>{{ currentRealTime.swchrcd }}</span>
              </el-col> -->
              
              <el-col :span="12">
                <span>数据时间：</span>
                <span>{{ currentRealTime.tm }}</span>
              </el-col>
            </el-row>
            <!-- <el-row justify="space-between">
              <el-col :span="12">
                <span>数据时间：</span>
                <span>{{ currentRealTime.tm }}</span>
              </el-col>
              <el-col :span="12">
                <span></span>
                <span></span>
              </el-col>
            </el-row> -->
          </template>
          <template v-if="currentRealTime.type == 'WQ'">
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>测站名称：</span>
                <span>{{ currentRealTime.stName }}</span>
              </el-col>
              <el-col :span="12">
                <span>测站编码：</span>
                <span>{{ currentRealTime.stcd }}</span>
              </el-col>
            </el-row>
            <el-row style="margin-bottom: 8px" justify="space-between">
              <!-- <el-col :span="12">
                <span>水温(°)：</span>
                <span>{{ currentRealTime.wt }}</span>
              </el-col> -->
              <el-col :span="12">
                <span>电导率(μS/cm)：</span>
                <span>{{ currentRealTime.cond }}</span>
              </el-col>
              <el-col :span="12">
                <span>叶绿素(μg/L)：</span>
                <span>{{ currentRealTime.chla }}</span>
              </el-col>
            </el-row>
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>浊度(NTU)：</span>
                <span>{{ currentRealTime.turb }}</span>
              </el-col>
              <el-col :span="12">
                <span>溶解氧(mg/L)：</span>
                <span>{{ currentRealTime.dox }}</span>
              </el-col>
            </el-row>
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>氨氮(mg/L)：</span>
                <span>{{ currentRealTime.nh3n }}</span>
              </el-col>
              
            </el-row>
            <!-- <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>PH(无量纲)：</span>
                <span>{{ currentRealTime.ph }}</span>
              </el-col>
              <el-col :span="12">
                <span>总磷(mg/L)：</span>
                <span>{{ currentRealTime.tp }}</span>
              </el-col>
            </el-row> -->
            <el-row justify="space-between">
              <el-col :span="12">
                <span>数据时间：</span>
                <span>{{ currentRealTime.tm }}</span>
              </el-col>
              <el-col :span="12">
                <span></span>
                <span></span>
              </el-col>
            </el-row>
          </template>
          <template v-if="currentRealTime.type == 'ZQ'">
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>测站名称：</span>
                <span>{{ currentRealTime.stName }}</span>
              </el-col>
              <el-col :span="12">
                <span>测站编码：</span>
                <span>{{ currentRealTime.stcd }}</span>
              </el-col>
            </el-row>
            <!-- <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>岸别：</span>
                <span>{{ currentRealTime.bank }}</span>
              </el-col>
              <el-col :span="12">
                <span>集水面积(km²)：</span>
                <span>{{ currentRealTime.catArea }}</span>
              </el-col>
            </el-row> -->
            <el-row style="margin-bottom: 8px" justify="flex-start">
              <span>站点地址：</span>
              <span>{{ currentRealTime.stLoc }}</span>
            </el-row>
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>经度(°)：</span>
                <span>{{ currentRealTime.stLong }}</span>
              </el-col>
              <el-col :span="12">
                <span>纬度(°)：</span>
                <span>{{ currentRealTime.stLat }}</span>
              </el-col>
            </el-row>
            <el-row style="margin-bottom: 8px" justify="space-between">
              <!-- <el-col :span="12">
                <span>流量(m³/s)：</span>
                <span>{{ currentRealTime.q }}</span>
              </el-col> -->
              <el-col :span="12">
                <span>河流名称：</span>
                <span>{{ currentRealTime.rvName }}</span>
              </el-col>
              <el-col :span="12">
                <span>水位(m)：</span>
                <span>{{ currentRealTime.z }}</span>
              </el-col>
            </el-row>
            <el-row justify="space-between">
              <el-col :span="12">
                <span>数据时间：</span>
                <span>{{ currentRealTime.tm }}</span>
              </el-col>
              
            </el-row>
          </template>
          <template v-if="currentRealTime.type == 'ZZ'">
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>测站名称：</span>
                <span>{{ currentRealTime.stName }}</span>
              </el-col>
              <el-col :span="12">
                <span>测站编码：</span>
                <span>{{ currentRealTime.stcd }}</span>
              </el-col>
            </el-row>
            <!-- <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>岸别：</span>
                <span>{{ currentRealTime.bank }}</span>
              </el-col>
              <el-col :span="12">
                <span>集水面积(km²)：</span>
                <span>{{ currentRealTime.catArea }}</span>
              </el-col>
            </el-row> -->
            <!-- <el-row style="margin-bottom: 8px" justify="flex-start">
              <span>站点地址：</span>
              <span>{{ currentRealTime.stLoc }}</span>
            </el-row> -->
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>经度(°)：</span>
                <span>{{ currentRealTime.stLong }}</span>
              </el-col>
              <el-col :span="12">
                <span>纬度(°)：</span>
                <span>{{ currentRealTime.stLat }}</span>
              </el-col>
            </el-row>
            <el-row style="margin-bottom: 8px" justify="space-between">
              <el-col :span="12">
                <span>流量(m³/s)：</span>
                <span>{{ currentRealTime.q }}</span>
              </el-col>
              <el-col :span="12">
                <span>水位(m)：</span>
                <span>{{ currentRealTime.z }}</span>
              </el-col>
            </el-row>
            <el-row justify="space-between">
              <el-col :span="12">
                <span>数据时间：</span>
                <span>{{ currentRealTime.tm }}</span>
              </el-col>
              <!-- <el-col :span="12">
                <span>河流名称：</span>
                <span>{{ currentRealTime.rvName }}</span>
              </el-col> -->
            </el-row>
          </template>
        </div>
      </el-tab-pane>
      <el-tab-pane label="近24小时数据" name="2">
        <div v-show="historyData.length" class="historyChart box" ref="history"></div>
        <el-empty v-show="historyData.length == 0" description="无数据" :image-size="70" />
      </el-tab-pane>
      <el-tab-pane label="实时数据" name="3">
        <div class="box">
          <realTimeTable :currentRealTime="currentRealTime" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
  <div class="ol-popup" ref="popupBuild" v-show="vise">
    <div class="head">
      <h4>{{
        currentStructure.wagaName || currentStructure.pustName || currentStructure.flumName || currentStructure.culvName
        || currentStructure.hystName || currentStructure.insiName || currentStructure.damName ||
        currentStructure.tunnelName
        }}</h4>
      <el-button type="primary" plain @click="closeBuild" circle
        style="width: 25px;height: 25px;border: 0;align-self: center">
        <Close style="width: 1.3em; height: 1.3em;" />
      </el-button>
    </div>
    <div class="box-build">
      <h3>基础信息</h3>
      <div v-show="currentStructure.type == 'WAGA'">
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>水闸名称：</span>
            <span>{{ currentStructure.wagaName }}</span>
          </el-col>
          <el-col :span="12">
            <span>水闸类型：</span>
            <span>{{ formatterVal(currentStructure, 'WAGA_TYPE', 'wagaType') }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>水闸编码：</span>
            <span>{{ currentStructure.wagaCode }}</span>
          </el-col>
          <el-col :span="12">
            <span>闸孔数量：</span>
            <span>{{ currentStructure.gaorNum }}</span>
          </el-col>
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="flex-start">
          <span>水闸所在位置：</span>
          <span>{{ currentStructure.wagaLoc }}</span>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>水闸用途：</span>
            <span>{{ currentStructure.wagaUse }}</span>
          </el-col>
          <el-col :span="12">
            <span>设计流量：</span>
            <span>{{ currentStructure.desLockMsc }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>闸孔宽高或直径：</span>
            <span>{{ currentStructure.gaorTotNetWid }}</span>
          </el-col>
          <el-col :span="12">
            <span>管理单位：</span>
            <span>{{ currentStructure.admDep }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>主要建筑物级别：</span>
            <span>{{ formatterVal(currentStructure, 'BUILDING_GRAD', 'mainBuildGrad') }}</span>
          </el-col>
          <el-col :span="12">
            <span>工程建设情况：</span>
            <span>{{ formatterVal(currentStructure, 'ENG_STAT', 'engStat') }}</span>
          </el-col>
        </el-row> -->
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>经度：</span>
            <span>{{ currentStructure.longitude }}</span>
          </el-col>
          <el-col :span="12">
            <span>纬度：</span>
            <span>{{ currentStructure.latitude }}</span>
          </el-col>
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>开工时间：</span>
            <span>{{ currentStructure.startDate }}</span>
          </el-col>
          <el-col :span="12">
            <span>建成时间：</span>
            <span>{{ currentStructure.compDate }}</span>
          </el-col>
        </el-row> -->
        <div class="pollution">
          <span>附件监测设备：</span>
          <el-input-number v-model="count" :min="1" :max="8" />
          <span style="margin-left: 8px">公里</span>
          <el-button type="primary" style="margin-left: 25px" :icon="Search" @click="handleSearch">查询</el-button>
        </div>
      </div>
      <div v-show="currentStructure.type == 'PUST'">
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>泵站名称：</span>
            <span>{{ currentStructure.pustName }}</span>
          </el-col>
          <el-col :span="12">
            <span>泵站类型：</span>
            <span>{{ formatterVal(currentStructure, 'PUST_TYPE', 'pustType') }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>泵站代码：</span>
            <span>{{ currentStructure.pustCode }}</span>
          </el-col>
          <el-col :span="12">
            <span>泵站数量：</span>
            <span>{{ currentStructure.pumpNum }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="flex-start">
          <span>泵站所在位置：</span>
          <span>{{ currentStructure.pustLoc }}</span>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>装机流量(m³/s)：</span>
            <span>{{ currentStructure.insFlow }}</span>
          </el-col>
          <el-col :span="12">
            <span>装机流量功率(kw)：</span>
            <span>{{ currentStructure.insPow }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>设计扬程(m)：</span>
            <span>{{ currentStructure.desHead }}</span>
          </el-col>
          <el-col :span="12">
            <span>管理单位：</span>
            <span>{{ currentStructure.admDep }}</span>
          </el-col>
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>主要建筑物级别：</span>
            <span>{{ formatterVal(currentStructure, 'BUILDING_GRAD', 'mainBuildGrad') }}</span>
          </el-col>
          <el-col :span="12">
            <span>工程建设情况：</span>
            <span>{{ formatterVal(currentStructure, 'ENG_STAT', 'engStat') }}</span>
          </el-col>
        </el-row> -->
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>经度：</span>
            <span>{{ currentStructure.pustLong }}</span>
          </el-col>
          <el-col :span="12">
            <span>纬度：</span>
            <span>{{ currentStructure.pustLat }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <!-- <el-col :span="12">
            <span>开工时间：</span>
            <span>{{ currentStructure.startDate }}</span>
          </el-col> -->
          <el-col :span="12">
            <span>建成时间：</span>
            <span>{{ currentStructure.compDate }}</span>
          </el-col>
        </el-row>
        <div class="pollution">
          <span>附件监测设备：</span>
          <el-input-number v-model="count" :min="1" :max="8" />
          <span style="margin-left: 8px">公里</span>
          <el-button type="primary" style="margin-left: 25px" :icon="Search" @click="handleSearch">查询</el-button>
        </div>
      </div>
      <div v-show="currentStructure.type == 'FLUM'">
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>渡槽名称：</span>
            <span>{{ currentStructure.flumName }}</span>
          </el-col>
          <el-col :span="12">
            <span>渡槽代码：</span>
            <span>{{ currentStructure.flumCode }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>渡槽形式：</span>
            <span>{{ formatterVal(currentStructure, 'FLUM_PATT', 'flumPatt') }}</span>
          </el-col>
          <el-col :span="12">
            <span>渡槽断面形式：</span>
            <span>{{ formatterVal(currentStructure, 'FLUM_SEC_PATT', 'flumSecPatt') }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="flex-start">
          <el-col :span="12">
            <span>渡槽所在位置：</span>
            <span>{{ currentStructure.flumLoc }}</span>
          </el-col>
          <el-col :span="12">
            <span>跨河长度(m)：</span>
            <span>{{ currentStructure.crRvLen }}</span>
          </el-col>
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>支承形式：</span>
            <span>{{ formatterVal(currentStructure, 'SUPP_TYPE', 'suppType') }}</span>
          </el-col>
          <el-col :span="12">
            <span>支承孔数（孔）：</span>
            <span>{{ currentStructure.suppOrifNum }}</span>
          </el-col>
        </el-row> -->
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>渡槽过水能力(m³/s)：</span>
            <span>{{ currentStructure.flumWatProp }}</span>
          </el-col>
          <el-col :span="12">
            <span>管理单位：</span>
            <span>{{ currentStructure.admDep }}</span>
          </el-col>
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          
          <el-col :span="12">
            <span>工程建设情况：</span>
            <span>{{ formatterVal(currentStructure, 'ENG_STAT', 'engStat') }}</span>
          </el-col>
        </el-row> -->
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>渡槽起点经度：</span>
            <span>{{ currentStructure.startLong }}</span>
          </el-col>
          <el-col :span="12">
            <span>渡槽起点纬度：</span>
            <span>{{ currentStructure.startLat }}</span>
          </el-col>
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>开工时间：</span>
            <span>{{ currentStructure.startDate }}</span>
          </el-col>
          <el-col :span="12">
            <span>建成时间：</span>
            <span>{{ currentStructure.endDate }}</span>
          </el-col>
        </el-row> -->
        <div class="pollution">
          <span>附件监测设备：</span>
          <el-input-number v-model="count" :min="1" :max="8" />
          <span style="margin-left: 8px">公里</span>
          <el-button type="primary" style="margin-left: 25px" :icon="Search" @click="handleSearch">查询</el-button>
        </div>
      </div>
      <div v-show="currentStructure.type == 'INSI'">
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>倒虹吸名称：</span>
            <span>{{ currentStructure.insiName }}</span>
          </el-col>
          <el-col :span="12">
            <span>倒虹吸代码：</span>
            <span>{{ currentStructure.insiCode }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>倒虹吸类型：</span>
            <span>{{ formatterVal(currentStructure, 'INSI_TYPE', 'insiType') }}</span>
          </el-col>
          <el-col :span="12">
            <span>倒虹吸过水能力：</span>
            <span>{{ currentStructure.insiWatProp }}</span>
          </el-col>
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="flex-start">
          <span>所在位置：</span>
          <span>{{ currentStructure.insiLoc }}</span>
        </el-row> -->
        <el-row style="margin-bottom: 8px" justify="space-between">
          <!-- <el-col :span="12">
            <span>基础结构型式：</span>
            <span>{{ currentStructure.baseStrPatt }}</span>
          </el-col> -->
          <el-col :span="12">
            <span>管道净宽：</span>
            <span>{{ currentStructure.pipeNetWid }}</span>
          </el-col>
          <el-col :span="12">
            <span>孔数：</span>
            <span>{{ currentStructure.orifNum }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>管道内径：</span>
            <span>{{ currentStructure.pipeIndi }}</span>
          </el-col>
          <el-col :span="12">
            <span>管道净高：</span>
            <span>{{ currentStructure.pipeNetHeig }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          
          <!-- <el-col :span="12">
            <span>工程建设情况：</span>
            <span>{{ formatterVal(currentStructure, 'ENG_STAT', 'engStat') }}</span>
          </el-col> -->
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>起点经度：</span>
            <span>{{ currentStructure.startLong }}</span>
          </el-col>
          <el-col :span="12">
            <span>起点纬度：</span>
            <span>{{ currentStructure.startLat }}</span>
          </el-col>
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>开工时间：</span>
            <span>{{ currentStructure.startDate }}</span>
          </el-col>
          <el-col :span="12">
            <span>建成时间：</span>
            <span>{{ currentStructure.compDate }}</span>
          </el-col>
        </el-row> -->
        <div class="pollution">
          <span>附件监测设备：</span>
          <el-input-number v-model="count" :min="1" :max="8" />
          <span style="margin-left: 8px">公里</span>
          <el-button type="primary" style="margin-left: 25px" :icon="Search" @click="handleSearch">查询</el-button>
        </div>
      </div>
      <div v-show="currentStructure.type === 'CULV'">
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>涵洞名称：</span>
            <span>{{ currentStructure.culvName }}</span>
          </el-col>
          <el-col :span="12">
            <span>涵洞代码：</span>
            <span>{{ currentStructure.culvCode }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>经度(°)：</span>
            <span>{{ currentStructure.culvLong }}</span>
          </el-col>
          <el-col :span="12">
            <span>纬度(°)：</span>
            <span>{{ currentStructure.culvLat }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="flex-start">
          <span>涵洞所在位置：</span>
          <span>{{ currentStructure.culvLoc }}</span>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>涵洞过水能力(m³/s)：</span>
            <span>{{ currentStructure.culvWatProp }}</span>
          </el-col>
          <el-col :span="12">
            <span>管道断面形状：</span>
            <span>{{ formatterVal(currentStructure, 'PIPE_SEC_TYPE', 'pipeSecType') }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>管道净高(m)：</span>
            <span>{{ currentStructure.pipeNetHeig }}</span>
          </el-col>
          <el-col :span="12">
            <span>管道净宽(m)：</span>
            <span>{{ currentStructure.pipeNetWid }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>管道内径(m)：</span>
            <span>{{ currentStructure.pipeIndi }}</span>
          </el-col>
          <el-col :span="12">
            <span>孔数(孔)：</span>
            <span>{{ currentStructure.orifNum }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>开工时间：</span>
            <span>{{ currentStructure.startDate }}</span>
          </el-col>
          <el-col :span="12">
            <span>建成时间：</span>
            <span>{{ currentStructure.compDate }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>工程建设情况：</span>
            <span>{{ formatterVal(currentStructure, 'ENG_STAT', 'engStat') }}</span>
          </el-col>
          <el-col :span="12">
          </el-col>
        </el-row>
        <div class="pollution">
          <span>附件监测设备：</span>
          <el-input-number v-model="count" :min="1" :max="8" />
          <span style="margin-left: 8px">公里</span>
          <el-button type="primary" style="margin-left: 25px" :icon="Search" @click="handleSearch">查询</el-button>
        </div>
      </div>
      <div v-show="currentStructure.type === 'DAM'">
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>大坝名称：</span>
            <span>{{ currentStructure.damName }}</span>
          </el-col>
          <el-col :span="12">
            <span>大坝代码：</span>
            <span>{{ currentStructure.damCode }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>经度(°)：</span>
            <span>{{ currentStructure.endLong }}</span>
          </el-col>
          <el-col :span="12">
            <span>纬度(°)：</span>
            <span>{{ currentStructure.endLat }}</span>
          </el-col>
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="flex-start">
          <span>所在位置：</span>
          <span>{{ currentStructure.damLoc }}</span>
        </el-row> -->
        <el-row style="margin-bottom: 8px" justify="space-between">
          <!-- <el-col :span="12">
            <span>最大坝高(m)：</span>
            <span>{{ currentStructure.damMaxHeig }}</span>
          </el-col> -->
          <el-col :span="12">
            <span>是否主坝：</span>
            <span>{{ formatterVal(currentStructure, 'IF_MAI_DAM', 'ifMaiDam') }}</span>
          </el-col>
          <el-col :span="12">
            <span>大坝级别：</span>
            <span>{{ formatterVal(currentStructure, 'BUILDING_GRAD', 'damGrad') }}</span>
          </el-col>
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>坝顶长度(m)：</span>
            <span>{{ currentStructure.damTopLen }}</span>
          </el-col>
          <el-col :span="12">
            <span>坝顶宽度(m)：</span>
            <span>{{ currentStructure.damTopWid }}</span>
          </el-col>
        </el-row> -->
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>所属水库：</span>
            <span>{{ formatSk(currentStructure.resCode) }}</span>
          </el-col>
          <!-- <el-col :span="12">
            <span>高程系统：</span>
            <span>{{ currentStructure.elevSys }}</span>
          </el-col> -->
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>大坝材料类型：</span>
            <span>{{ formatterVal(currentStructure, 'DAM_TYPE_MAT', 'damTypeMat') }}</span>
          </el-col>
          <el-col :span="12">
            <span>大坝结构类型：</span>
            <span>{{ formatterVal(currentStructure, 'DAM_TYPE_STR', 'damTypeStr') }}</span>
          </el-col>
        </el-row> -->
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>工程建设情况：</span>
            <span>{{ formatterVal(currentStructure, 'ENG_STAT', 'engStat') }}</span>
          </el-col>
          
        </el-row> -->
        <div class="pollution">
          <span>附件监测设备：</span>
          <el-input-number v-model="count" :min="1" :max="8" />
          <span style="margin-left: 8px">公里</span>
          <el-button type="primary" style="margin-left: 25px" :icon="Search" @click="handleSearch">查询</el-button>
        </div>
      </div>
      <div v-show="currentStructure.type === 'TUNNEL'">
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>隧洞名称：</span>
            <span>{{ currentStructure.tunnelName }}</span>
          </el-col>
          <el-col :span="12">
            <span>隧洞编码：</span>
            <span>{{ currentStructure.tunnelCode }}</span>
          </el-col>
        </el-row>
        <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>经度(°)：</span>
            <span>{{ currentStructure.longitude }}</span>
          </el-col>
          <el-col :span="12">
            <span>纬度(°)：</span>
            <span>{{ currentStructure.latitude }}</span>
          </el-col>
        </el-row>
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>所在渠道终止桩号(m)：</span>
            <span>{{ currentStructure.endCoordinate }}</span>
          </el-col>
          <el-col :span="12">
            <span>所在渠道起始桩号(m)：</span>
            <span>{{ currentStructure.startCoordinate }}</span>
          </el-col>
        </el-row> -->
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>进口高程(m)：</span>
            <span>{{ currentStructure.entranceAltitude }}</span>
          </el-col>
          <el-col :span="12">
            <span>出口高程(m)：</span>
            <span>{{ currentStructure.outletAltitude }}</span>
          </el-col>
        </el-row> -->
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>所属渠道编号：</span>
            <span>{{ currentStructure.chanCode }}</span>
          </el-col>
          <el-col :span="12">
            <span>洞泾(m)：</span>
            <span>{{ currentStructure.tunnelDiameter }}</span>
          </el-col>
        </el-row> -->
        <!-- <el-row style="margin-bottom: 8px" justify="space-between">
          <el-col :span="12">
            <span>隧洞类型：</span>
            <span>{{ formatterVal(currentStructure, 'PIPE_SEC_TYPE', 'tunnelType') }}</span>
          </el-col>
          <el-col :span="12">
            <span>所属灌区：</span>
            <span>{{ formatVal(currentStructure.irrCode) }}</span>
          </el-col>
        </el-row> -->
      </div>
    </div>
  </div>
  <div class="legend" :style="{ left: gqOneImageStore.legend + '%' }">
    <li><span>边界</span><span style="background: #a9d301;height: 5px"></span></li>
    <li><span>总干渠</span><span style="background: #0084ff;height: 5px"></span></li>
    <li><span>干渠</span><span style="background: #01e9fe;height: 5px"></span></li>
    <li><span>支渠</span><span style="background: #00ff4e;height: 5px"></span></li>
    <li><span>划界确权</span><span style="background: #c00000;height: 5px"></span></li>
    <li><span>水库</span><span style="background: #00c0ff;height: 5px"></span></li>
    <li><span>灌溉范围</span><span style="background: #ffbf00;height: 5px"></span></li>
    <li><span>供水范围</span><span style="background: #0099cc;height: 5px"></span></li>
    <li><span>河流水系</span><span style="background: #0c73bd;height: 5px"></span></li>
  </div>
</div>
<el-dialog v-model="dialogVisible" width="50%" :title="title" draggable @close="dialogVisible = false"
  class="camera-dialog" append-to-body>
  <div id="mv" ref="cameraDialog">
  </div>
</el-dialog>
</template>

<script setup>
import realTimeTable from './components/realTimeTable';
import {
  ref,
  reactive,
  onMounted,
  computed,
  nextTick,
  watch,
  onBeforeUnmount,
  onBeforeMount,
  watchEffect,
  onActivated,
  onDeactivated
} from 'vue';
import DPlayer from "dplayer";
import Hls from "hls.js";
import { Close, VideoCamera, Search } from '@element-plus/icons-vue'
import { Vector as VectorSource, XYZ } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { TileSuperMapRest } from '@supermap/iclient-ol';
import View from 'ol/View';
import Map from 'ol/Map';
import { Point, Circle } from 'ol/geom';
import { Feature, Overlay } from 'ol';
import { Fill, Stroke, Style, Text, Icon } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { defaults as defaultControls, ScaleLine } from 'ol/control';
import { GeoJSON } from 'ol/format'
import { formatterVal, sessionStorage, sleep } from '@/utils';
import ToolBar from './components/ToolBar';
import Monitor from './components/Monitor'
import MonitorList from './components/MonitorList';
import useGqOneImageStore from '@/store/modules/oneimage';
import * as echarts from "echarts";
import { MAP_URL, TDT_URL } from '@/global'
import json from '@/utils/json'
import { MultiLineString, MultiPolygon, LineString } from 'ol/geom';
import * as turf from '@turf/turf';
import {
  getBzMonitor,
  getHdMonitor,
  getQdMonitor,
  getSwMonitor,
  getSzhiMonitor,
  getSzMonitor,
  getYlMonitor
} from "@/api/oneimage";
import { getGqList } from "@/api/informationManager/basicData/gqBasicData";
import { getPlayUrl } from "@/api/digitization";
import { getResList } from "@/api/informationManager/basicData/skBasicData";
const MAP_TOKEN = sessionStorage.get('MAP_TOKEN');
const gqOneImageStore = useGqOneImageStore();
let map = ref(null);
const maps = ref();
let activeName = ref('1');
let show = ref(false);
let left = ref(gqOneImageStore.legend);
let vise = ref(false);
let count = ref(1);
const popupTime = ref();
const popupBuild = ref();
const history = ref();
let historyData = ref([]);
let gqList = ref([]);
let resList = ref([]);
let currentStructure = ref({});
let currentRealTime = ref({});
let overlayTime = ref(null);
let overlayStructure = ref(null);
let dialogVisible = ref(false);
let views = ref({});
let title = ref('');
const DP = ref(null);
const cameraDialog = ref(null);
let playUrl = ref('');
const customLayer = new TileLayer({
  name: "影像(一张图)",
  source: new TileSuperMapRest({
    url: `/superMapUrl/iserver/services/map-YXFW/rest/maps/YXDOM?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
    wrapX: true
  }),
  properties: { name: "影像(一张图)", id: 'v01', type: 'custom' },
  visible: false
});

const TiandiMap_vec = new TileLayer({
  name: "天地图矢量图层",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true
  }),
  properties: { name: "天地图矢量图层", id: 'v01', type: 'vector' },
  visible: false
});

const TiandiMap_vecLabel = new TileLayer({
  name: "天地图矢量注记",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true
  }),
  properties: { name: "天地图矢量注记", id: 'v01', type: 'vector' },
  visible: false
});

const TiandiMap_img = new TileLayer({
  name: "天地图影像图层",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true
  }),
  properties: { name: "天地图影像图层", id: 'v01', type: 'img' },
  visible: true
});

const TiandiMap_imgLabel = new TileLayer({
  name: "天地图影像注记",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=cia_w&tk=${MAP_TOKEN}&x={x}&y={y}&l={z}`,
    wrapX: true
  }),
  properties: { name: "天地图影像注记", id: 'v01', type: 'img' },
  visible: true
});

const TiandiMap_ter = new TileLayer({
  name: "天地图地形图层",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true
  }),
  properties: { name: "天地图地形图层", id: 'v01', type: 'terrain' },
  visible: false
});

const TiandiMap_terLabel = new TileLayer({
  name: "天地图地形注记",
  source: new XYZ({
    url: `${TDT_URL}DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=${MAP_TOKEN}`,
    wrapX: true
  }),
  properties: { name: "天地图地形注记", id: 'v01', type: 'terrain' },
  visible: false
});

const vector = new VectorSource();
const circle = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vector,
  properties: { title: `base-vector`, id: 'v01' },
  style: new Style({
    fill: new Fill({
      color: 'rgba(249, 231, 159 , 0.2)',
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: 'rgba(223, 76, 60 , 0.5)',
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
const vectoryCircleLayer = new VectorLayer({
  source: circle,
  properties: { title: `circle-vector`, id: 'v01' },
  style: new Style({
    fill: new Fill({
      color: 'rgba(249, 231, 159 , 0.2)',
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: 'rgba(223, 76, 60 , 0.5)',
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
    }),
  }),
  zIndex: 24,
  declutter: true,
  visible: true,
});
// [TiandiMap_vec, TiandiMap_img, TiandiMap_ter, TiandiMap_imgLabel, TiandiMap_vecLabel, TiandiMap_terLabel];
const layers = [TiandiMap_vec, TiandiMap_img, TiandiMap_imgLabel, TiandiMap_ter, TiandiMap_vecLabel, TiandiMap_terLabel, customLayer];
// 实时获取当前地图的 zoom
const currentZoom =computed(()=>{
  if (map.value) {
    return map.value.getView().getZoom()
  }
})
onMounted(() => {
  // layers
  views.value = new View({
    center: [114.6607190071207, 29.975431893776882],
    projection: 'EPSG:4326',
    zoom: 11,
    maxZoom: 18
  });
  map.value = new Map({
    layers: layers,
    target: 'map-box',
    controls: defaultControls({
      zoom: false,
    }).extend([
      new ScaleLine({
        units: 'metric',
      }),
    ]),
    view: views.value,
  });
  getTool('img')
  map.value.addLayer(vectoryCircleLayer);
  map.value.addLayer(vectorLayer);
  creatMask(map.value);
  gqOneImageStore.getMap({
    Map: map.value,
    vector: vector
  });
  // 获取当前缩放级别
// var zoom = map.getView().getZoom();
// console.log('当前缩放级别：', zoom)
  // const timer = setTimeout(()=>{
  //     maps.value.setAttribute('style', 'padding-top: 0')
  // },300)
  // map.value.on('click',()=>{
  //   const feature = new Feature({
  //     geometry: new Point([114.906669, 29.794011]),
  //   });
  //   map.value.getView().fit(feature.getGeometry(), { duration: 600,maxZoom:16 });
  // })
  // views.value.on('change:resolution', function(event) {
  //   var zoomLevel =views.value.getZoom();
  //   console.log('当前缩放层级：', zoomLevel);
  // });
  getGqList().then(res => {
    if (res.success) {
      gqList.value = res.data.map((r) => ({ label: r.irrName, value: r.irrCode }));
    }
  })
  getResList().then(res => {
    if (res.success) {
      resList.value = res.data.map(r => ({ label: r.resName, value: r.resCode }));
    }
  })
})

const formatVal = (row) => {
  return row ? gqList.value.find(r => r.value == row)?.label : ''
}

const formatSk = (row) => {
  return row ? resList.value.find(r => r.value == row)?.label : ''
}

/**
 * 实时监测站点
 */
watch(() => gqOneImageStore.realtimePoint, (points, oldPoints) => {
  if (points.length) {
    const feats = vector.getFeatures().filter(r => r.getId().startsWith('er_'))
    feats.forEach(r => {
      vector.removeFeature(r);
    });
    const features = points.map(r => {
      const feature = new Feature({
        geometry: new Point([parseFloat(r.stLong) || parseFloat(r.wmstLong) || parseFloat(r.longitude), parseFloat(r.stLat) || parseFloat(r.wmstLat) || parseFloat(r.latitude)]),
        name: r.stName || r.wmstName || r.stCode
      });
      feature.setStyle(new Style({
        image: new Icon({
          src: useFile(r.icon),
          scale: 1,
          size: [20, 20],
          anchor: [0.5, 0.2]
        }),
        text: new Text({
          text: formatPointVal(r),
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
          offsetY: '-21',
        })
      }));
      feature.setId(`er_${r.t}_${Math.random().toString(36).slice(-4)}`);
      feature.setProperties({
        ...r,
        stcd: r.stCode || r.wmstCode,
        type: r.t,
        state: 'time',
        coord: [r.stLong || r.wmstLong || r.longitude, r.stLat || r.wmstLat || r.latitude]
      });
      return feature;
    });
    vector.addFeatures(features);
  } else {
    // 所有实时站点都没选中时 删除全部
    const feats = vector.getFeatures().filter(r => r.getId().startsWith('er_'))
    feats.forEach(r => {
      vector.removeFeature(r);
    });
    closeTime();
  }
}, { immediate: true });

/**
 * 水利工程建筑物
 */
watch(() => gqOneImageStore.conservancyPoint, (points) => {
  if (points.length) {
    const feats = vector.getFeatures().filter(r => r.getId().startsWith('os_'))
    feats.forEach(r => {
      vector.removeFeature(r);
    });
    const features = points.map(r => {
      const feature = new Feature({
        geometry: new Point([r.pustLong || r.culvLong || r.hystLong || r.longitude || r.startLong, r.startLat || r.pustLat || r.culvLat || r.hystLat || r.latitude]),
        name: r.wagaName || r.pustName || r.flumName || r.culvName || r.hystName || r.insiName || r.damName || r.tunnelName
      });
      feature.setStyle(new Style({
        image: new Icon({
          src: useFile(r.icon),
          scale: 1,
          size: [20, 20],
          anchor: [0.5, 0.2]
        }),
        text: new Text({
          text: r.wagaName || r.pustName || r.flumName || r.culvName || r.hystName || r.insiName || r.damName || r.tunnelName,
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
          offsetY: '-21',
        }),
      }));
      feature.setId(`os_${r.t}_${Math.random().toString(36).slice(-4)}`);
      feature.setProperties({
        ...r,
        stcd: r.wagaCode || r.pustCode || r.flumCode || r.culvCode || r.hystCode || r.insiCode || r.damCode || r.tunnelCode,
        type: r.t,
        state: 'build',
        coord: [r.pustLong || r.longitude || r.culvLong || r.hystLong || r.startLong, r.startLat || r.pustLat || r.culvLat || r.hystLat || r.latitude]
      });
      return feature;
    });
    vector.addFeatures(features);
  } else {
    const feats = vector.getFeatures().filter(r => r.getId().startsWith('os_'))
    feats.forEach(r => {
      vector.removeFeature(r);
    });
    closeBuild()
  }
}, { immediate: true });



watch(currentZoom,()=>{
// console.log(currentZoom.value)
})
/**
 *
 * 图层
 */
watch([() => map.value, () => gqOneImageStore.buildLayers], ([map, layers], [oldMap, oldLayers]) => {
  if (map) {
    const allLayer = map.getLayers().getArray();// 所有图层
    if (oldLayers.length > layers.length) { // 取消选中图层时
      const notLayer = oldLayers.filter(r => !layers.find(c => c === r));
      notLayer.length && allLayer.forEach(c => {
        notLayer.forEach(b => {
          if (c.getProperties().id === b.split('-')[0]) {
            map.removeLayer(c)  // 删除取消选中的图层
          }
        })
      });
    } else {
      // 找出没有添加的图层避免重复添加
      const oLayers = layers.filter(e => !allLayer.find(c => c.getProperties().id === e.split('-')[0]));
      oLayers.forEach(r => {
        switch (r.split('-')[0]) {
          case 'outer': // 外边界
            const bj = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-wangyinggq/rest/maps/wangyingouter?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            })
            bj.setProperties({ id: 'outer' })
            map.addLayer(bj);
            break;
          case 'hlsx': // 河流水系
            const hlsx = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-WangYingCaiXianShuiKuMianTuCeng/rest/maps/T_%E6%B2%B3%E6%B9%96%E9%95%BF_%E7%8E%8B%E8%8B%B1%E6%B0%B4%E5%BA%93_%E7%9B%B8%E5%85%B3%E6%B2%B3%E6%B5%81@%E6%B0%B4%E5%BA%93%E9%9D%A2%E6%95%B0%E6%8D%AE%E9%9B%86?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            hlsx.setProperties({ id: 'hlsx' })
            map.addLayer(hlsx);
            break;
          case 'main': // 主干渠
            const main = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-wangyinggq/rest/maps/wangyingmain?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            main.setProperties({ id: 'main' })
            map.addLayer(main);
            break;
          case 'trunk': // 干渠
            const trunk = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-wangyinggq/rest/maps/wangyingtrunk?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            trunk.setProperties({ id: 'trunk' })
            map.addLayer(trunk);
            break;
          case 'tributary'://支渠
            const tributary = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-wangyinggq/rest/maps/wangyingcanal?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            tributary.setProperties({ id: 'tributary' })
            map.addLayer(tributary);
            break;
          case 'wy':  // 王英 划界确权
            const wy = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-WangYingCaiXianHuaJieQueQuan/rest/maps/%E7%8E%8B%E8%8B%B1%E6%B0%B4%E5%BA%93@%E5%88%92%E7%95%8C%E7%A1%AE%E6%9D%83?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            wy.setProperties({ id: 'wy' })
            map.addLayer(wy);
            break;
          case 'cx': // 蔡贤 划界确权
            const cx = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-WangYingCaiXianHuaJieQueQuan/rest/maps/%E8%94%A1%E8%B4%A4%E6%B0%B4%E5%BA%93@%E5%88%92%E7%95%8C%E7%A1%AE%E6%9D%83?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            cx.setProperties({ id: 'cx' })
            map.addLayer(cx);
            break;
          case 'xzqh': //行政区划
            const xzqh = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-WangYingGuanQu-XingZhengQuHua/rest/maps/%E5%8E%BF%E7%95%8C_%E9%9D%A2_%E7%8E%8B%E8%8B%B1%E7%9B%B8%E5%85%B35%E5%8E%BF@%E5%8C%BA%E5%8E%BF%E6%95%B0%E6%8D%AE%E9%9B%86?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 20
            });
            xzqh.setProperties({ id: 'xzqh' })
            map.addLayer(xzqh);
            break;
          case 'wySurface': // 王英 面
            const wySurface = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-WangYingCaiXianShuiKuMianTuCeng/rest/maps/%E7%8E%8B%E8%8B%B1%E6%B0%B4%E5%BA%93_%E9%9D%A2@%E6%B0%B4%E5%BA%93%E9%9D%A2%E6%95%B0%E6%8D%AE%E9%9B%86?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            wySurface.setProperties({ id: 'wySurface' })
            map.addLayer(wySurface);
            break;
          case 'cxSurface': // 蔡贤 面
            const cxSurface = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-WangYingCaiXianShuiKuMianTuCeng/rest/maps/%E8%94%A1%E8%B4%A4%E6%B0%B4%E5%BA%93_%E9%9D%A2@%E6%B0%B4%E5%BA%93%E9%9D%A2%E6%95%B0%E6%8D%AE%E9%9B%86?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            cxSurface.setProperties({ id: 'cxSurface' })
            map.addLayer(cxSurface);
            break;
          case 'zyt': // 转移路线图
            const zyt = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-ZhuanYiLuXianTu/rest/maps/zylx?prjCoordSys=%7B"epsgCode":4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            zyt.setProperties({ id: 'zyt' })
            map.addLayer(zyt);
            break;
          case 'gsfw': // 供水范围
            const gsfw = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-WangYingCaiXianShuiKuMianTuCeng/rest/maps/%E7%8E%8B%E8%8B%B1%E6%B0%B4%E5%BA%93%E4%BE%9B%E6%B0%B4%E8%8C%83%E5%9B%B4@%E6%B0%B4%E5%BA%93%E9%9D%A2%E6%95%B0%E6%8D%AE%E9%9B%86?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            gsfw.setProperties({ id: 'gsfw' })
            map.addLayer(gsfw);
            map.setView(new View({
              center: [114.6607190071207, 29.975431893776882],
              projection: 'EPSG:4326',
              zoom: 11,
            }))
            break;
          case 'ggfw': // 灌溉范围
            const ggfw = new TileLayer({
              source: new TileSuperMapRest({
                url: `/superMapUrl/iserver/services/map-wangyinggq/rest/maps/wangyinginner?prjCoordSys=%7B%22epsgCode%22:4326%7D`,
                wrapX: true,
              }),
              zIndex: 23
            });
            ggfw.setProperties({ id: 'ggfw' })
            map.addLayer(ggfw);
            map.setView(new View({
              center: [114.6607190071207, 29.975431893776882],
              projection: 'EPSG:4326',
              zoom: 11,
            }))
            break;
        }
      })
    }
  }
})

/*
*
* 点击点位
* */
watchEffect(() => {
  map.value && map.value.on('click', (event) => {
    map.value.forEachFeatureAtPixel(event.pixel, async (feature, layer) => {
      const { state, coord, type, stcd, name, dataSource } = feature.getProperties();
      if (type == 'QQ') {
        return true
      }
      if (state === 'time') { // 实时监测站点
        if (type === 'VD') { // 视频点
          title.value = name;
          getPlayUrl({
            protocol: 'hls',
            dataSource: dataSource,
            wmstCode: stcd
          }).then(res => {
            dialogVisible.value = true;
            playUrl.value = res.data;
          })
        } else { // 除了视频点
          if (overlayTime.value) { // 避免第一报错
            const { category } = overlayTime.value.getProperties();
            if (state === category) { // 每次点击的都是实时监测站类型的弹框 删除前一个弹框
              closeTime();
            }
          }
          currentRealTime.value = feature.getProperties();
          show.value = true;
          createOverlay(coord, feature);
        }
      } else {  // 水利工程建筑物
        if (overlayStructure.value) { // 避免第一报错
          const { category } = overlayStructure.value.getProperties();
          if (currentStructure.value.stcd != stcd || currentStructure.value.type != type) {
            clearCircle();
          }
          if (state === category) { // 每次点击的都是水利工程建筑物d弹框 删除前一个弹框
            closeBuild();
          }
        }
        currentStructure.value = feature.getProperties();
        vise.value = true;
        createBuildOverlay(coord, type);
      }
      return true; // 停止遍历其他要素
    }, { hitTolerance: 5 });  // hitTolerance 增加点击容错率
  });
});

// 播放视频
watch([cameraDialog, dialogVisible, playUrl], ([dialogRef, vis, url]) => {
  if (dialogRef && vis && url) {
    let hls = new Hls();
    DP.value = new DPlayer({
      container: dialogRef,
      autoplay: true,
      live: true,
      screenshot: true,
      preload: 'auto',
      video: {
        url: url,
        type: 'customHls',
        customType: {
          customHls: function (video, player) {
            hls.loadSource(video.src);
            hls.attachMedia(video);
          },
        },
      },
    });
    DP.value.on('pause', function () {
      hls && hls.stopLoad();
    });
    DP.value.on('play', function () {
      hls && hls.startLoad();
    });
    DP.value.on('destroy', function () {
      hls && hls.destroy();
    });
  } else {
    DP.value && DP.value.destroy();
    DP.value = null;
  }
})

// 实时监测点位值
function formatPointVal(r) {
  if (r.t === 'RR') {
    return `${r.stName}  |  ${r.rz || 0} m`;
  } else if (r.t === 'PPS') {
    return `${r.stName.replace(/\s*/g, "")}  |  ${r.oneHourDrp || 0} mm`;
  } else if (r.t === 'DD') {
    return `${r.stName}  |  ${r.upz || 0} m`;
  } else if (r.t === 'WQ') {
    return `${r.stName}  |  ${formatterVal(r, 'WATER_LEVEL', 'level') || '-'} `;
  } else if (r.t === 'ZQ') {
    return `${r.stName}  |  ${r.z || 0} m`;
  } else if (r.t === 'ZZ') {
    return `${r.stName}  |  ${r.z || 0} m`;
  } else if (r.t === 'VD') {
    return r.wmstName
  } else if (r.t == 'QQ') {
    return r.stCode
  }
}

onBeforeUnmount(() => {
  map.value.setTarget(null);
  map.value = null;
  gqOneImageStore.initSite = false;
})

function getTool(type) {
  layers.forEach((r) => {
    r.setVisible(r.getProperties().type === type);
  });
}

/**
 * 创建实时监测站弹框
 * @param coord
 */
function createOverlay(coord, feature) {
  overlayTime.value = new Overlay({
    element: popupTime.value,
    id: 'TimeDialog',
    position: coord,
    positioning: 'center-center',
    offset: [-325, -25],
  });
  overlayTime.value.setProperties({ category: 'time' })
  map.value.addOverlay(overlayTime.value);
  getHistoryData(feature.getProperties());
}

/**
 * 创建水利工程建筑d弹框
 */
function createBuildOverlay(coord, type) {
  overlayStructure.value = new Overlay({
    element: popupBuild.value,
    id: 'buildDialog',
    position: coord,
    positioning: 'center-center',
    offset: [-325, -25],
  });
  overlayStructure.value.setProperties({ category: 'build', type })
  map.value.addOverlay(overlayStructure.value);
}

/**
 * 关闭实时检测站弹框
 *
 */
function closeTime() {
  map.value && map.value.removeOverlay(overlayTime.value);
  show.value = false;
  activeName.value = '1'
}

/**
 * 关闭水利工程建筑物d弹框
 */
function closeBuild() {
  map.value && map.value.removeOverlay(overlayStructure.value);
  vise.value = false;
  activeName.value = '1'
}

/*
* 历史站点数据
* */
function getHistoryData(feature) {
  const { stcd, type } = feature;
  if (history.value) {
    const historyChart = echarts.init(history.value);
    let series = [];
    let xAxis = [];
    switch (type) {
      case 'RR': // 水库
        getSwMonitor({ stcd }).then(res => {
          if (res.success) {
            historyData.value = res.data;
            xAxis = res.data.map(r => r.tm.split(' ')[1]);
            const rz = res.data.map(r => r.rz || 0);  // 库上水位
            const blrz = res.data.map(r => r.blrz || 0); // 库下水位
            const inq = res.data.map(r => r.inq || 0); // 入库流量
            const otq = res.data.map(r => r.otq || 0); // 出库流量
            const w = res.data.map(r => (r.w / 100).toFixed(3) || 0); // 蓄水量
            series = [
              {
                name: '库上水位',
                data: rz,
                type: 'line',
                smooth: true,
                yAxisIndex: 0,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' m';
                  }
                },
              },
              {
                name: '库下水位',
                data: blrz,
                type: 'line',
                smooth: true,
                yAxisIndex: 0,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' m';
                  }
                },
              },
              {
                name: '入库流量',
                data: inq,
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' m³/s';
                  }
                },
              },
              {
                name: '出库流量',
                data: otq,
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' m³/s';
                  }
                },
              },
              {
                name: '蓄水量',
                data: w,
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' 亿m³';
                  }
                },
              },
            ];
            historyChart.setOption({
              grid: {
                left: '3%',
                right: '3%',
                bottom: '3%',
                top: '12%',
                containLabel: true
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxis
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                },
                confine: true
              },
              yAxis: [
                {
                  name: '水位(m)',
                  type: 'value',
                  min: 0,
                  max: 70,
                  interval: 10,
                  splitLine: {     //网格线
                    "show": false
                  },
                  axisTick: {
                    show: true, // 坐标轴刻度
                  },
                  axisLine: {
                    show: true, // 坐标轴轴线
                    lineStyle: {
                      color: '#000'
                    }
                  },
                },
                {
                  name: '蓄水量(亿m³)',
                  type: 'value',
                  splitLine: {     //网格线
                    "show": false
                  },
                  axisTick: {
                    show: true, // 坐标轴刻度
                  },
                  axisLine: {
                    show: true, // 坐标轴轴线
                    lineStyle: {
                      color: '#000'
                    }
                  },
                }
              ],
              series: series
            }, true);
          }
        })
        break;
      case 'PPS': // 雨量站
        getYlMonitor({ stcd }).then(res => {
          if (res.success) {
            historyData.value = res.data;
            xAxis = res.data.map(r => r.tm.split(' ')[1]);
            const data = res.data.map(r => r.drp || 0);
            series = [
              {
                name: '雨量站',
                data: data,
                type: 'line',
                smooth: true,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' mm';
                  }
                },
              }
            ];
            historyChart.setOption({
              grid: {
                left: '4%',
                right: '3%',
                bottom: '3%',
                top: '12%',
                containLabel: true
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxis
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                },
                confine: true
              },
              yAxis: {
                name: '时段降水量(mm)',
                type: 'value',
                splitLine: {     //网格线
                  "show": false
                },
                axisTick: {
                  show: true, // 坐标轴刻度
                },
                axisLine: {
                  show: true, // 坐标轴轴线
                  lineStyle: {
                    color: '#000'
                  }
                },
              },
              series: series
            }, true);
          }
        })
        break;
      case 'DD': //水闸站
        getSzMonitor({ stcd }).then(res => {
          if (res.success) {
            historyData.value = res.data;
            xAxis = res.data.map(r => r.tm.split(' ')[1]);
            const upz = res.data.map(r => r.upz || 0);  // 闸上水位
            const dwz = res.data.map(r => r.blrz || 0); // 闸下水位
            const tgtq = res.data.map(r => r.tgtq || 0); // 总过闸流量
            series = [
              {
                name: '闸上水位',
                data: upz,
                type: 'line',
                smooth: true,
                yAxisIndex: 0,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' m';
                  }
                },
              },
              {
                name: '闸下水位',
                data: dwz,
                type: 'line',
                smooth: true,
                yAxisIndex: 0,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' m';
                  }
                },
              },
              {
                name: '总过闸流量',
                data: tgtq,
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' m³/s';
                  }
                },
              }
            ];
            historyChart.setOption({
              grid: {
                left: '3%',
                right: '3%',
                bottom: '3%',
                top: '12%',
                containLabel: true
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxis
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                },
                confine: true
              },
              yAxis: [
                {
                  name: '水位(m)',
                  type: 'value',
                  min: 0,
                  max: 70,
                  interval: 10,
                  splitLine: {     //网格线
                    "show": false
                  },
                  axisTick: {
                    show: true, // 坐标轴刻度
                  },
                  axisLine: {
                    show: true, // 坐标轴轴线
                    lineStyle: {
                      color: '#000'
                    }
                  },
                },
                {
                  name: '流量(m³/s)',
                  type: 'value',
                  splitLine: {     //网格线
                    "show": false
                  },
                  axisTick: {
                    show: true, // 坐标轴刻度
                  },
                  axisLine: {
                    show: true, // 坐标轴轴线
                    lineStyle: {
                      color: '#000'
                    }
                  },
                }
              ],
              series: series
            }, true);
          }
        })
        break;
      case 'WQ': //水质
        getSzhiMonitor({ stcd }).then(res => {
          if (res.success) {
            historyData.value = res.data;
            xAxis = res.data.map(r => r.tm.split(' ')[1]);
            const codmn = res.data.map(r => r.codmn || 0);  // 高锰酸盐指数
            const dox = res.data.map(r => r.dox || 0); // 溶解氧
            const nh3n = res.data.map(r => r.codcr || 0); // 氨氮
            const tn = res.data.map(r => r.codcr || 0); // 总氮
            const codcr = res.data.map(r => r.codcr || 0); // 化学需氧量
            const tp = res.data.map(r => r.tp || 0); // 总磷
            series = [
              {
                name: '高锰酸盐指数',
                data: codmn,
                type: 'line',
                smooth: true,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' mg/L';
                  }
                },
                areaStyle: {},
              },
              {
                name: '溶解氧',
                data: dox,
                type: 'line',
                smooth: true,
                areaStyle: {},
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' mg/L';
                  }
                },
              },
              {
                name: '氨氮',
                data: nh3n,
                type: 'line',
                smooth: true,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' mg/L';
                  }
                },
                areaStyle: {},
              },
              {
                name: '总氮',
                data: tn,
                type: 'line',
                smooth: true,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' mg/L';
                  }
                },
                areaStyle: {},
              },
              {
                name: '化学需氧量',
                data: codcr,
                type: 'line',
                smooth: true,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' mg/L';
                  }
                },
                areaStyle: {},
              },
              {
                name: '总磷',
                data: tp,
                type: 'line',
                smooth: true,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' mg/L';
                  }
                },
                areaStyle: {},
              },
            ];
            historyChart.setOption({
              grid: {
                left: '3%',
                right: '3%',
                bottom: '3%',
                top: '12%',
                containLabel: true
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxis
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                },
                confine: true
              },
              yAxis: {
                // name:'mg/L',
                type: 'value',
                splitLine: {     //网格线
                  "show": false
                },
                axisTick: {
                  show: true, // 坐标轴刻度
                },
                axisLine: {
                  show: true, // 坐标轴轴线
                  lineStyle: {
                    color: '#000'
                  }
                },
              },
              series: series
            }, true);
          }
        })
        break;
      case 'ZQ': //河道水情
        getHdMonitor({ stcd }).then(res => {
          if (res.success) {
            historyData.value = res.data;
            xAxis = res.data.map(r => r.tm.split(' ')[1]);
            const sw = res.data.map(r => r.z || 0);  // 水位
            const ll = res.data.map(r => r.q || 0);  // 流量
            series = [
              {
                name: '水位',
                data: sw,
                type: 'line',
                smooth: true,
                yAxisIndex: 0,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' m';
                  }
                },
              },
              {
                name: '流量',
                data: ll,
                type: 'line',
                smooth: true,
                yAxisIndex: 1,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' m³/s';
                  }
                },
              },
            ];
            historyChart.setOption({
              grid: {
                left: '3%',
                right: '3%',
                bottom: '3%',
                top: '12%',
                containLabel: true
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxis
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                },
                confine: true
              },
              yAxis: [
                {
                  name: '水位(m)',
                  type: 'value',
                  min: 0,
                  max: 70,
                  interval: 10,
                  splitLine: {     //网格线
                    "show": false
                  },
                  axisTick: {
                    show: true, // 坐标轴刻度
                  },
                  axisLine: {
                    show: true, // 坐标轴轴线
                    lineStyle: {
                      color: '#000'
                    }
                  },
                },
                {
                  name: '流量(m³/s)',
                  type: 'value',
                  splitLine: {     //网格线
                    "show": false
                  },
                }
              ],
              series: series
            }, true);
          }
        })
        break;
      case 'ZQ': //渠道水文
        getQdMonitor({ stcd }).then(res => {
          if (res.success) {
            historyData.value = res.data;
            xAxis = res.data.map(r => r.tm.split(' ')[1]);
            const sw = res.data.map(r => r.z || 0);  // 水位
            const ll = res.data.map(r => r.q || 0); //流量
            series = [
              {
                name: '水位',
                data: sw,
                type: 'line',
                smooth: true,
                yAxisIndex: 0,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' m';
                  }
                },
              },
              {
                name: '流量',
                data: ll,
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                tooltip: {
                  valueFormatter: function (value) {
                    return value + ' m³/s';
                  }
                },
              },
            ];
            historyChart.setOption({
              grid: {
                left: '3%',
                right: '3%',
                bottom: '3%',
                top: '12%',
                containLabel: true
              },
              xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxis
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                },
                confine: true
              },
              yAxis: [
                {
                  name: '水位(m)',
                  type: 'value',
                  min: 0,
                  max: 70,
                  interval: 10,
                  splitLine: {     //网格线
                    "show": false
                  },
                  axisTick: {
                    show: true, // 坐标轴刻度
                  },
                  axisLine: {
                    show: true, // 坐标轴轴线
                    lineStyle: {
                      color: '#000'
                    }
                  },
                },
                {
                  name: '流量(m³/s)',
                  type: 'value',
                  splitLine: {     //网格线
                    "show": false
                  },
                  axisTick: {
                    show: true, // 坐标轴刻度
                  },
                  axisLine: {
                    show: true, // 坐标轴轴线
                    lineStyle: {
                      color: '#000'
                    }
                  },
                }
              ],
              series: series
            }, true);
          }
        })
        break;
    }
  }
}

// 删除污染源圆形
function clearCircle() {
  const cir = circle.getFeatures().filter(r => r.getId() === 'circle');
  cir.length && circle.removeFeature(cir[0]);
}

//查询附件监测设备
function handleSearch() {
  if (vise.value) {
    clearCircle();
    const info = currentStructure.value;
    const radius = count.value * 1000 / map.value.getView().getProjection().getMetersPerUnit();
    const feature = new Feature({
      geometry: new Circle([info.longitude || info.pustLong, info.latitude || info.pustLat], radius),
    });
    feature.setId('circle');
    feature.setStyle(new Style({
      fill: new Fill({ color: 'rgba(223, 76, 60 , 0.5)' }),
      stroke: new Stroke({ color: '#ffcc33', width: 2 }),
    }));
    circle.addFeature(feature);
  } else {
    clearCircle();
  }
}

function useFile(name) {
  return new URL(`../../assets/imgs/${name}.png`, import.meta.url).href;
}

// function handleCamera(ops) {
//   dialogVisible.value = true;
// }

/**
 * 创建遮罩层
 * @param map
 * @returns {boolean}
 */
function creatMask(map) {
  const geo = new GeoJSON();
  const box1 = [
    [-180, -90],
    [-180, 90],
    [180, 90],
    [180, -90],
    [-180, -90]
  ]
  const maskGeometry = turf.polygon([box1]);
  // let multiPolygon = turf.lineToPolygon(json);
  const multiLineString = new MultiLineString(turf.multiLineString(json).geometry.coordinates);
  let multiPolygon = new MultiPolygon(multiLineString.getCoordinates().map((lineStringCoords) => [lineStringCoords]));
  multiPolygon = new Feature({
    geometry: multiPolygon
  })
  multiPolygon = geo.writeFeatureObject(multiPolygon);
  const diffGeometry = turf.difference(maskGeometry, multiPolygon);
  const maskFeature = geo.readFeature(diffGeometry);
  const source = new VectorSource();
  source.addFeature(maskFeature)
  const maskLayer = new VectorLayer({
    source: source,
    style: new Style({
      fill: new Fill({ color: 'rgba(220,240,253,0)' }),
    }),
    zIndex: 22,
    id: 'mask',
    visible: true,
  });
  map.addLayer(maskLayer)
}


</script>
<style lang="scss">
.camera-dialog {
  .el-dialog__body {
    padding: 0;
  }
}
</style>
<style scoped lang="scss">
li {
  list-style-type: none;
}

.map-container {
  position: relative;
  height: calc(100vh - 105px);
  width: 100vw;

  .legend {
    position: absolute;
    bottom: 5%;
    background: #FFFFFF;
    border-radius: 14px;
    padding: 10px;
    transition: left .8s;

    li {
      display: flex;
      align-items: center;
      color: #999;
      font-size: 12px;
      margin: 5px 0;

      span:nth-child(1) {
        flex: 1;
        white-space: nowrap;
        color: #383a3d;
      }

      span:nth-child(2) {
        display: inline-block;
        flex: 1;
        width: 40px;
        height: 2px;
        border-radius: 8px;
        margin-left: 5px;
      }

      &:first-child {
        margin-top: 0;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.map-box {
  height: calc(100vh - 105px);
  width: 100vw;
}

.ol-popup {
  position: absolute;
  bottom: 22px;
  min-width: 650px;
  padding: 0px;
  background-color: #1a8dff;
  background: #fff;
  // border-radius: 10px;
  border-radius: 10px;
  .head {
    display: flex;
    padding: 0 15px;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    border-bottom: 1px solid #F1F1F1;
    background-color: #1a8dff;
    border-radius: 8px 8px 0px 0px;
    h4 {
      color: #fff;
      margin-bottom: 0;
      font-size: 18px;
    }
  }

  .box-build {
    height: 290px;
    margin: 0px 0px 0px 15px;
    h3 {
      position: relative;
      font-size: 14px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: bold;
      color: #666666;
      padding-left: 12px;
      margin: 0.5em 0;

      &:before {
        content: "";
        position: absolute;
        left: 0px;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 10px;
        background: #1791FF;
      }
    }

    .pollution {
      display: none;
      align-items: center;
    }
  }

  .box {
    height: 235px;
    width: 620px;
  }

  .camera {
    display: inline-block;
    width: 30px;
    height: 30px;
    background: url("@/assets/images/camera.png") no-repeat center center;
    background-size: contain;
    cursor: pointer;
  }

  .el-tabs--top {
    background-color: #fff;
    padding: 0 15px 15px 15px;
    border-radius: 10px;
  }

}
</style>