<template>
    <div class="container">
        <div class="wrapper">
            <div class="lf">
                <div class="top" style="display: none">
                    <div class="box1">
                        <li>
                            <h3>欢迎！{{ userStore.realName }}</h3>
                            <span>{{ getDate() }}</span>
                        </li>
                        <li>
                            <div class="item-box">
                                <div class="item">
                                    <div class="title">
                                        <i class="xcxj"></i>
                                        <span>本年巡查巡检</span>
                                    </div>
                                    <div class="txt" @click="handleInspection">
                                        <span>{{ totalTop.patrolNum }}</span>
                                        <span>条</span>
                                    </div>
                                </div>
                                <div class="item">
                                    <div class="title">
                                        <i class="yssb"></i>
                                        <span>本年用水申报</span>
                                    </div>
                                    <div class="txt" @click="handleDeclaration">
                                        <span>{{ totalTop.waterApplyNum }}</span>
                                        <span>条</span>
                                    </div>
                                </div>
                                <div class="item">
                                    <div class="title">
                                        <i class="whyh"></i>
                                        <span>本年维护养护</span>
                                    </div>
                                    <div class="txt" @click="handleMaintenance">
                                        <span>{{ totalTop.protectNum }}</span>
                                        <span>条</span>
                                    </div>
                                </div>
                                <div class="item">
                                    <div class="title">
                                        <i class="spyj"></i>
                                        <span>本年视频预警</span>
                                    </div>
                                    <div class="txt" @click="handleVideoWarning">
                                        <span>{{ totalTop.rvNum }}</span>
                                        <span>条</span>
                                    </div>
                                </div>
                            </div>
                            <div class="item-box">
                                <div class="item" style="flex: 0.25">
                                    <div class="title">
                                        <i class="ylgj"></i>
                                        <span>实时雨量告警</span>
                                    </div>
                                    <div class="txt">
                                        <span>{{ totalTop.drpWarnNum }}</span>
                                        <span>个</span>
                                    </div>
                                </div>
                                <div class="item" style="flex: 0.25">
                                    <div class="title">
                                        <i class="swgj"></i>
                                        <span>实时水位告警</span>
                                    </div>
                                    <div class="txt">
                                        <span>{{ totalTop.rzWarnNum }}</span>
                                        <span>个</span>
                                    </div>
                                </div>
                                <div class="item" style="flex: 0.5">
                                    <div class="title">
                                        <i class="skxx"></i>
                                        <span>王英水库超汛线水位</span>
                                    </div>
                                    <div class="txt">
                                        <span style="color: #4e5969">{{ totalTop.exceedRz }}</span>
                                        <span>m</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </div>
                    <div class="box2">
                        <li>
                            <i class="zgq"></i>
                            <span class="b_1">总干渠</span>
                            <div class="bm_r">
                                <span class="b_2">
                                    数量
                                    <strong>{{ ditch.chanInfo.canalNum || 0 }}</strong>
                                    条
                                </span>
                                <span class="b_2">
                                    渠长
                                    <strong>{{ ditch.chanInfo.canalLength || 0 }}</strong>
                                    km
                                </span>
                            </div>
                        </li>
                        <li>
                            <i class="gq"></i>
                            <span class="b_1">干渠</span>
                            <div class="bm_r">
                                <span class="b_2">
                                    数量
                                    <strong>{{ ditch.chanInfo.mainCanalNum || 0 }}</strong>
                                    条
                                </span>
                                <span class="b_2">
                                    渠长
                                    <strong>{{ ditch.chanInfo.mainCanalLength || 0 }}</strong>
                                    km
                                </span>
                            </div>
                        </li>
                        <li>
                            <i class="zq"></i>
                            <span class="b_1">支渠</span>
                            <div class="bm_r">
                                <span class="b_2">
                                    数量
                                    <strong>{{ ditch.chanInfo.branchCanalNum || 0 }}</strong>
                                    条
                                </span>
                                <span class="b_2">
                                    渠长
                                    <strong>{{ ditch.chanInfo.branchCanalLength || 0 }}</strong>
                                    km
                                </span>
                            </div>
                        </li>
                    </div>
                    <div class="box3">
                        <li>
                            <i class="jzz"></i>
                            <span class="b_1">节制闸</span>
                            <strong>
                                {{ ditch.wagaInfo.checkGateNum || 0 }}
                                <span>个</span>
                            </strong>
                        </li>
                        <li>
                            <i class="fsz"></i>
                            <span class="b_1">分水闸</span>
                            <strong>
                                {{ ditch.wagaInfo.turnOutGateNum || 0 }}
                                <span>个</span>
                            </strong>
                        </li>
                        <li>
                            <i class="xhz"></i>
                            <span class="b_1">泄洪闸</span>
                            <strong>
                                {{ ditch.wagaInfo.floodGateNum || 0 }}
                                <span>个</span>
                            </strong>
                        </li>
                        <li>
                            <i class="dm"></i>
                            <span class="b_1">斗门</span>
                            <strong>
                                {{ ditch.wagaInfo.sluiceGateNum || 0 }}
                                <span>个</span>
                            </strong>
                        </li>
                        <li>
                            <i class="hd"></i>
                            <span class="b_1">涵洞</span>
                            <strong>
                                {{ ditch.culvNum || 0 }}
                                <span>个</span>
                            </strong>
                        </li>
                        <li>
                            <i class="sd"></i>
                            <span class="b_1">隧洞</span>
                            <strong>
                                {{ ditch.tunnelNum || 0 }}
                                <span>个</span>
                            </strong>
                        </li>
                    </div>
                </div>
                <div class="top">
                    <div class="info">
                        <h3>水库信息（{{ time1 }}）</h3>
                        <div class="info-box">
                            <li>
                                <h5 class="head-sub-title">王英水库</h5>
                                <div class="tabs">
                                    <span>
                                        总蓄水量：
                                        <strong>{{ (wy.w / 100).toFixed(3) || 0 }}</strong>
                                        亿m³
                                    </span>
                                    <span>
                                        有效蓄水量：
                                        <strong>{{ ((wy.w - wy.deadCap / 100) / 100).toFixed(3) || 0 }}</strong>
                                        亿m³
                                    </span>
                                </div>
                                <div class="chartQ">
                                    <div class="charts">
                                        <div class="line-a">
                                            <span>校核：{{ wy.cfZ || 0 }}m</span>
                                        </div>
                                        <div class="line-b">
                                            <span>设计：{{ wy.desFz || 0 }}m</span>
                                        </div>
                                        <div class="line-f">
                                            <span>正常蓄水位：{{ wy.normWatLev || 0 }}m</span>
                                        </div>
                                        <div class="line-c">
                                            <span>控制运用水位：{{ wy.fsltdz || 0 }}m</span>
                                        </div>
                                        <div class="line-d">
                                            <span>实时：{{ wy.rz }}m</span>
                                        </div>
                                        <div class="line-e">
                                            <span>死水位：{{ wy.deadLev || 0 }}m</span>
                                        </div>
                                        <div ref="chart3" style="width: 241px; height: 100%"></div>
                                    </div>
                                    <div class="line-box">
                                        <div class="total-box">
                                            <span class="lien-ol"></span>
                                            <span class="total">总库容 {{ formatTotal1 }}亿m³</span>
                                            <div class="total-tr">
                                                <div>调洪库容</div>
                                                <div>
                                                    <strong>{{ wy.storFlCap / 10000 || 0 }}</strong>
                                                    亿m³
                                                </div>
                                            </div>
                                            <div class="total-xl">
                                                <div>兴利库容</div>
                                                <div>
                                                    <strong>{{ wy.benResCap / 10000 || 0 }}</strong>
                                                    亿m³
                                                </div>
                                            </div>
                                            <div class="total-s">
                                                <div>死库容</div>
                                                <div>
                                                    <strong>{{ wy.deadCap / 10000 || 0 }}</strong>
                                                    亿m³
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <h5 class="head-sub-title">蔡贤水库</h5>
                                <div class="tabs">
                                    <span>
                                        总蓄水量：
                                        <strong>{{ (cx.w / 100).toFixed(3) || 0 }}</strong>
                                        亿m³
                                    </span>
                                    <span>
                                        有效蓄水量：
                                        <strong>{{ ((cx.w - cx.deadCap / 100) / 100).toFixed(3) || 0 }}</strong>
                                        亿m³
                                    </span>
                                </div>
                                <div class="chartQ">
                                    <div class="charts">
                                        <div class="line-a">
                                            <span>校核：{{ cx.cfZ || 0 }}m</span>
                                        </div>
                                        <div class="line-b">
                                            <span>设计：{{ cx.desFz || 0 }}m</span>
                                        </div>
                                        <div class="line-f">
                                            <span>正常蓄水位：{{ cx.normWatLev || 0 }}m</span>
                                        </div>
                                        <!--                  <div class="line-c">-->
                                        <!--                  </div>-->
                                        <div class="line-d">
                                            <span>实时：{{ cx.rz }}m</span>
                                        </div>
                                        <div class="line-e">
                                            <span>死水位：{{ cx.deadLev || 0 }}m</span>
                                        </div>
                                        <div ref="chart4" style="width: 241px; height: 100%"></div>
                                    </div>
                                    <div class="line-box">
                                        <div class="total-box">
                                            <span class="lien-ol"></span>
                                            <span class="total">总库容 {{ formatTotal2 }} 亿m³</span>
                                            <div class="total-tr">
                                                <div>调洪库容</div>
                                                <div>
                                                    <strong>{{ cx.storFlCap / 10000 || 0 }}</strong>
                                                    亿m³
                                                </div>
                                            </div>
                                            <div class="total-xl">
                                                <div>兴利库容</div>
                                                <div>
                                                    <strong>{{ cx.benResCap / 10000 || 0 }}</strong>
                                                    亿m³
                                                </div>
                                            </div>
                                            <div class="total-s">
                                                <div>死库容</div>
                                                <div>
                                                    <strong>{{ cx.deadCap / 10000 || 0 }}</strong>
                                                    亿m³
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    <li style="display: none">
                        <h3>
                            实时数据
                            <span>（{{ time1 }}）</span>
                        </h3>
                        <div class="surface box" style="margin-bottom: 10px">
                            <div class="head-sub-title">面雨量</div>
                            <div class="image wy" ref="areaRain"></div>
                        </div>
                        <div class="waterLevel box">
                            <div class="head-sub-title">水位 8:00</div>
                            <div class="image cx" style="flex: 1" ref="sw_chart"></div>
                        </div>
                    </li>
                    <li>
                        <div style="display: flex; justify-content: space-between; align-items: center">
                            <h3>关注站点信息</h3>
                            <div>
                                <el-input style="width: 240px; margin-right: 35px" v-model="input" clearable size="small" placeholder="请输入站点名称">
                                    <template #append>
                                        <el-button type="primary" @click="handleSearch" style="background: #409eff">
                                            <el-icon :size="16" style="color: #ffff">
                                                <Search />
                                            </el-icon>
                                        </el-button>
                                    </template>
                                </el-input>
                            </div>
                        </div>
                        <div class="follow">
                            <div class="tabs">
                                <div :class="{ 'is-active': index == 9, tab: true }" @click="handleSelect(9, 'AR')">面雨量</div>
                                <div :class="{ 'is-active': index == 1, tab: true }" @click="handleSelect(1, 'PPS')">雨情</div>
                                <div :class="{ 'is-active': index == 8, tab: true }" @click="handleSelect(8, 'PPS')">山洪雨情</div>
                                <div :class="{ 'is-active': index == 2, tab: true }" @click="handleSelect(2, 'RR')">水库水情</div>
                                <div :class="{ 'is-active': index == 5, tab: true }" @click="handleSelect(5, 'ZQ')">河道水情</div>
                                <div :class="{ 'is-active': index == 6, tab: true }" @click="handleSelect(6, 'ZZ', 1)">灌区水文</div>
                                <div :class="{ 'is-active': index == 10, tab: true }" @click="handleSelect(10, 'ZZ', 2)">流量站</div>
                                <div :class="{ 'is-active': index == 7, tab: true }" @click="handleSelect(7, 'WQ')">水质站</div>
                                <div :class="{ 'is-active': index == 3, tab: true }" @click="handleSelect(3, 'DD')">水闸站</div>
                                <div :class="{ 'is-active': index == 4, tab: true }" @click="handleSelect(4, 'VD')">视频监控</div>
                            </div>
                            <div class="tableBox" ref="tableRef">
                                <el-table :height="height" ref="tableInst" header-cell-class-name="custom-header" :data="tableData">
                                    <el-table-column align="center" :width="columnWidth(index)" sortable :prop="prop" v-if="index != 9" label="点位名称">
                                        <template #default="{ row }">
                                            <div style="display: flex; align-items: center">
                                                <el-icon :style="{ color: row.isFollow ? '#FFD700' : '' }" @click="handleClick(row)" size="23"><StarFilled /></el-icon>
                                                <span style="margin-left: 10px">{{ row.wmstName || row.stName }}</span>
                                                <!-- .replace("雨量站","") -->
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column align="center" :width="columnWidth(index)" sortable prop="wshName" label="区域" v-if="index == 9"></el-table-column>
                                    <el-table-column align="center" prop="p" label="当日面雨量(mm)" v-if="index == 9"></el-table-column>
                                    <el-table-column align="center" prop="p30" label="过去30日面雨量(mm)" v-if="index == 9"></el-table-column>
                                    <el-table-column align="center" prop="ph30" label="历史同期30日面雨量(mm)" v-if="index == 9"></el-table-column>
                                    <el-table-column align="center" prop="ratio" label=" 降雨距平百分率" v-if="index == 9"></el-table-column>
                                    <el-table-column align="center" prop="alarmLevel" label=" 预警级别" v-if="index == 9"></el-table-column>
                                    <el-table-column align="center" label="1h(mm)" sortable width="100" prop="oneHourDrp" v-if="index == 1 || index == 8"></el-table-column>
                                    <el-table-column align="center" label="24h(mm)" sortable width="120" prop="oneDayDrp" v-if="index == 1 || index == 8"></el-table-column>
                                    <el-table-column align="center" label="今日(mm)" sortable width="120" prop="toDayDrp" v-if="index == 1 || index == 8"></el-table-column>
                                    <el-table-column align="center" label="本月(mm)" sortable width="120" prop="monthDrp" v-if="index == 1 || index == 8"></el-table-column>
                                    <el-table-column align="center" label="本年(mm)" sortable width="120" prop="yearDrp" v-if="index == 1 || index == 8"></el-table-column>
                                    <el-table-column align="center" v-if="index == 2" prop="rz" label="库水位(m)">
                                        <template #default="{ row }">
                                            <span style="font-weight: bold">
                                                <el-icon v-if="row.zup" style="color: #d93025; font-weight: bold; font-size: 23px; vertical-align: bottom"><Top /></el-icon>
                                                <el-icon v-else style="color: #3f8952ff; font-weight: bold; font-size: 23px; vertical-align: bottom"><Bottom /></el-icon>
                                                {{ row.rz }}
                                            </span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column align="center" v-if="index == 2" prop="fsltdz" label="控制水位(m)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 2" prop="w" label="总蓄水量(万m³)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 2" width="130" prop="validCap" label="有效蓄水量(万m³)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 2" prop="fullRate" label="蓄满率(%)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 3" prop="upz" label="水位/水深(m)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 3" prop="tgtq" label="总过闸流量(m³/s)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 4" prop="stType" label="视频类型">
                                        <template #default="{ row }">
                                            <span v-if="row.stType">图像站</span>
                                            <span v-else>视频站</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column align="center" v-if="index == 4" prop="dataSource" label="位置">
                                        <template #default="{ row }">
                                            <span v-if="row.dataSource == 1">灌区</span>
                                            <span v-else>水库</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column align="center" v-if="index == 4" prop="status" label="状态">
                                        <template #default="{ row }">
                                            <el-tag type="success" effect="light" round v-if="row.status == 1">在线</el-tag>
                                            <el-tag type="danger" effect="light" round v-else>离线</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column align="center" v-if="index == 4" prop="opt" label="操作">
                                        <template #default="{ row }">
                                            <el-tag style="cursor: pointer" effect="dark" round @click="handleRow(row)">查看</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column align="center" v-if="index == 7" prop="level" label="水质等级">
                                        <template #default="{ row }">
                                            <span v-if="row.level == 1" class="sp_wt" style="background-color: #c5ffff">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                                            <span v-if="row.level == 2" class="sp_wt" style="background-color: #34c3f6">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                                            <span v-if="row.level == 3" class="sp_wt" style="background-color: #03ff03">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                                            <span v-if="row.level == 4" class="sp_wt" style="background-color: #faff19">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                                            <span v-if="row.level == 5" class="sp_wt" style="background-color: #ff9000">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                                        </template>
                                    </el-table-column>
                                    <!-- <el-table-column align="center" v-if="index == 7" prop="wt" label="水温(℃)"></el-table-column> -->
                                    <!-- <el-table-column align="center" v-if="index == 7" prop="ph" label="PH(无量纲)"></el-table-column> -->
                                    <el-table-column align="center" v-if="index == 7" prop="cond" label="电导率(uS/cm)"></el-table-column>
                                    <!-- <el-table-column align="center" v-if="index == 7" prop="tp" label="总磷(mg/L)"></el-table-column> -->
                                    <el-table-column align="center" v-if="index == 7" prop="nh3n" label="氨氮(mg/L)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 7" prop="dox" label="溶解氧(mg/L)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 7" prop="chla" label="叶绿素(μg/L)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 7" prop="codmn" label="高锰酸盐指数(mg/L)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 6 || index == 10" prop="waterDepth" label="水深(m)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 6" prop="alarmWaterDepth" label="警戒水深(m)">
                                        <template #default="{ row }">
                                            {{ formatDepthVal(row.alarmWaterDepth) }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column align="center" v-if="index == 5" prop="z" label="水位(m)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 6 || index == 5 || index == 10" prop="q" label="流量(m³/s)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 10" prop="totalQ" label="24小时流量(m³)"></el-table-column>
                                    <el-table-column align="center" v-if="index == 6 " prop="isAlarm" label="是否超警戒">
                                        <template #default="{ row }">
                                            <span v-if="row.isAlarm" style="color: #fd0303" class="sp_alarm">是</span>
                                            <span v-else-if="formatDepthVal(row.alarmWaterDepth) == '/'">/</span>
                                            <span v-else class="sp_alarm">否</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column align="center" v-if="index > 9 && index != 4" :formatter="formatCount" prop="tm" label="数据时间"></el-table-column>
                                    <el-table-column align="center" v-if="index <= 8 && index != 4" :formatter="formatCount" prop="tm" label="数据时间"></el-table-column>
                                    <el-table-column align="center" v-if="index != 9 && index != 4" label="操作">
                                        <template #default="{ row }">
                                            <!-- <el-icon><Search /></el-icon> -->
                                            <el-link :icon="Search" :underline="false" type="success" @click="details(row.stCode)">详情</el-link>
                                            <!-- {{ row.stCode }} -->
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </div>
                    </li>
                </div>
            </div>
            <div class="rg">
                <div class="maps">
                    <h3>灌区信息</h3>
                    <div class="mapImg">
                        <img src="@/assets/images/digitMap.png" style="width: 100%; height: 100%" />
                        <div>
                            <div class="mapPoints" v-for="(items, index) in pointArr" :key="index" :style="{ bottom: items.bottom + 'px', right: items.right + 'px', 'z-index': items.top }">
                                <div class="ponitText">
                                    {{ items.name }} |
                                    <span style="color: red; display: inline-block; margin-right: 5px">{{ items.status }}</span>
                                    | {{ items.num }}
                                </div>
                                <div class="point"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="statistics">
                    <h3>
                        实际用水统计
                        <strong style="font-size: 14px; margin-left: 10px">({{ ysSys.total }}万m³)</strong>
                    </h3>
                    <div class="item-box">
                        <div class="item">
                            <div class="title">
                                <span class="head-sub-title">月度用水统计</span>
                                <span></span>
                            </div>
                            <div class="chart-box">
                                <div ref="chart1" style="width: 100%; height: 100%"></div>
                            </div>
                        </div>
                        <div class="item">
                            <div class="title">
                                <span class="head-sub-title">全年供需对比</span>
                                <span></span>
                            </div>
                            <div class="chart-box">
                                <ul class="statice_total">
                                    <li>
                                        <span>计划总供水量</span>
                                        <strong>
                                            {{ statice_total.planTotal || 0 }}
                                            <i>万m³</i>
                                        </strong>
                                    </li>
                                    <li>
                                        <span>已供总水量</span>
                                        <strong>
                                            {{ statice_total.realityTotal || 0 }}
                                            <i>万m³</i>
                                        </strong>
                                    </li>
                                    <li>
                                        <span>还需供水</span>
                                        <strong>
                                            {{ statice_total.waterDemandTotal || 0 }}
                                            <i>万m³</i>
                                        </strong>
                                    </li>
                                </ul>
                                <div class="chartS" ref="chart2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <el-dialog v-model="dialogVisible" :title="title" width="50%" draggable @close="close" class="custoe-dialog">
        <div id="mv" ref="customDialog"></div>
    </el-dialog>
    <el-dialog v-model="imgDialogVisible" :title="imgTitle" width="50%" draggable @close="imgClose" class="custoe-dialog">
        <el-image :src="imgUrl" :zoom-rate="1.2" :max-scale="7" :min-scale="0.2" :preview-src-list="imgsrcList" :initial-index="4" fit="cover" />
    </el-dialog>
</template>

<script setup>
import { StarFilled, Search } from '@element-plus/icons-vue';
import Hls from 'hls.js';
import DPlayer from 'dplayer';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import 'echarts-liquidfill';
import { onMounted, reactive, nextTick, onBeforeUnmount, watch, computed } from 'vue';
import { getDitch, getRealTimeSk, getSite, getSk, getSkRealTime, getPlayUrl, getTopTotal, getRadarImage, getWaterStatistics, getActualWaterUseStatistics, getResRain, getWaterUseSupplyContrast } from '@/api/digitization';
import { formatterVal } from '@/utils';
import { addFollow, unFollow } from '@/api/oneimage';
import useUserStore from '@/store/modules/user';
import { ElMessage } from 'element-plus';
import { getHdTable } from '@/api/schedulingCtord/schSetting';
import { getTimeRain } from '@/api/schedulingCtord/realRainfall';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style';
const router = useRouter();
const index = ref(9);
let dialogVisible = ref(false);
let imgDialogVisible = ref(false);
const tableRef = ref();
const tableInst = ref();
const areaRain = ref();
let title = ref('站点名称');
let input = ref('');
let tableData = ref([]);
let imgsrcList = ref([]);
let imgUrl = ref('');
const sw_chart = ref();
const chart1 = ref();
const chart2 = ref();
const chart3 = ref();
const chart4 = ref();
let prop = ref('stName');
const customDialog = ref({});
const userStore = useUserStore();
let height = ref('100%');
let bar = reactive();
let li1 = reactive();
let li2 = reactive();
let time1 = ref('');
let time2 = ref('');
let ditch = ref({
    chanInfo: {
        canalNum: '0',
        canalLength: '0',
        mainCanalNum: '0',
        mainCanalLength: '0',
        branchCanalNum: '0',
        branchCanalLength: '0'
    },
    wagaInfo: {
        floodGateNum: '0',
        checkGateNum: '0',
        turnOutGateNum: '0',
        sluiceGateNum: '0'
    },
    culvNum: 0,
    tunnelNum: 0,
    flumNum: 0,
    insiNum: 0
});
let totalTop = ref({
    drpWarnNum: 0,
    exceedRz: 0,
    patrolNum: 0,
    protectNum: 0,
    rvNum: 0,
    rzWarnNum: 0,
    waterApplyNum: 0
});
let statice_total = ref({
    planTotal: 0,
    realityTotal: 0,
    waterDemandTotal: 0
});
let ysSys = ref({
    irrigate: '0',
    ecology: '0',
    electric: '0',
    town: '0',
    total: 0
});
let realTime = ref({ wyRealData: {}, cxRealData: {} });
let wy = ref({}); //王英
let cx = ref({}); //蔡贤
let type = ref('AR');
let moniItem = ref(1);
const DP = ref(null);
let sourceType = ref(''); //数据类型 0灌区 1水库
const time = 5; // 分钟
let playUrl = ref();
let sWChart, area;

let pointArr = ref([
    {
        name: '杨林渠首闸',
        num: '0.65(m)',
        status: '关闭',
        bottom: 20,
        right: 220,
        top: 999
    },
    {
        name: '牛鼻潭泄洪闸',
        num: '0.08(m)',
        status: '关闭',
        bottom: 45,
        right: 375,
        top: 9999
    },
    {
        name: '九支渠节制闸',
        num: '0.27(m)',
        status: '关闭',
        bottom: 80,
        right: 410,
        top: 999
    },
    {
        name: '万秀八节制闸',
        num: '0.55(m)',
        status: '关闭',
        bottom: 120,
        right: 450,
        top: 99
    },
    {
        name: '一干渠',
        num: '0(m)',
        status: '关闭',
        bottom: 50,
        right: 290,
        top: 9999
    }
]);

const formatTotal1 = computed(() => {
    if (wy.value.totCap) {
        var wyTotCap = wy.value.totCap / 10000 || 0;
        return Array.from(JSON.stringify(wyTotCap)).join('  ');
    }
    return 0;
});
const formatTotal2 = computed(() => {
    if (cx.value.totCap) {
        var cxTotCap = cx.value.totCap / 10000 || 0;
        return Array.from(JSON.stringify(cxTotCap)).join('  ');
    }
    return 0;
});

const formatCount = (row, column, cellValue) => {
    return cellValue ? dayjs(cellValue).format('MM-DD HH:ss') : '';
};
//格式化警戒水深
const formatDepthVal = val => {
    if (val != null || val != undefined) {
        return val;
    } else {
        return '/';
    }
};
// 本年巡查检查
const handleInspection = () => {
    router.push({ path: 'standardized/project/patrol/statistic' });
};

//本年用水申报
const handleDeclaration = () => {
    router.push({ path: 'waterManager/declaration/waterDecMananger' });
};

//本年维护养护
const handleMaintenance = () => {
    router.push({ path: 'standardized/project/maintenance/project' });
};

//本年视频预警
const handleVideoWarning = () => {
    router.push({ path: 'standardized/informationManager/spMonitoring/videoWarning' });
};

const details = stCode => {
    let pathUrl = '';
    switch (index.value) {
        case 1: //实时雨情
            pathUrl = 'standardizedTest/timeData/rainfallTimeDataCommon';
            break;
        case 2: //水库水情
            pathUrl = 'standardizedTest/timeData/reservoirTimeDataCommon';
            break;
        case 3: //水闸站
            pathUrl = 'standardizedTest/timeData/gateStationTimeDataCommon';
            break;
        case 5: //河道水情
            pathUrl = 'standardizedTest/timeData/watercourseTimeDataCommon';
            break;
        case 6: //渠道水文
            pathUrl = 'standardizedTest/timeData/ChannelHydrologyTimeDataCommon';
            break;
        case 7: //水质站
            pathUrl = 'standardizedTest/timeData/waterQualityTimeDataCommon';
            break;
            case 8://山洪雨情
            pathUrl = 'standardizedTest/timeData/torrentialFloodCommon';
            break;
        case 10: //农业水价改革   没有详情接口
            pathUrl = 'standardizedTest/timeData/waterPriceReformTimeDataCommon';
            break;
    }
    router.push({ path: pathUrl, query: { stCode } });
    // console.log(stCode,index.value,moniItem.value);
};

//tab切换
const handleSelect = (i, t, m = 1) => {
    index.value = i;
    type.value = t;
    moniItem.value = m;
    input.value = '';
    localStorage.setItem('Index', index.value);
    localStorage.setItem('Type', type.value);
    localStorage.setItem('MoniItem', moniItem.value);
    tableInst.value.setScrollTop(0);
    getSiteList();
};

//搜索站点名称
const handleSearch = () => {
    getSiteList();
};

const close = () => {
    dialogVisible.value = false;
};
const imgClose = () => {
    imgDialogVisible.value = false;
};
watch(
    index,
    i => {
        if (i == 4) {
            prop.value = 'wmstName';
        } else {
            prop.value = 'stName';
        }
    },
    { immediate: true }
);

function getDate() {
    const datas = dayjs().day();
    const week = ['日', '一', '二', '三', '四', '五', '六'];
    const date = dayjs().format('YYYY-MM-DD');
    return `${date} 星期 ${week[datas]}`;
}
function getYMD() {
    return dayjs().format('YYYY年MM月DD日');
}

// 点击查看获取播放地址
function handleRow(row) {
    if (row.stType) {
        getRadarImage({
            dataSource: 1,
            stCode: row.wmstCode
        }).then(res => {
            if (res.success) {
                if (res.data.length) {
                    let temp = res.data.map(item => item.captureUrl);

                    imgsrcList.value = temp;
                    imgUrl.value = temp[0];
                    imgDialogVisible.value = true;
                } else {
                    ElMessage({
                        message: '暂无数据',
                        type: 'warning'
                    });
                }
            }
        });
    } else {
        title.value = index.value == 4 ? row.wmstName : row.stName;
        dialogVisible.value = true;
        getPlayUrl({
            protocol: 'hls',
            dataSource: row.dataSource,
            wmstCode: row.wmstCode
        }).then(res => {
            if (res.success) {
                playUrl.value = res.data;
            }
        });
    }
}

// 视频播放
watch([customDialog, dialogVisible, playUrl], ([dialogRef, vis, url]) => {
    if (vis && url) {
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
                    }
                }
            }
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
});

