<template>
    <div class="app-container">
        <el-form :inline="true" :model="formInline" class="demo-form-inline">
            <el-form-item label="监测站点">
                <el-select
                    v-model="formInline.stcd"
                    placeholder="监测站点"
                    clearable
                    @change="selectEvent"
                >
                    <el-option
                     v-for="item in stationList"
                     :key="item.stCode"
                     :label="item.stName" 
                     :value="item.stCode" />
                </el-select>
            </el-form-item>
            <el-form-item label="年度">
                <el-date-picker
                    v-model="formInline.time"
                    type="year"
                    value-format="YYYY"
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="getData" >查询</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="success" @click="exportPptnYear">导出</el-button>
            </el-form-item>
        </el-form>
        <div class="rep-bottom">
            <div class="title">{{stationInfo.time}}年度库水位报表</div>
            <div class="subtitle">
                <div class="sub-left">
                    站点编码：{{stationInfo.stcd}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    站点名称：{{stationInfo.stname}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    数据：今日 8:00 数据
                </div>
                <div class="sub-right">单位：m</div>
            </div>
            <el-table :data="tableData" :height="screenHeight" border>
                <el-table-column prop="date" label="日期" align="center"/>
                <el-table-column prop="jan" label="一月"  align="center"/>
                <el-table-column prop="feb" label="二月" align="center"/>
                <el-table-column prop="mar" label="三月" align="center"/>
                <el-table-column prop="apr" label="四月" align="center"/>
                <el-table-column prop="may" label="五月" align="center"/>
                <el-table-column prop="jun" label="六月" align="center"/>
                <el-table-column prop="jul" label="七月" align="center"/>
                <el-table-column prop="aug" label="八月" align="center"/>
                <el-table-column prop="sept" label="九月" align="center"/>
                <el-table-column prop="oct" label="十月" align="center"/>
                <el-table-column prop="nov" label="十一月" align="center"/>
                <el-table-column prop="dec" label="十二月" align="center"/>
            </el-table>
        </div>

    </div>
</template>
<script setup>
import {getStationList,getStrsvrRYearOrMonthReport} from "@/api/informationManager/rainWaterReport";
import {ref,onMounted,reactive} from "vue";
const { proxy } = getCurrentInstance();
const formInline = reactive({
    stcd:'61608180',
    time:new Date().getFullYear().toString()
});
const stationInfo = reactive({
    stcd:'61608180',
    stname:'王英水库（王英局）',
    time:new Date().getFullYear().toString()
});
//测站列表
const stationList = ref([]);
//监测数据列表
const data = ref([]);
//表格数据
const tableData = ref([]);

//查询库站点信息
const getRainStaion = ()=>{
    getStationList({
        stType:'RR'
    }).then(res =>{
        if (res.success) {
            stationList.value = res.data;
        }
    })
}

//查询实时数据
const getData = () =>{
    setStaionInfo();
    getStrsvrRYearOrMonthReport({
        stcd:formInline.stcd,
        time:formInline.time
    }).then(res =>{
        if (res.success) {
            tableData.value = res.data;
        }
    });
};

//赋值查询库站点信息
const setStaionInfo = () =>{
    stationInfo.stcd = formInline.stcd;
    stationInfo.time = formInline.time;
    stationList.value.forEach(element => {
        if(element.stCode == formInline.stcd){
            stationInfo.stname = element.stName;
        }
    });
};

//导出库水位年报
const exportPptnYear = () =>{
    proxy.download("/business/realData/rsvrR/rsvrRYearOrMonthReportExport", {
        stcd:formInline.stcd,
        time:formInline.time,
        stName:stationInfo.stname
  },`${stationInfo.stname}${stationInfo.time}年度库水位年报_${new Date().getTime()}.xlsx`);
}

//获取屏幕高度
const screenHeight = ref(650);
const getHight = () =>{
    // 获取屏幕高度
    screenHeight.value = window.innerHeight - 295;
    // 监听窗口大小变化，更新屏幕高度
    window.addEventListener('resize', () => {
        screenHeight.value = window.innerHeight - 295;
    });
}


onMounted(() => {
    getRainStaion();
    getData();
    getHight();
})
</script>
<style scoped lang="scss">
.demo-form-inline{
    float: right;
}
.rep-bottom{
    clear: both;
    .title{
        text-align:center;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 4px;
        width: 100%;
    }
    .subtitle{
        width: 100%;
        margin-bottom: 4px;
        .sub-left{
            float: left;
        }
        .sub-right{
            float: right;
        }
    }
}
</style>