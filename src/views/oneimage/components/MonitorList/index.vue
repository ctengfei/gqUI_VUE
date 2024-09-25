<template>
    <div class="tips" @click="show">
        <i></i>
        <span>数据列表</span>
    </div>
    <div class="monitor-list" v-if="GqOneImageStore.checkboxs.length > 0" :style="{ right: lef + '%' }">
        <div class="head">
            <h4>数据列表</h4>
            <el-button type="primary" plain @click="hide" circle style="width: 25px; height: 25px; border: 0; align-self: center">
                <ArrowRightBold style="width: 1em; height: 1em" />
            </el-button>
        </div>
        <div class="head_online" v-if="select != 'VD' && select != 'WAGA'">
            <div class="left">
                <div class="onLine-left">
                    <img src="@/assets/imgs/onLine.png" />
                </div>
                <div class="onLine">
                    <span style="margin-top: 15px; line-height: 15px">在线个数</span>
                    <span class="num">{{ stOnlineNum }}</span>
                </div>
            </div>
            <div class="right">
                <div class="onLine-left">
                    <img src="@/assets/imgs/offLine.png" />
                </div>
                <div class="onLine">
                    <span style="margin-top: 15px; line-height: 15px">离线个数</span>
                    <span class="num">{{ stTotal - stOnlineNum }}</span>
                </div>
            </div>
            <!-- <span>总个数：{{stTotal}}  </span>
       <span>在线个数：{{stOnlineNum}}</span> -->
        </div>
        <el-input class="search" clearable v-model="input" placeholder="请输入站点名称">
            <template #append>
                <el-button type="primary" @click="handleSearch" style="background: #409eff">
                    <el-icon :size="16" style="color: #ffff">
                        <Search />
                    </el-icon>
                </el-button>
            </template>
        </el-input>
        <div style="display: flex; justify-content: center" v-if="select == 'QQ'">
            <el-radio-group v-model="radio">
                <el-radio-button label="1">垂直位移</el-radio-button>
                <el-radio-button label="3">水平位移</el-radio-button>
                <el-radio-button label="2">渗流压力水位</el-radio-button>
            </el-radio-group>
        </div>
        <div class="mask-box">
            <li v-for="item in GqOneImageStore.checkboxs" :key="item" @click="handleClick(item.split('-')[0])" :style="{ background: select == item.split('-')[0] ? 'linear-gradient( 180deg, #5DC4FF 0%, #409EFF 100%)' : '#fff' }">
                <i :class="select == item.split('-')[0] ? `${item.split('-')[2]}-white` : `${item.split('-')[2]}-blue`"></i>
                <span :class="{ active: select == item.split('-')[0] }">{{ item.split('-')[1] }}</span>
            </li>
        </div>
        <div :class="{ selectStyle: select == 'VD' || select == 'WAGA', TableStyle: select != 'VD' && select != 'WAGA' }">
            <el-table :data="tableData" align="center" @row-click="rowClick" height="100%" style="width: 100%">
                <el-table-column align="center" v-if="select != 'QQ' && select != 'WAGA'" :prop="select == 'VD' ? 'wmstName' : 'stName'" :label="labelFormat('站点-名称')" />
                <el-table-column align="center" prop="oneHourDrp" label="1h" v-if="select == 'PPS'"></el-table-column>
                <el-table-column align="center" prop="oneDayDrp" label="24h" v-if="select == 'PPS'"></el-table-column>
                <el-table-column align="center" label="今日(mm)" width="90" prop="toDayDrp" v-if="select == 'PPS'"></el-table-column>
                <el-table-column align="center" label="本月(mm)" width="90" prop="monthDrp" v-if="select == 'PPS'"></el-table-column>
                <el-table-column align="center" label="本年(mm)" width="90" prop="yearDrp" v-if="select == 'PPS'"></el-table-column>
                <el-table-column align="center" v-if="select == 'RR'" prop="rz" label="库上水位(m)">
                    <template #default="{ row }">
                        <span style="font-weight: bold">
                            <el-icon v-if="row.zup" style="color: #d93025; font-weight: bold; font-size: 23px; vertical-align: bottom"><Top /></el-icon>
                            <el-icon v-else style="color: #3f8952ff; font-weight: bold; font-size: 23px; vertical-align: bottom"><Bottom /></el-icon>
                            {{ row.rz }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column align="center" v-if="select == 'RR'" prop="fsltdz" label="控制水位(m)"></el-table-column>
                <el-table-column align="center" v-if="select == 'DD'" prop="upz" label="闸前水位(m)"></el-table-column>
                <el-table-column align="center" v-if="select == 'DD'" prop="tgtq" label="总过闸流量(m³/s)"></el-table-column>
                <el-table-column align="center" v-if="select == 'WQ'" prop="level" label="水质等级">
                    <template #default="{ row }">
                        <span v-if="row.level == 1" class="sp_wt" style="background-color: #c5ffff">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                        <span v-if="row.level == 2" class="sp_wt" style="background-color: #34c3f6">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                        <span v-if="row.level == 3" class="sp_wt" style="background-color: #03ff03">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                        <span v-if="row.level == 4" class="sp_wt" style="background-color: #faff19">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                        <span v-if="row.level == 5" class="sp_wt" style="background-color: #ff9000">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" v-if="select == 'WQ'" prop="wt" label="水温(°)" />
                <el-table-column align="center" v-if="select == 'WQ'" prop="cond" label="电导率(μS/cm)"></el-table-column>
                <el-table-column align="center" v-if="select == 'WQ'" prop="dox" label="溶解氧(mg/L)"></el-table-column>
                <el-table-column align="center" v-if="select == 'WQ'" prop="nh3n" label="氨氮(mg/L)"></el-table-column>
                <el-table-column align="center" v-if="select == 'WQ'" prop="chla" label="叶绿素(μg/L)"></el-table-column>
                <el-table-column align="center" v-if="select == 'WQ'" prop="ph" label="PH(无量纲)"></el-table-column>
                <el-table-column align="center" v-if="select == 'WQ'" prop="tp" label="总磷(mg/L)"></el-table-column>
                <el-table-column align="center" v-if="select == 'WQ'" prop="codmn" label="高锰酸盐指数(mg/L)"></el-table-column>
                <el-table-column align="center" v-if="select == 'ZZ' || select == 'ZQ'" prop="z" label="水位(m)"></el-table-column>
                <el-table-column align="center" v-if="select == 'ZZ' || select == 'ZQ'" prop="q" label="流量(m³/s)"></el-table-column>
                <el-table-column align="center" v-if="select == 'QQ'" prop="stCode" label="站点名称"></el-table-column>
                <el-table-column align="center" v-if="select == 'QQ'" prop="damName" label="大坝名称"></el-table-column>
                <!-- <el-table-column align="center" v-if="select == 'QQ'" prop="resName" label="所属水库"></el-table-column> -->
                <el-table-column align="center" v-if="select == 'QQ' && radio == '1'" prop="vrds" label="垂直位移"></el-table-column>
                <el-table-column align="center" v-if="select == 'QQ' && radio == '2'" prop="temp" label="温度°"></el-table-column>
                <el-table-column align="center" v-if="select == 'QQ' && radio == '2'" prop="z" label="渗流压力水位(m)"></el-table-column>
                <el-table-column align="center" v-if="select == 'QQ' && radio == '3'" prop="x" label="X向水平位移"></el-table-column>
                <el-table-column align="center" v-if="select == 'QQ' && radio == '3'" prop="y" label="Y向水平位移"></el-table-column>
                <el-table-column align="center" v-if="select == 'VD'" prop="status" label="状态">
                    <template #default="{ row }">
                        <el-tag type="success" effect="light" round v-if="row.status == 1">在线</el-tag>
                        <el-tag type="danger" effect="light" round v-else>离线</el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" v-if="select == 'VD'" prop="opt" label="操作">
                    <template #default="{ row }">
                        <el-tag style="cursor: pointer" effect="dark" round @click.stop="handleRow(row)">查看</el-tag>
                    </template>
                </el-table-column>
                <el-table-column width="100" align="center" :formatter="formatCount" v-if="select != 'VD' && select != 'WAGA'" prop="tm" :label="labelFormat('数据-时间')" />
                <el-table-column align="center" v-if="select == 'WAGA'" prop="wagaName" label="水闸名称" />
                <el-table-column align="center" v-if="select == 'WAGA'" label="水闸类型">
                    <template #default="{ row }">
                        <span>{{ formatterVal(row, 'WAGA_TYPE', 'wagaType') }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" v-if="select == 'WAGA'" prop="gaorNum" label="闸孔数量" />
            </el-table>
        </div>
        <el-dialog v-model="dialogVisible" width="50%" :title="title" draggable @close="dialogVisible = false" class="camera-dialog" append-to-body>
            <div id="mv" ref="cameraDialog"></div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { watch } from 'vue';
import useGqOneImageStore from '@/store/modules/oneimage';
import { getDamCzwyMaxTmList, getDamSpgMaxTmList, getDamSpwyMaxTmList, getTimeSite, getStructure } from '@/api/oneimage';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { getPlayUrl } from '@/api/digitization';
import DPlayer from 'dplayer';
import Hls from 'hls.js';
import { formatterVal } from '@/utils';
import { getDamBaseList, getDamStBase, getDb } from '@/api/engineeringMonitoring';
// import {getStructure} from "@/api/oneimage";
let dialogVisible = ref(false);
const DP = ref(null);
const cameraDialog = ref(null);
let playUrl = ref('');
const input = ref('');
let prevInput = ref('');
let title = ref('');
let lef = ref(2);
let radio = ref('1');
let tableData = ref([]);
const activeName = ref(1);
const GqOneImageStore = useGqOneImageStore();
let select = ref(null);
let stTotal = ref(0);
let stOnlineNum = ref(0);
const labelFormat = str => {
    return str.replace('-', '\n');
};

const formatCount = (row, column, cellValue) => {
    return cellValue ? dayjs(cellValue).format('MM-DD HH:ss') : '';
};

watch(
    () => GqOneImageStore.checkboxs,
    (che, oldCHe = []) => {
        if (che.length) {
            select.value = che.slice(-1)[0].split('-')[0];
            if (oldCHe.length > che.length) {
                // 取消选中时
                GqOneImageStore.realtimePoint = GqOneImageStore.realtimePoint.filter(c => che.find(e => e.split('-')[0] == c.t));
            }
        } else {
            // 所有实时站点都没选中时 清空之前状态
            select.value = null;
            GqOneImageStore.getRealtimePoint([]);
        }
    },
    { immediate: true }
);

watch(
    () => GqOneImageStore.conservancy,
    (cos, oldCos = []) => {
        if (cos.length) {
            // console.log(oldCos.length,cos.length)
            if (oldCos.length > cos.length) {
                // 取消选中时
                if (cos.indexOf('WAGA-水闸工程-shuizha') == -1) {
                    // GqOneImageStore.checkboxs.remove('WAGA-水闸工程-shuizha');
                    // console.log(GqOneImageStore.checkboxs,oldCos.indexOf('WAGA-水闸工程-shuizha'))
                    // console.log(oldCos)
                    GqOneImageStore.checkboxs.splice(GqOneImageStore.checkboxs.indexOf('WAGA-水闸工程-shuizha'), 1);
                    // console.log(GqOneImageStore.checkboxs)
                    select.value = GqOneImageStore.checkboxs.slice(-1)[0].split('-')[0];
                    // console.log(select.value)
                }
            } else {
                if (cos.indexOf('WAGA-水闸工程-shuizha') > -1 && cos[cos.length - 1].indexOf('WAGA') > -1) {
                    GqOneImageStore.checkboxs.push('WAGA-水闸工程-shuizha');
                    select.value = cos.slice(-1)[0].split('-')[0];
                    const type = cos.slice(-1)[0].split('-')[0];
                    const icon = cos.slice(-1)[0].split('-')[2];
                    getStructure({ buildingType: type }).then(res => {
                        const data = res.data.wagaList;
                        // console.log(data);
                        tableData.value = data;
                        // console.log(data, 'data1');
                        GqOneImageStore.getConservancyPoint(data.map(r => ({ ...r, icon: icon, t: type })));
                        // GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuizha', t: 'WAGA' })));
                    });
                }

                // console.log(GqOneImageStore.checkboxs)
            }
        }
    },
    { immediate: true }
);

watch(
    () => [select.value, radio.value],
    ([s, r]) => {
        if (select.value) {
            if (select.value == 'WAGA') {
                getStructure({ buildingType: select.value }).then(res => {
                    const data = res.data.wagaList;
                    // console.log(data);
                    tableData.value = data;
                    // console.log(data, 'data1');
                    GqOneImageStore.getConservancyPoint(data.map(r => ({ ...r, icon: 'shuizha', t: 'WAGA' })));
                    // GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuizha', t: 'WAGA' })));
                });
            } else {
                if (s == 'QQ') {
                    input.value = '';
                    GqOneImageStore.realtimePoint = GqOneImageStore.realtimePoint.filter(c => !(s == c.t));
                    if (r == 1) {
                        getDamCzwyMaxTmList().then(res => {
                            if (res.success) {
                                stTotal = res.data.total;
                                stOnlineNum = res.data.onlineNum;
                                tableData.value = res.data.czwyList;
                                const data = res.data.czwyList;
                                if (data.length) {
                                    GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'anj', t: 'QQ' })));
                                }
                            }
                        });
                    } else if (r == 2) {
                        getDamSpgMaxTmList().then(res => {
                            if (res.success) {
                                stTotal = res.data.total;
                                stOnlineNum = res.data.onlineNum;
                                tableData.value = res.data.spgList;
                                const data = res.data.spgList;
                                if (data.length) {
                                    GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'anj', t: 'QQ' })));
                                }
                            }
                        });
                    } else {
                        getDamSpwyMaxTmList().then(res => {
                            if (res.success) {
                                stTotal = res.data.total;
                                stOnlineNum = res.data.onlineNum;
                                tableData.value = res.data.spwyList;
                                const data = res.data.spwyList;
                                if (data.length) {
                                    GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'anj', t: 'QQ' })));
                                }
                            }
                        });
                    }
                } else {
                    if (s == 'RR' || s == 'PPS' || s == 'DD' || s == 'VD' || s == 'WQ' || s == 'ZQ' || s == 'ZZ') {
                        getTimeSite({ stType: s, stName: input.value }).then(res => {
                            if (res.success) {
                                stTotal = res.data.total;
                                stOnlineNum = res.data.onlineNum;
                                if (s == 'RR') {
                                    const data = res.data.rsvrRList;
                                    tableData.value = data;
                                    if (data.length) {
                                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuiweizhan', t: 'RR' })));
                                    }
                                } else if (s == 'PPS') {
                                    const data = res.data.pptnStatisticsList;
                                    tableData.value = data;
                                    if (data.length) {
                                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'yuliangzhan', t: 'PPS' })));
                                    }
                                } else if (s == 'DD') {
                                    const data = res.data.wagaList;
                                    tableData.value = data;
                                    if (data.length) {
                                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuizha', t: 'DD' })));
                                    }
                                } else if (s == 'VD') {
                                    const data = res.data.wmstList;
                                    tableData.value = data;
                                    if (data.length) {
                                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shipindian', t: 'VD' })));
                                    }
                                } else if (s == 'WQ') {
                                    const data = res.data.awqmdDList;
                                    tableData.value = data;
                                    if (data.length) {
                                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuizhizhan', t: 'WQ' })));
                                    }
                                } else if (s == 'ZQ') {
                                    const data = res.data.riverRList;
                                    tableData.value = data;
                                    if (data.length) {
                                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuiweizhan', t: 'ZQ' })));
                                    }
                                } else if (s == 'ZZ') {
                                    const data = res.data.zzRiverRList;
                                    tableData.value = data;
                                    if (data.length) {
                                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuiweizhan', t: 'ZZ' })));
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }
    },
    { immediate: true }
);