onMounted(() => {
    getDitch().then(res => {
        if (res.success) {
            ditch.value = res.data;
        }
    });
    li1 = echarts.init(chart3.value);
    li2 = echarts.init(chart4.value);
    // sWChart = echarts.init(sw_chart.value);
    // area = echarts.init(areaRain.value);
    if (localStorage.getItem('Index') != undefined && localStorage.getItem('Index') != null) {
        index.value = Number(localStorage.getItem('Index'));
        type.value = localStorage.getItem('Type');
        moniItem.value = localStorage.getItem('MoniItem');
    }

    // console.log(index.value, type.value);
    // if (index.value == 4) {
    //     prop.value = 'wmstName';
    // } else {
    //     prop.value = 'stName';
    // }
    getSiteList();

    // handleSelect(index.value,type.value)
    reservoirInfo();
    waterStatistics();
    getSkTime();
    const timer1 = setInterval(() => {
        if (window.location.pathname === '/wygq/digitization') {
            nextTick(() => {
                reservoirInfo();
                getSkTime();
            });
        }
    }, time * 60 * 1000);
    window.addEventListener('resize', () => {
        if (window.location.pathname === '/wygq/digitization') {
            if (bar) {
                bar.dispose();
                waterStatistics();
            }
        }
    });
    getTopTotal().then(res => {
        if (res.success) {
            totalTop.value = res.data;
        }
    });
    // 供水对比
    getWaterUseSupplyContrast().then(res => {
        if (res.success) {
            const result = res.data;
            statice_total.value = res.data;
            const bar = echarts.init(chart2.value);
            bar.setOption({
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    x: 'center',
                    y: 'bottom'
                },
                grid: {
                    top: '8%',
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    show: false,
                    boundaryGap: true
                },
                yAxis: {
                    type: 'category',
                    data: ['生态', '农业', '城镇', '发电']
                },
                series: [
                    {
                        name: '计划总量',
                        type: 'bar',
                        data: [result.planEcology, result.planIrrigate, result.planTown, result.planElectric],
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                { offset: 0, color: '#188df0' },
                                { offset: 1, color: '#83bff6' }
                            ]),
                            borderRadius: [0, 5, 5, 0]
                        },
                        tooltip: {
                            valueFormatter: function (value) {
                                return value + ' 万m³';
                            }
                        }
                    },
                    {
                        name: '已供总量',
                        type: 'bar',
                        data: [result.ecology, result.irrigate, result.town, result.electric],
                        tooltip: {
                            valueFormatter: function (value) {
                                return value + ' 万m³';
                            }
                        },
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                { offset: 0, color: '#18F0CCFF' },
                                { offset: 1, color: '#83bff6' }
                            ]),
                            borderRadius: [0, 5, 5, 0]
                        }
                    }
                ]
            });
        }
    });
});
onBeforeUnmount(() => {
});
//关注站点信息
const getSiteList = () => {
    if (index.value == 1) {
        sourceType.value = 1;
    } else if (index.value == 8) {
        sourceType.value = 0;
    } else {
        sourceType.value = '';
    }
    let par = {};
    if (type.value == 'ZZ') {
        par = { moniItem: moniItem.value, stType: type.value, sourceType: sourceType.value, stName: input.value };
    } else {
        par = {
            stType: type.value,
            sourceType: sourceType.value,
            stName: input.value
        };
    }

    getSite(par).then(res => {
        if (res.success) {
            height.value = `${tableRef.value.clientHeight}px`;
            if (index.value == 1 || index.value == 8) {
                tableData.value = res.data.pptnStatisticsList;
            } else if (index.value == 2) {
                tableData.value = res.data.rsvrRList;
            } else if (index.value == 3) {
                tableData.value = res.data.wagaList;
            } else if (index.value == 4) {
                tableData.value = res.data.wmstList;
            } else if (index.value == 5) {
                tableData.value = res.data.riverRList;
            } else if (index.value == 6 || index.value == 10) {
                tableData.value = res.data.zzRiverRList;
            } else if (index.value == 7) {
                tableData.value = res.data.awqmdDList;
            } else if (index.value == 9) {
                tableData.value = res.data.areaRainfallList;
            }
            // else if(index.value === 8){
            //   tableData.value = res.data.pptnList;
            // }
        }
    });
};

