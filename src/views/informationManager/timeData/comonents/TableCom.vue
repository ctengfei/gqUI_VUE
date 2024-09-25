<template>
    <div>
        <label style="font-weight: 700; color: #606266">站点编码：</label>
        <el-input style="width: 240px; margin-right: 35px" v-model="inputStCode" clearable placeholder="请输入站点编码"></el-input>
        <label style="font-weight: 700; color: #606266">站点名称：</label>
        <el-input style="width: 240px; margin-right: 35px" v-model="input" clearable placeholder="请输入站点名称"></el-input>
        <label style="font-weight: 700; color: #606266">数据来源：</label>
        <el-select v-model="optionsValue" placeholder="请选择数据来源" style="width: 240px; margin-right: 35px">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="getSiteList">搜索</el-button>
        <el-button :icon="Refresh" @click="refresh()">重置</el-button>
        <el-button style="margin-left: 30px" type="success" plain icon="Download" @click="exportData">导出</el-button>
        <label style="right: 45px; margin-top: 20px; position: absolute; color: #606266">共 <strong style="color: #409EFF;">{{ num }}</strong> 个站点</label>
    </div>

    <el-table style="margin-top: 10px" height="750" ref="tableInst" header-cell-class-name="custom-header" :data="tableData">
        <el-table-column align="center" width="120" prop="stCode" sortable label="站点编码"></el-table-column>
        <el-table-column align="center" :width="columnWidth(index)" sortable :prop="prop" v-if="index != 9" label="点位名称">
            <template #default="{ row }">
                <div style="display: flex; align-items: center; justify-content: center">
                    <span style="width: 40px"></span>
                    <el-icon :style="{ color: row.isFollow ? '#FFD700' : '' }" @click="handleClick(row)" size="23"><StarFilled /></el-icon>
                    <span style="margin-left: 10px; width: 160px; text-align: left">{{ row.wmstName || row.stName }}</span>
                </div>
            </template>
        </el-table-column>
        <el-table-column align="center" :width="columnWidth(index)" sortable prop="wshName" label="区域" v-if="index == 9"></el-table-column>
        <el-table-column align="center" prop="p" sortable label="当日面雨量(mm)" v-if="props.index == 9"></el-table-column>
        <el-table-column align="center" prop="p30" sortable label="过去30日面雨量(mm)" v-if="index == 9"></el-table-column>
        <el-table-column align="center" prop="ph30" sortable label="历史同期30日面雨量(mm)" v-if="index == 9"></el-table-column>
        <el-table-column align="center" prop="ratio" sortable label=" 降雨距平百分率" v-if="index == 9"></el-table-column>
        <el-table-column align="center" prop="alarmLevel" sortable label=" 预警级别" v-if="index == 9"></el-table-column>
        <el-table-column align="center" label="1h(mm)" sortable width="100" prop="oneHourDrp" v-if="index == 1 || index == 8"></el-table-column>
        <el-table-column align="center" label="24h(mm)" sortable width="120" prop="oneDayDrp" v-if="index == 1 || index == 8"></el-table-column>
        <el-table-column align="center" label="今日(mm)" sortable width="120" prop="toDayDrp" v-if="index == 1 || index == 8"></el-table-column>
        <el-table-column align="center" label="本月(mm)" sortable width="120" prop="monthDrp" v-if="index == 1 || index == 8"></el-table-column>
        <el-table-column align="center" label="本年(mm)" sortable width="120" prop="yearDrp" v-if="index == 1 || index == 8"></el-table-column>
        <el-table-column align="center" v-if="index == 2" sortable prop="rz" label="库水位(m)">
            <template #default="{ row }">
                <span style="font-weight: bold">
                    <el-icon v-if="row.zup" style="color: #d93025; font-weight: bold; font-size: 23px; vertical-align: bottom"><Top /></el-icon>
                    <el-icon v-else style="color: #3f8952ff; font-weight: bold; font-size: 23px; vertical-align: bottom"><Bottom /></el-icon>
                    {{ row.rz }}
                </span>
            </template>
        </el-table-column>
        <el-table-column align="center" v-if="index == 2" sortable prop="fsltdz" label="控制水位(m)"></el-table-column>
        <el-table-column align="center" v-if="index == 2" sortable prop="w" label="总蓄水量(万m³)"></el-table-column>
        <el-table-column align="center" v-if="index == 2" sortable width="130" prop="validCap" label="有效蓄水量(万m³)"></el-table-column>
        <el-table-column align="center" v-if="index == 2" sortable prop="fullRate" label="蓄满率(%)"></el-table-column>
        <el-table-column align="center" v-if="index == 3" sortable prop="upz" label="水位/水深(m)"></el-table-column>
        <el-table-column align="center" v-if="index == 3" sortable prop="tgtq" label="总过闸流量(m³/s)"></el-table-column>
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
        <el-table-column align="center" v-if="index == 7" sortable prop="wt" label="水温(℃)"></el-table-column>
        <el-table-column align="center" v-if="index == 7" sortable prop="ph" label="PH(无量纲)"></el-table-column>
        <el-table-column align="center" v-if="index == 7" sortable prop="cond" label="电导率(uS/cm)"></el-table-column>
        <el-table-column align="center" v-if="index == 7" sortable prop="tp" label="总磷(mg/L)"></el-table-column>
        <el-table-column align="center" v-if="index == 7" sortable prop="nh3n" label="氨氮(mg/L)"></el-table-column>
        <el-table-column align="center" v-if="index == 7" sortable prop="dox" label="溶解氧(mg/L)"></el-table-column>
        <el-table-column align="center" v-if="index == 7" sortable prop="chla" label="叶绿素(μg/L)"></el-table-column>
        <el-table-column align="center" v-if="index == 7" sortable prop="codmn" label="高锰酸盐指数(mg/L)"></el-table-column>
        <el-table-column align="center" v-if="index == 6 || index == 10" sortable prop="waterDepth" label="水深(m)"></el-table-column>
        <el-table-column align="center" v-if="index == 6" sortable prop="alarmWaterDepth" label="警戒水深(m)">
            <template #default="{ row }">
                {{ formatDepthVal(row.alarmWaterDepth) }}
            </template>
        </el-table-column>
        <el-table-column align="center" v-if="index == 5" prop="z" label="水位(m)"></el-table-column>
        <el-table-column align="center" v-if="index == 6 || index == 5 || index == 10" sortable prop="q" label="流量(m³/s)"></el-table-column>
        <el-table-column align="center" v-if="index == 10" sortable prop="totalQ" label="24小时流量(m³)"></el-table-column>
        <el-table-column align="center" v-if="index == 6 " sortable prop="isAlarm" label="是否超警戒">
            <template #default="{ row }">
                <span v-if="row.isAlarm" style="color: #fd0303" class="sp_alarm">是</span>
                <span v-else-if="formatDepthVal(row.alarmWaterDepth) == '/'">/</span>
                <span v-else class="sp_alarm">否</span>
            </template>
        </el-table-column>
        <el-table-column align="center" v-if="index > 9 && index != 4" :formatter="formatCount" sortable prop="tm" label="数据时间"></el-table-column>
        <el-table-column align="center" v-if="index <= 8 && index != 4" :formatter="formatCount" sortable prop="tm" label="数据时间"></el-table-column>
        <el-table-column align="center" label="操作">
            <template #default="{ row }">
                <!-- <el-icon><Search /></el-icon> -->
                <el-link :icon="Search" :underline="false" type="success" @click="details(row.stCode)">详情</el-link>
                <!-- {{ row.stCode }} -->
            </template>
        </el-table-column>
    </el-table>