function handleSearch() {
    // 重复提交
    if (prevInput.value == input.value) {
        return false;
    }
    prevInput.value = input.value;
    if (select.value == 'QQ') {
        if (radio.value == 1) {
            getDamCzwyMaxTmList({ stCode: input.value }).then(res => {
                if (res.success) {
                    tableData.value = res.data;
                }
            });
        } else if (radio.value == 2) {
            getDamSpgMaxTmList({ stCode: input.value }).then(res => {
                if (res.success) {
                    tableData.value = res.data;
                }
            });
        } else {
            getDamSpwyMaxTmList({ stCode: input.value }).then(res => {
                if (res.success) {
                    tableData.value = res.data;
                }
            });
        }
    } else {
        getTimeSite({ stType: select.value, stName: input.value }).then(res => {
            if (res.success) {
                if (select.value == 'RR') {
                    const data = res.data.rsvrRList;
                    tableData.value = data;
                    if (data.length) {
                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuiweizhan', t: 'RR' })));
                    }
                } else if (select.value == 'PPS') {
                    const data = res.data.pptnStatisticsList;
                    tableData.value = data;
                    if (data.length) {
                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'yuliangzhan', t: 'PPS' })));
                    }
                } else if (select.value == 'DD') {
                    const data = res.data.wagaList;
                    tableData.value = data;
                    if (data.length) {
                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuizha', t: 'DD' })));
                    }
                } else if (select.value == 'VD') {
                    const data = res.data.wmstList;
                    tableData.value = data;
                    if (data.length) {
                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shipindian', t: 'VD' })));
                    }
                } else if (select.value == 'WQ') {
                    const data = res.data.awqmdDList;
                    tableData.value = data;
                    if (data.length) {
                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuizhizhan', t: 'WQ' })));
                    }
                } else if (select.value == 'ZZ') {
                    const data = res.data.zzRiverRList;
                    tableData.value = data;
                    if (data.length) {
                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuiweizhan', t: 'ZZ' })));
                    }
                } else if (select.value == 'ZQ') {
                    const data = res.data.riverRList;
                    tableData.value = data;
                    if (data.length) {
                        GqOneImageStore.getRealtimePoint(data.map(r => ({ ...r, icon: 'shuiweizhan', t: 'ZQ' })));
                    }
                }
            }
        });
    }
}