const columnWidth = () => {
    if (index.value == 1 || index.value === 8) {
        return 120;
    } else if (index.value == 2) {
        return 220;
    } else if (index.value == 3) {
        return 180;
    } else if (index.value == 4) {
        return 220;
    } else if (index.value === 5) {
        return 240;
    } else if (index.value === 6) {
        return 220;
    } else if (index.value === 7) {
        return 130;
    } else if(index.value === 10){
        return 220;
    }
};

//实际用水
const waterStatistics = () => {
    getActualWaterUseStatistics().then(res => {
        if (res.success) {
            ysSys.value = {
                irrigate: res.data.irrigate, // 农业
                ecology: res.data.ecology, // 生态
                electric: res.data.electric, // 发电
                flood: res.data.flood, // 泄洪
                town: res.data.town, //城镇
                total: res.data.total
            };
            const xAxis = res.data.waterUseList.map(r => r.month.split('-')[1]);
            const mergedData = {};
            const series = [];
            res.data.waterUseList.forEach(arr => {
                const keys = Object.keys(arr);
                keys.forEach(key => {
                    mergedData[key] = mergedData[key] || [];
                    mergedData[key].push(arr[key]);
                });
            });
            delete mergedData.applyTime;
            for (const key in mergedData) {
                if (key === 'townTotal') {
                    series.push({
                        name: '城镇用水',
                        data: mergedData[key],
                        type: 'bar',
                        barWidth: 15,
                        stack: 'total',
                        itemStyle: {
                            color: '#2C9BFD'
                        }
                    });
                } else if (key === 'electricTotal') {
                    series.push({
                        name: '发电用水',
                        data: mergedData[key],
                        type: 'bar',
                        barWidth: 15,
                        stack: 'total',
                        itemStyle: {
                            color: '#FC7F00'
                        }
                    });
                } else if (key === 'floodTotal') {
                    series.push({
                        name: '泄洪水量',
                        data: mergedData[key],
                        type: 'bar',
                        barWidth: 15,
                        stack: 'total',
                        itemStyle: {
                            color: '#FF6347'
                        }
                    });
                } else if (key === 'ecologyTotal') {
                    series.push({
                        name: '生态用水',
                        data: mergedData[key],
                        type: 'bar',
                        barWidth: 15,
                        stack: 'total',
                        itemStyle: {
                            color: '#57C777'
                        }
                    });
                } else if (key === 'irrigateTotal') {
                    series.push({
                        name: '农业用水',
                        data: mergedData[key],
                        type: 'bar',
                        barWidth: 15,
                        stack: 'total',
                        itemStyle: {
                            color: '#EEB422'
                        }
                    });
                }
            }
            bar = echarts.init(chart1.value);
            bar.setOption(
                {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        order: 'valueAsc'
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        top: '18%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: xAxis.map(r => `${r.replace(/^0/g, '')}月`)
                    },
                    yAxis: {
                        type: 'value',
                        name: '万m³',
                        nameTextStyle: {
                            color: '#aaa',
                            nameLocation: 'start'
                        }
                    },
                    series: series
                },
                true
            );
        }
    });
};

