<template>
    <div class="app-container">
        <el-form :inline="true" :model="formInline" class="demo-form-inline">
            <el-form-item label="区域名称">
                <el-select
                    v-model="formInline.wshCode"
                    placeholder="区域名称"
                    clearable
                >
                    <el-option
                     v-for="item in areaList"
                     :key="item.unitCode"
                     :label="item.unitName" 
                     :value="item.unitCode" />
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
                <el-button type="success" @click="exportAreaRainfallYear">导出</el-button>
            </el-form-item>
        </el-form>
        <div class="rep-bottom">
            <div class="title">{{areaInfo.time}}年度面雨量报表</div>
            <div class="subtitle">
                <div class="sub-left">
                    区域编码：{{areaInfo.wshCode}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    区域名称：{{areaInfo.wshName}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    数据：前一日8:00到次日8:00数据
                </div>
                <div class="sub-right">单位：mm</div>
            </div>
            <el-table :data="tableData" :height="screenHeight" border>
                <el-table-column prop="date" label="日期"  align="center"/>
                <el-table-column prop="jan" label="一月" align="center"/>
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
import {getAreaList,getAreaRainfallYearOrMonthReport,getAreaRainfallYearOrMonthList} from "@/api/informationManager/rainWaterReport";
import {ref,onMounted,reactive} from "vue";
const { proxy } = getCurrentInstance();
const formInline = reactive({
    wshCode:'',
    wshName:'',
    time:new Date().getFullYear().toString()
});
const areaInfo = reactive({
    wshCode:'',
    wshName:'',
    time:new Date().getFullYear().toString()
});
//区域列表
const areaList = ref([]);
//数据列表
const data = ref([]);
//表格数据
const tableData = ref([]);

//查询雨量站点信息
const getAreaListInfo = ()=>{
    getAreaList({}).then(res =>{
        if (res.success) {
            areaList.value = res.data;
            if(areaList!=null){
                formInline.wshCode = areaList.value[0].unitCode;
                formInline.wshName = areaList.value[0].unitName; 
                areaInfo.wshCode = areaList.value[0].unitCode;
                areaInfo.wshName = areaList.value[0].unitName;
                getData();
            }
        }
    })
}

//查询实时数据
const getData = () =>{
    setAreaInfo();
    getAreaRainfallYearOrMonthReport({
        wshCode:formInline.wshCode,
        time:formInline.time,
        type:1
    }).then(res =>{
        if (res.success) {
            tableData.value = res.data;
        }
    });
};
//赋值查询站点信息
const setAreaInfo = () =>{
    areaInfo.wshCode = formInline.wshCode;
    areaInfo.time = formInline.time;
    areaList.value.forEach(element => {
        if(element.unitCode == formInline.wshCode){
            areaInfo.wshName = element.unitName;
        }
    });
};

//导出面雨量年报
const exportAreaRainfallYear = () =>{
    proxy.download("/bim/resWaterResource/hisBasinPareal/exportAreaRainfallYearOrMonthReport", {
        wshCode:formInline.wshCode,
        time:formInline.time,
        wshName:formInline.wshName
  },`${areaInfo.wshName}${areaInfo.time}年度面雨量年报_${new Date().getTime()}.xlsx`);
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
    getAreaListInfo();
    //getData();
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