function rowClick(row) {
    // 定位
    if ((row.stLong || row.wmstLong || row.longitude) && (row.stLat || row.wmstLat || row.latitude)) {
        const map = GqOneImageStore.MapLayer.Map;
        const source = GqOneImageStore.MapLayer.vector;
        const feature = source.getFeatures().find(r => r.getProperties().stcd == (row.stCode || row.wmstCode || row.wagaCode));
        const prop = feature.getProperties();
        if (prop.type == 'QQ' || prop.type == 'WAGA') {
            map.getView().fit(feature.getGeometry(), { duration: 600, maxZoom: 19 });
        } else {
            map.getView().fit(feature.getGeometry(), { duration: 600, maxZoom: 16 });
        }
    } else {
        ElMessage({
            message: '经纬度不正确',
            type: 'warning'
        });
    }
}

function handleRow(row) {
    title.value = row.wmstName;
    getPlayUrl({
        protocol: 'hls',
        dataSource: row.dataSource,
        wmstCode: row.wmstCode
    }).then(res => {
        dialogVisible.value = true;
        playUrl.value = res.data;
    });
}

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

function handleClick(type) {
    select.value = type;
}

function show() {
    lef.value = 2;
}
function hide() {
    lef.value = -100;
}
</script>
<style lang="scss">
.selectStyle {
    height: calc(100% - 121px);
}
.TableStyle {
    height: calc(100% - 186px);
}
.camera-dialog {
    .el-dialog__body {
        padding: 0;
    }
}
</style>
<style scoped lang="scss">
:deep(.el-table) {
    .cell {
        white-space: pre-wrap;
    }
}
// 禁用视频右键菜单
:deep(.dplayer-menu, .dplayer-mask) {
    display: none !important;
}
#mv {
    height: 500px;
}