// 水库信息
const reservoirInfo = () => {
    getSk().then(res => {
        if (res.success) {
            res.data.forEach(r => {
                if (r.resCode == '42022220001') {
                    // 王英
                    wy.value = r;
                } else if (r.resCode == '42022230001') {
                    cx.value = r;
                }
            });
            li1.setOption(
                {
                    series: [
                        {
                            type: 'liquidFill',
                            direction: 'left',
                            data: [
                                {
                                    value: (wy.value.rz / 70).toFixed(1),
                                    itemStyle: {
                                        normal: {
                                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                                {
                                                    offset: 0,
                                                    color: 'rgba(69, 191, 247, 1)'
                                                },
                                                {
                                                    offset: 1,
                                                    color: 'rgba(44, 155, 253, 1)'
                                                }
                                            ])
                                        }
                                    }
                                }
                            ],
                            radius: '76%',
                            center: ['51%', '60.5%'],
                            itemStyle: {
                                // 设置默认样式和强调样式颜色相同
                                shadowBlur: 0
                            },
                            waveLength: '100%',
                            outline: {
                                show: false
                            },
                            label: {
                                show: false
                            },
                            shape: 'path://M1,16.0788674 C27.2273861,1.52252535 50.2273861,-3.04185782 70,2.3857179 C91.3382611,8.7533117 107.018986,13.3176949 117.042176,16.0788674 C136.411565,21.1884304 158.064173,22.4658211 182,19.9110396 C181.906446,19.8357284 179.494145,69.2756611 174.763098,168.230838 L110.719241,168.230838 C69.3285982,165.891596 38.1943974,147.788067 17.3166384,113.92025 C3.49794039,94.1397514 -1.9409391,61.5259573 1,16.0788674 Z'
                        }
                    ]
                },
                true
            );
            li2.setOption(
                {
                    series: [
                        {
                            type: 'liquidFill',
                            direction: 'left',
                            data: [
                                {
                                    value: (cx.value.rz / 80).toFixed(1),
                                    itemStyle: {
                                        normal: {
                                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                                {
                                                    offset: 0,
                                                    color: 'rgba(69, 191, 247, 1)'
                                                },
                                                {
                                                    offset: 1,
                                                    color: 'rgba(44, 155, 253, 1)'
                                                }
                                            ])
                                        }
                                    }
                                }
                            ],
                            waveLength: '100%',
                            radius: '76%',
                            center: ['51%', '60.5%'],
                            itemStyle: {
                                // 设置默认样式和强调样式颜色相同
                                shadowBlur: 0
                            },
                            outline: {
                                show: false
                            },
                            label: {
                                show: false
                            },
                            shape: 'path://M1,16.0788674 C27.2273861,1.52252535 50.2273861,-3.04185782 70,2.3857179 C91.3382611,8.7533117 107.018986,13.3176949 117.042176,16.0788674 C136.411565,21.1884304 158.064173,22.4658211 182,19.9110396 C181.906446,19.8357284 179.494145,69.2756611 174.763098,168.230838 L110.719241,168.230838 C69.3285982,165.891596 38.1943974,147.788067 17.3166384,113.92025 C3.49794039,94.1397514 -1.9409391,61.5259573 1,16.0788674 Z'
                        }
                    ]
                },
                true
            );
        }
    });
};