</template>
<script setup>
import { Search, Refresh } from '@element-plus/icons-vue';
import useUserStore from '@/store/modules/user';
import { formatterVal } from '@/utils';
import useDictionaryStore from '@/store/modules/dictionary';
import { ref, reactive, onMounted, defineProps, defineEmits } from 'vue';
import { addFollow, unFollow } from '@/api/oneimage';
import { getSite } from '@/api/digitization';
import { ElMessage } from 'element-plus';
const tableData = ref([]);
const moniItem = ref(1);
let sourceType = ref(''); //数据类型 0灌区 1水库
let input = ref('');
let num = ref(0); //站点个数
let inputStCode = ref('');
const props = defineProps(['index', 'type', 'moniItem']);
let type = ref(props.type);
const index = ref(props.index);
const tableInst = ref();
const userStore = useUserStore();
const options = ref([]);
const optionsValue = ref('');
const emit = defineEmits(['ParentDetails']);
const dictStore = useDictionaryStore();
const { proxy } = getCurrentInstance();
const columnWidth = () => {
    if (index.value == 1) {
        return 420;
    } else if (index.value === 8) {
        return 420;
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
        return 160;
    }else if(index.value === 10){
        return 320;
    }
};
let prop = ref('stName');
//格式化警戒水深
const formatDepthVal = val => {
    if (val != null || val != undefined) {
        return val;
    } else {
        return '/';
    }
};
const details = stCode => {
    emit('ParentDetails', stCode);
    // console.log(stCode);
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
                // emit('getData');
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
    tableInst.value.setScrollTop(0);
};
const refresh = () => {
    input.value = '';
    optionsValue.value = '';
    getSiteList();
};
//关注站点信息
const getSiteList = () => {
    if (index.value == 1) {
        sourceType.value = 1;
        // optionsValue.value = 1;
    } else if (index.value == 8) {
        sourceType.value = 0;
        // optionsValue.value = 0;
    } else {
        sourceType.value = '';
        // optionsValue.value= null;
    }
    let par = {};
    if (type.value == 'ZZ') {
        par = { moniItem: moniItem.value, stType: type.value, sourceType: sourceType.value, stName: input.value, stCode: inputStCode.value, dataSource: optionsValue.value };
    } else {
        par = { stType: type.value, sourceType: sourceType.value, stName: input.value, stCode: inputStCode.value, dataSource: optionsValue.value };
    }
    getSite(par).then(res => {
        if (res.success) {
            //   height.value = `${tableRef.value.clientHeight}px`;
            if (index.value == 1 || index.value === 8) {
                tableData.value = res.data.pptnStatisticsList;
            } else if (index.value == 2) {
                tableData.value = res.data.rsvrRList;
                // num.value = res.data.rsvrRList.length;
            } else if (index.value == 3) {
                tableData.value = res.data.wagaList;
                // num.value = res.data.wagaList.length;
            } else if (index.value == 4) {
                tableData.value = res.data.wmstList;
                // num.value = res.data.wmstList.length;
            } else if (index.value === 5) {
                tableData.value = res.data.riverRList;
                // num.value = res.data.riverRList.length;
            } else if (index.value === 6 || index.value == 10) {
                tableData.value = res.data.zzRiverRList;
                // num.value = res.data.zzRiverRList.length;
            } else if (index.value === 7) {
                tableData.value = res.data.awqmdDList;
                // num.value = res.data.awqmdDList.length;
            } else if (index.value === 9) {
                tableData.value = res.data.areaRainfallList;
                // num.value = res.data.areaRainfallList.length;
            }
            num.value = res.data.total;
            // else if(index.value === 8){
            //   tableData.value = res.data.pptnList;
            // }
        }
    });
};
const exportData = () => {
    if (index.value == 1) {
        sourceType.value = 1;
        // optionsValue.value = 1;
    } else if (index.value == 8) {
        sourceType.value = 0;
        // optionsValue.value = 0;
    } else {
        sourceType.value = '';
        // optionsValue.value= null;
    }
    let par = {};
    if (type.value == 'ZZ') {
        par = { dataSource: optionsValue.value, moniItem: moniItem.value, stType: type.value, sourceType: sourceType.value, stName: input.value, stCode: inputStCode.value };
    } else {
        par = { dataSource: optionsValue.value, stType: type.value, sourceType: sourceType.value, stName: input.value, stCode: inputStCode.value };
    }
    let text = '';
    switch (type.value) {
        case 'RR':
            text = '水库水情';
            break;
        case 'PPS':
            if (sourceType.value == 1) {
                text = '实时雨情';
            } else if (sourceType.value == 0) {
                text = '山洪雨情';
            }
            break;
        case 'DD':
            text = '堰闸站水情';
            break;
        case 'ZZ':
            if (moniItem.value == 1) {
                text = '渠道水文';
            } else {
                text = '农业水价改革';
            }
            break;
        case 'ZQ':
            text = '河道水情';
            break;
        case 'WQ':
            text = '水质';
            break;
    }
    proxy.download(
        'business/bigScreen/home/exportSiteInfoList',
        {
            dataSource: optionsValue.value,
            stType: type.value,
            sourceType: 1,
            stName: input.value,
            stCode: inputStCode.value,
            tm:null
        },
        `${text}实时数据_${new Date().getTime()}.xlsx`
    );
};

onMounted(() => {
    if (props.moniItem != undefined) {
        moniItem.value = props.moniItem;
    }
    getSiteList();
    options.value = dictStore.getDict('DATA_SOURCE_TYPE');
    // console.log(props.index,props.type)
});
// watch(index,(i)=>{
//   if(i == 4){
//     prop.value = 'wmstName'
//   }else{
//     prop.value = 'stName'
//   }
// },{immediate:true})
</script>