h4,
h6 {
    margin: 0;
}
li {
    list-style-type: none;
}
.tips {
    position: absolute;
    right: 3%;
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
    i {
        display: block;
        width: 40px;
        height: 40px;
        background: url('../../../../assets/images/dn.png') no-repeat center center;
        background-size: cover;
        margin-bottom: 5px;
    }
    span {
        width: 3px;
        font-size: 16px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #1791ff;
        margin-right: 15px;
    }
}
.monitor-list {
    position: absolute;
    right: 2%;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 10px;
    transition: right 0.8s;
    height: 750px;
    min-height: 750px;
    width: 365px;
    .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 10px;
        margin-bottom: 10px;
        border-bottom: 1px solid #f1f1f1;
        padding: 15px 10px 5px 10px;
        h4 {
            font-size: 18px;
            color: #1791ff;
            font-weight: 600;
            margin-bottom: 0;
        }
    }
    .head_online {
        display: flex;
        justify-content: space-around;
        text-align: left;
        margin-top: 2px;
        margin-bottom: 15px;
        .right {
            width: 150px;
            height: 70px;
            margin: 0 auto;
            text-align: left;
            line-height: 80px;
            background: linear-gradient(135deg, rgba(255, 230, 193, 0.19) 0%, rgba(255, 201, 142, 0.19) 100%);
            border-radius: 4px;
            display: flex;
            justify-content: space-around;
            .onLine {
                display: flex;
                flex-direction: column;
                line-height: 40px;
                width: 80px;
                .num {
                    line-height: 37px;
                    font-family: DINCondensed, DINCondensed;
                    font-weight: bold;
                    font-size: 36px;
                    color: #e97a4c;
                    text-align: left;
                    font-style: normal;
                }
            }
        }
        .left {
            width: 150px;
            height: 70px;
            margin: 0 auto;
            text-align: left;
            line-height: 80px;
            background: linear-gradient(135deg, rgba(228, 244, 255, 0.33) 0%, rgba(196, 229, 255, 0.33) 100%);
            border-radius: 4px;
            display: flex;
            justify-content: space-around;
            .onLine {
                display: flex;
                flex-direction: column;
                line-height: 40px;
                width: 80px;
                .num {
                    line-height: 37px;
                    font-family: DINCondensed, DINCondensed;
                    font-weight: bold;
                    font-size: 36px;
                    color: #1791ff;
                    text-align: left;
                    font-style: normal;
                }
            }
        }
        // span {
        //     display: inline-block;
        //     height: 36px;
        //     padding: 8px;
        //     color: #333333;
        //     //border-radius: 5px;
        // }
        // span:nth-child(1) {
        //     margin-right: 20px;
        // }
    }
    .search {
        margin: 0 auto;
        width: 90%;
        margin-bottom: 15px;
    }
    .mask-box {
        position: absolute;
        height: 100%;
        width: 50px;
        left: -50px;
        overflow-y: auto;
        li {
            position: relative;
            display: flex;
            cursor: pointer;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 50px;
            width: 50px;
            background: #fff;
            margin-bottom: 5px;
            border-radius: 5px;
            i {
                display: inline-block;
                width: 20px;
                height: 20px;
            }
            span {
                font-size: 12px;
                color: #666;
            }
            .active {
                color: #fff;
            }
            .shuiweizhan-white {
                background: url('@/assets/imgs/shuiweizhan-white.png') no-repeat center center;
                background-size: cover;
            }
            .shuiweizhan-blue {
                background: url('@/assets/imgs/shuiweizhan-blue.png') no-repeat center center;
                background-size: cover;
            }
            .yuliangzhan-white {
                background: url('@/assets/imgs/yuliangzhan-white.png') no-repeat center center;
                background-size: cover;
            }
            .yuliangzhan-blue {
                background: url('@/assets/imgs/yuliangzhan-blue.png') no-repeat center center;
                background-size: cover;
            }
            .shuizhazhan-white {
                background: url('@/assets/imgs/shuizhazhan-white.png') no-repeat center center;
                background-size: cover;
            }
            .shuizha-blue {
                background: url('@/assets/imgs/shuizhazhan-blue.png') no-repeat center center;
                background-size: cover;
            }
            .shuizha-white {
                background: url('@/assets/imgs/shuizhazhan-white.png') no-repeat center center;
                background-size: cover;
            }
            .shuizhazhan-blue {
                background: url('@/assets/imgs/shuizhazhan-blue.png') no-repeat center center;
                background-size: cover;
            }
            .shipindian-white {
                background: url('@/assets/imgs/shipindian-white.png') no-repeat center center;
                background-size: cover;
            }
            .shipindian-blue {
                background: url('@/assets/imgs/shipindian-blue.png') no-repeat center center;
                background-size: cover;
            }
            .shuizhizhan-white {
                background: url('@/assets/imgs/shuizhizhan-white.png') no-repeat center center;
                background-size: cover;
            }
            .shuizhizhan-blue {
                background: url('@/assets/imgs/shuizhizhan-blue.png') no-repeat center center;
                background-size: cover;
            }
            .anj-white {
                background: url('@/assets/imgs/anj-white.png') no-repeat center center;
                background-size: cover;
            }
            .anj-blue {
                background: url('@/assets/imgs/anj-blue.png') no-repeat center center;
                background-size: auto;
            }
            &:last-child {
                margin-bottom: 0;
            }
        }
    }
    .demo-tabs {
        padding: 0 10px;
    }
    .mask-box::-webkit-scrollbar {
        display: none;
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
}
</style>