//关注切换
const handleClick = row => {
    if (row.isFollow) {
        unFollow({
            stCode: row.stCode || row.wmstCode,
            stType: type.value == 'PPS' ? 'PP' : type.value,
            userId: userStore.userId
        }).then(res => {
            if (res.success) {
                ElMessage({
                    message: '修改成功',
                    type: 'success'
                });
                getSiteList();
            }
        });
    } else {
        addFollow({
            stCode: row.stCode || row.wmstCode,
            stType: type.value == 'PPS' ? 'PP' : type.value,
            userId: userStore.userId
        }).then(res => {
            if (res.success) {
                ElMessage({
                    message: '关注成功',
                    type: 'success'
                });
                getSiteList();
            }
        });
    }
};

//实时数据
const getSkTime = () => {
    getRealTimeSk().then(res => {
        if (res.success) {
            realTime.value = res.data;
            time1.value = realTime.value.cxRealData.tm;
        }
    });
    // 当前水位
    getSkRealTime().then(res => {
        if (res.success) {
            const data = res.data[1]?.waterLevelList.filter(r => r.tm.endsWith('00'));
            const tm = data.map(r => r.tm.split(' ')[0]);
            const tms = tm.map(r => r.substr(6, 5));
            const result = res.data.map(r => {
                return {
                    ...r,
                    waterLevelList: r.waterLevelList.filter(r => r.tm.endsWith('00'))
                };
            });
            const series = [];
            result.forEach(r => {
                series.push({
                    name: r.resName,
                    data: r.waterLevelList.map(c => r.rz),
                    type: 'bar',
                    barMaxWidth: 15,
                    tooltip: {
                        valueFormatter: function (value) {
                            return value + ' m';
                        }
                    }
                });
            });
            // sWChart.setOption({
            //   grid: {
            //     left: '2%',
            //     right: '2%',
            //     bottom: '14%',
            //     top: '2%',
            //   },
            //   tooltip: {
            //     trigger: 'axis',
            //     axisPointer: {
            //       type: 'shadow'
            //     },
            //     // 相对位置
            //     position: 'bottom'
            //   },
            //   xAxis: {
            //     type: 'category',
            //     data: tms,
            //   },
            //   yAxis: {
            //     type: 'value',
            //     show:false,
            //     axisTick:{
            //       show:false
            //     },
            //     splitLine:{show:false},
            //     axisLine:{
            //       show:false
            //     }
            //   },
            //   series: series
            // },true);
        }
    }),
        //面雨量
        getResRain().then(res => {
            if (res.success) {
                const xAxis = res.data.map(r => `${r.month.split('-')[1]}月`).reverse();
                // area.setOption({
                //   grid: {
                //     left: '2%',
                //     right: '5%',
                //     bottom: '15%',
                //     top: '4%',
                //   },
                //   xAxis: {
                //     type: 'category',
                //     boundaryGap: false,
                //     data: xAxis
                //   },
                //   tooltip: {
                //     trigger: 'axis'
                //   },
                //   yAxis: {
                //     type: 'value',
                //     show:false,
                //     axisTick:{
                //       show:false
                //     },
                //     splitLine:{show:false},
                //     axisLine:{
                //       show:false
                //     }
                //   },
                //   series: [
                //     {
                //       data:  res.data.reverse().map(r=>r.rainfall),
                //       type: 'line',
                //       name:'面雨量',
                //       showSymbol: false,
                //       smooth: true,
                //       areaStyle: {
                //         opacity: 0.8,
                //         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                //           {
                //             offset: 0.,
                //             color: 'rgba(51, 196, 255, 0.30)'
                //           },
                //           {
                //             offset: 1,
                //             color: 'rgba(23, 145, 255, 0)'
                //           }
                //         ])
                //       },
                //       tooltip: {
                //         valueFormatter: function (value) {
                //           return value + ' mm';
                //         }
                //       },
                //       lineStyle:{
                //         color:'rgba(23, 145, 255, 1)'
                //       }
                //     }
                //   ]
                // },true);
            }
        });
};
</script>

<style lang="scss">
.custoe-dialog {
    .el-dialog__body {
        padding: 0;
    }
}
</style>
<style scoped lang="scss">
li {
    list-style-type: none;
}
#mv {
    height: 500px;
}

.container {
    display: flex;
    flex-direction: column;
    padding: 20px;
    height: 100%;
    .wrapper {
        display: flex;
        flex: 1;
        h3 {
            color: #22283f;
            font-size: 18px;
            margin-top: 0;
            margin-bottom: 7px;
        }
        .lf {
            display: flex;
            flex-direction: column;
            flex: 1;
            margin-right: 10px;
            .top {
                display: flex;
                flex-direction: column;
                flex: 1;
                // padding: 20px  15px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.5);
                .box1 {
                    display: flex;
                    flex: 1;
                    margin-bottom: 10px;
                    li:nth-child(1) {
                        flex: 0.35;
                        background: url('@/assets/images/welo.png') no-repeat center center;
                        background-size: cover;
                        h3 {
                            font-size: 20px;
                            font-family: Source Han Sans CN-Regular, Source Han Sans CN;
                            font-weight: 400;
                            color: #ffffff;
                            margin-top: 25px;
                            margin-left: 15px;
                            margin-bottom: 20px;
                        }
                        span {
                            font-size: 14px;
                            font-family: Source Han Sans CN-Regular, Source Han Sans CN;
                            font-weight: 400;
                            color: #ffffff;
                            margin-left: 15px;
                        }
                    }
                    li:nth-child(2) {
                        display: flex;
                        flex-direction: column;
                        flex: 0.65;
                        margin-left: 10px;
                        background: #fff;
                        padding: 0 10px;
                        .item-box {
                            display: flex;
                            flex: 1;
                            .item {
                                flex: 1;
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                text-align: center;
                                .title {
                                    font-size: 14px;
                                    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
                                    font-weight: 400;
                                    color: #22283f;
                                    margin-bottom: 10px;
                                    i {
                                        display: inline-block;
                                        width: 18px;
                                        height: 18px;
                                        vertical-align: sub;
                                    }
                                    span {
                                        margin-left: 5px;
                                    }
                                }
                                .txt {
                                    cursor: pointer;
                                    span:nth-child(1) {
                                        color: #1890ff;
                                        font-weight: bold;
                                        font-size: 16px;
                                    }
                                    span:nth-child(2) {
                                        font-size: 14px;
                                        font-weight: 400;
                                        color: #999999;
                                        margin-left: 5px;
                                    }
                                }
                            }
                            .xcxj {
                                background: url('@/assets/images/xuncha.png') no-repeat center center;
                                background-size: cover;
                            }
                            .yssb {
                                background: url('@/assets/images/yongshui.png') no-repeat center center;
                                background-size: cover;
                            }
                            .whyh {
                                background: url('@/assets/images/weihu.png') no-repeat center center;
                                background-size: cover;
                            }
                            .spyj {
                                background: url('@/assets/images/shipinyj.png') no-repeat center center;
                                background-size: cover;
                            }
                            .ylgj {
                                background: url('@/assets/images/yuliangyj.png') no-repeat center center;
                                background-size: cover;
                            }
                            .swgj {
                                background: url('@/assets/images/shuiweigj.png') no-repeat center center;
                                background-size: cover;
                            }
                            .skxx {
                                background: url('@/assets/images/skxunxian.png') no-repeat center center;
                                background-size: cover;
                            }
                        }
                    }
                }
                .box2 {
                    display: flex;
                    flex: 0.5;
                    margin-bottom: 10px;
                    li {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex: 1;
                        background: #fff;
                        margin: 0 5px;
                        &:first-child {
                            margin-left: 0;
                        }
                        &:last-child {
                            margin-right: 0;
                        }
                        .b_1 {
                            font-size: 14px;
                            font-weight: bold;
                            color: #22283f;
                            margin: 0 15px;
                        }
                        .bm_r {
                            display: flex;
                            flex-direction: column;
                            .b_2 {
                                font-size: 14px;
                                font-weight: 400;
                                color: #999999;
                                margin-left: 15px;
                                strong {
                                    color: #22283f;
                                    font-size: 16px;
                                }
                            }
                            .b_2:nth-child(1) {
                                margin-bottom: 7px;
                            }
                        }
                    }
                    i {
                        display: inline-block;
                        height: 40px;
                        width: 40px;
                    }
                    .zgq {
                        background: url('@/assets/images/zgq.png') no-repeat center center;
                        background-size: cover;
                    }
                    .gq {
                        background: url('@/assets/images/gq.png') no-repeat center center;
                        background-size: cover;
                    }
                    .zq {
                        background: url('@/assets/images/zq.png') no-repeat center center;
                        background-size: cover;
                    }
                }
                .box3 {
                    display: flex;
                    flex: 0.5;
                    li {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex: 1;
                        background: #fff;
                        margin: 0 5px;
                        &:first-child {
                            margin-left: 0;
                        }
                        &:last-child {
                            margin-right: 0;
                        }
                        .b_1 {
                            font-size: 14px;
                            font-weight: bold;
                            color: #22283f;
                            margin: 0 15px;
                        }
                        strong {
                            color: #22283f;
                            font-size: 16px;
                            span {
                                color: #999999;
                                font-size: 14px;
                            }
                        }
                    }
                    i {
                        display: inline-block;
                        height: 40px;
                        width: 40px;
                        border-radius: 50px;
                    }
                    .jzz {
                        background: url('@/assets/images/jzz.png') no-repeat center center;
                        background-size: cover;
                    }
                    .fsz {
                        background: url('@/assets/images/fsz.png') no-repeat center center;
                        background-size: cover;
                    }
                    .xhz {
                        background: url('@/assets/images/xhz.png') no-repeat center center;
                        background-size: cover;
                    }
                    .dm {
                        background: url('@/assets/images/dm.png') no-repeat center center;
                        background-size: cover;
                    }
                    .hd {
                        background: url('@/assets/images/hd.png') no-repeat center center;
                        background-size: cover;
                    }
                    .sd {
                        background: url('@/assets/images/sd.png') no-repeat center center;
                        background-size: cover;
                    }
                }
            }
            .bottom {
                display: flex;
                flex: 1;
                margin-top: 10px;
                h3 {
                    font-weight: bold;
                    color: #22283f;
                }
                li:first-child {
                    display: flex;
                    flex-direction: column;
                    width: 312px;
                    border-radius: 6px;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.5);
                    .box {
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                        background: #ffffff;
                        border-radius: 4px;
                        padding: 10px;
                        .head-sub-title:after {
                            content: '';
                            left: 5px;
                        }
                        .image {
                            flex: 1;
                        }
                        .wy {
                        }
                        .cx {
                            //background: url("@/assets/images/sw_chart.png") no-repeat center center;
                            //background-size: cover;
                        }
                        .content {
                            display: flex;
                            flex: 1;
                            .are_txt {
                                display: flex;
                                flex-direction: column;
                                justify-content: center;
                                align-items: center;
                                flex: 1;
                            }
                        }
                    }
                }
                li:last-child {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    width: 0;
                    border-radius: 6px;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.5);
                    // margin-left: 10px;
                    .follow {
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                        background: #ffffff;
                        border-radius: 4px;
                        padding: 15px;
                        .tabs {
                            display: flex;
                            justify-content: space-around;
                            margin-bottom: 8px;
                            .tab {
                                padding: 3px 9px;
                                margin-right: 10px;
                                border-radius: 15px;
                                color: #22283f;
                                cursor: pointer;
                            }
                            .is-active {
                                background: #e7f4ff;
                                font-weight: bold;
                                color: #22283f;
                            }
                        }
                        .tableBox {
                            flex: 1;
                        }
                    }
                }
            }
        }
        .rg {
            display: flex;
            flex-direction: column;
            width: 858px;
            .statistics {
                display: flex;
                flex-direction: column;
                flex: 1;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 6px;
                padding: 10px;
                margin-top: 10px;
                h3 {
                    font-weight: bold;
                    color: #22283f;
                }
                .item-box {
                    display: flex;
                    flex: 1;
                    .item {
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                        background: #ffffff;
                        border-radius: 6px;
                        &:first-child {
                            margin-right: 10px;
                        }
                        .title {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 10px;
                            span {
                                font-size: 14px;
                                margin-left: 4px;
                                font-weight: bold;
                                color: #22283f;
                            }
                            span.head-sub-title:after {
                                content: '';
                                left: 5px;
                            }
                            strong {
                                color: #505a6e;
                            }
                        }
                        .chart-box {
                            display: flex;
                            flex-direction: column;
                            flex: 1;
                            .statice_total {
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 0;
                                li {
                                    display: flex;
                                    flex-direction: column;
                                    strong {
                                        font-size: 18px;
                                    }
                                    i {
                                        font-size: 13px;
                                        font-style: normal;
                                        color: #22283f;
                                    }
                                }
                            }
                            .chartS {
                                flex: 1;
                            }
                        }
                    }
                }
            }
        }
    }
}
.sp_wt {
    display: block;
    border-radius: 5px;
    color: #fff;
    width: 90%;
    height: 24px;
    line-height: 25px;
    margin: auto;
}

.sp_alarm {
    display: block;
    border-radius: 5px;
    width: 90%;
    height: 24px;
    line-height: 25px;
    margin: auto;
}
.maps {
    height: 400px;
    background: rgba(255, 255, 255, 0.5);
    padding: 10px;
    box-sizing: border-box;
    border-radius: 6px;
    h3 {
        font-weight: bold;
        color: #22283f;
        font-size: 18px;
        margin-top: 0;
        margin-bottom: 7px;
    }
    .mapImg {
        height: 352px;
        position: relative;
    }
    .mapPoints {
        position: absolute;
        // bottom: 30px;
        // right: 220px;
        z-index: 999;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100px;
        .ponitText {
            background: url('@/assets/images/digitDial.png') no-repeat;
            background-size: 100% 100%;
            color: #fff;
            width: auto;
            // height: 30px;
            // line-height: 30px;
            text-align: center;
            // padding: 0 10px;
            font-size: 12px;
        }
        .point {
            width: 40px;
            height: 85px;
            background: url('@/assets/images/digitPoint.png') no-repeat;
            background-size: 100%;
        }
    }
}
.info {
    display: flex;
    flex-direction: column;
    height: 400px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 6px;
    padding: 10px;
    h3 {
        font-weight: bold;
        color: #22283f;
    }
    .info-box {
        display: flex;
        flex: 1;
        li {
            display: flex;
            flex-direction: column;
            flex: 1;
            background: #ffffff;
            border-radius: 6px;
            h5 {
                position: relative;
                font-weight: bold;
                color: #22283f;
                font-size: 14px;
                margin-bottom: 10px;
                padding-left: 20px;
                margin-top: 14px;
            }
            h5.head-sub-title:after {
                content: '';
                left: 11px;
                margin-top: 1px;
            }
            .tabs {
                display: flex;
                justify-content: space-around;
                background: #f6f9fe;
                border-radius: 4px;
                padding: 6px 0px;
                margin: 0 15px;
                span {
                    color: #22283f;
                    font-size: 14px;
                    strong {
                        color: #22283f;
                    }
                }
            }
            .chartQ {
                display: flex;
                flex: 1;
                .charts {
                    position: relative;
                    .line-a {
                        position: absolute;
                        top: 12%;
                        left: 50%;
                        transform: translateX(-50%);
                        height: 1px;
                        line-height: 0px;
                        width: 77%;
                        text-align: center;
                        border-top: 1px dashed #de4841;
                        span {
                            color: #de4841;
                            font-size: 14px;
                            font-weight: bold;
                            background: #fff;
                            padding: 0 5px;
                            vertical-align: text-top;
                        }
                    }
                    .line-b {
                        position: absolute;
                        top: 18%;
                        left: 50%;
                        transform: translateX(-50%);
                        height: 1px;
                        line-height: 0px;
                        width: 77%;
                        text-align: center;
                        border-top: 1px dashed #fc7f00;
                        span {
                            color: #fc7f00;
                            font-size: 14px;
                            font-weight: bold;
                            background: #fff;
                            padding: 0 5px;
                            vertical-align: text-top;
                        }
                    }
                    .line-c {
                        position: absolute;
                        top: 32%;
                        left: 50%;
                        transform: translateX(-50%);
                        height: 1px;
                        line-height: 0px;
                        width: 77%;
                        text-align: center;
                        border-top: 1px dashed #1791ff;
                        z-index: 10;
                        span {
                            color: #1791ff;
                            font-size: 14px;
                            font-weight: bold;
                            background: #fff;
                            padding: 0 5px;
                            vertical-align: text-top;
                            border-radius: 20px;
                        }
                    }
                    .line-d {
                        position: absolute;
                        top: 38%;
                        left: 50%;
                        transform: translateX(-50%);
                        height: 1px;
                        line-height: 0px;
                        width: 77%;
                        text-align: center;
                        border-top: 1px dashed #6bb2f3;
                        z-index: 10;
                        span {
                            color: #6bb2f3;
                            font-size: 18px;
                            font-weight: bold;
                            background: #e3f7ff;
                            padding: 0px 5px;
                            vertical-align: text-top;
                            border-radius: 20px;
                            margin-top: -6px;
                            display: inline-block;
                            width: auto;
                            height: 18px;
                            line-height: 18px;
                        }
                    }
                    .line-e {
                        position: absolute;
                        top: 57%;
                        left: 50%;
                        transform: translateX(-50%);
                        height: 1px;
                        line-height: 0px;
                        width: 77%;
                        text-align: center;
                        border-top: 1px dashed #fff;
                        z-index: 10;
                        span {
                            color: #fff;
                            font-size: 14px;
                            font-weight: bold;
                            background: rgba(69, 191, 247, 1);
                            padding: 0 5px;
                            vertical-align: text-top;
                            border-radius: 20px;
                        }
                    }
                    .line-f {
                        position: absolute;
                        top: 24%;
                        left: 50%;
                        transform: translateX(-50%);
                        height: 1px;
                        line-height: 0px;
                        width: 77%;
                        text-align: center;
                        border-top: 1px dashed #00ff2a;
                        z-index: 10;
                        span {
                            color: #00ff2a;
                            font-size: 14px;
                            font-weight: bold;
                            background: #fff;
                            padding: 0 5px;
                            vertical-align: text-top;
                            //border-radius: 20px;
                        }
                    }
                }
                .line-box {
                    flex: 1;
                    .total-box {
                        position: relative;
                        top: 50%;
                        transform: translateY(-50%);
                        height: 83%;
                        &:before {
                            content: '';
                            position: absolute;
                            top: 4%;
                            height: 1px;
                            border-top: 1px solid #eee;
                            width: 100%;
                        }
                        &:after {
                            content: '';
                            position: absolute;
                            bottom: 0;
                            width: 100%;
                            border-bottom: 1px solid #eee;
                        }
                        .lien-ol {
                            position: absolute;
                            right: 13%;
                            top: 52%;
                            transform: translateY(-50%);
                            width: 1px;
                            height: 96%;
                            background: #eeeeee;
                        }
                        .total {
                            position: absolute;
                            right: 5%;
                            top: 50%;
                            transform: translateY(-50%);
                            text-align: center;
                            background: #eeeeee;
                            border-radius: 10px;
                            color: #666666;
                            width: 24px;
                            line-height: 15px;
                            font-weight: bold;
                            font-size: 14px;
                            padding: 5px 5px;
                            writing-mode: horizontal-tb;
                        }
                        .total-tr {
                            position: absolute;
                            top: 5%;
                            text-align: center;
                            width: 60%;
                            div {
                                font-size: 14px;
                                font-weight: 400;
                                color: #22283f;
                            }
                        }
                        .total-xl {
                            position: absolute;
                            top: 24%;
                            padding: 21px 0px;
                            text-align: center;
                            width: 60%;
                            border-top: 1px solid #eee;
                            border-bottom: 1px solid #eee;
                            div {
                                font-size: 14px;
                                font-weight: 400;
                                color: #22283f;
                            }
                        }
                        .total-s {
                            position: absolute;
                            bottom: 10%;
                            text-align: center;
                            width: 60%;
                            div {
                                font-size: 14px;
                                font-weight: 400;
                                color: #22283f;
                            }
                        }
                    }
                }
                .charts:after {
                    content: '';
                    display: block;
                    width: 35px;
                    height: 100%;
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    background: url('../../assets/images/dam.png') no-repeat center center;
                    background-size: contain;
                }
                .charts:before {
                    content: '';
                    display: block;
                    width: 1px;
                    height: 88%;
                    position: absolute;
                    left: 10%;
                    top: 5%;
                    border-left: 1px solid #eeeeee;
                }
            }
        }
        li:first-child {
            margin-right: 10px;
        }
    }
}
</style>
