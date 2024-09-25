<template>
    <!--设备状态信息-->
    <div class="app-container">
        <pro-crud
            v-model="form"
            v-model:search="serachForm"
            :columns="columns"
            :form-columns="formColumns"
            :gutter="20"
            :menu="menu"
            :data="data"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            layout="->,total,sizes,prev, pager, next, jumper"
            background
            draggable
            :page-sizes="[10, 20, 30, 40, 50]"
            :total="total"
            @load="load"
            column="2"
            width="40%"
            align="center"
            label-width="155px"
            direction="vertical"
            :before-open="beforeOpen"
            @search="searchSubmit"
            @search-reset="searchReset"
            @submit="submit">
            <template #search-menu-right="{ size }">
                <el-button style="margin-left: 30px" type="success" plain icon="Download" @click="exportData">导出</el-button>
            </template>
        </pro-crud>
        <el-dialog v-model="dialogVisible" title="详情" width="1000" draggable>
            <div class="parent-element">
                <span>设备名称：</span>
                <el-date-picker style="margin-left: 20px" v-model="DateValue" type="daterange" range-separator="-" value-format="YYYY-MM-DD" start-placeholder="开始时间" end-placeholder="结束时间" size="default" />
                <el-button style="margin-left: 20px" type="primary" :icon="Search" @click="DetailQuery">搜索</el-button>
                <el-button style="margin-left: 30px" type="success" plain icon="Download" @click="DetailExportData">导出</el-button>
            </div>

            <div style="width: 100%; height: 400px; display: flex; margin-top: 20px">
                <div style="flex: 1" id="EquipmentStatusInformationEcharts" ref="EquipmentStatusInformationEcharts"></div>
                <div class="Table">
                    <el-table :data="Tdata" height="410" v-loading="TableLoading" element-loading-text="数据加载中">
                        <el-table-column prop="index" label="序号" width="50"></el-table-column>
                        <el-table-column prop="monitorTime" label="监测时间"></el-table-column>
                        <el-table-column prop="name" label="设备名称"></el-table-column>
                        <el-table-column prop="extPowerVolt" label="供电电压（V）"></el-table-column>
                        <el-table-column prop="batteryDumpEnergy" label="电量剩余百分比"></el-table-column>
                        <el-table-column prop="temp" label="环境温度" width="60"></el-table-column>
                    </el-table>
                </div>
            </div>
            <!-- <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          Confirm
        </el-button>
      </div>
    </template> -->
        </el-dialog>
    </div>
</template>

<script setup>
import { defineCrudColumns, defineCrudMenuColumns, defineCrudSubmit, defineCrudSearch, defineFormColumns, defineTableIndexColumns, defineCrudBeforeOpen, defineCrudBeforeClose } from 'element-pro-components';
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getGateOpenClose } from '@/api/informationManager/timeData/gateOpenCloseTimeData';
import dayjs from 'dayjs';
import { getSkList } from '@/api/informationManager/timeData/lakeIndicatorTimeData';
import { gettblJcZt, getdetailtblJcZt } from '@/api/informationManager/timeData/EquipmentStatusInformationTimeData';
import useDictionaryStore from "@/store/modules/dictionary";
import * as echarts from 'echarts';
const menu = defineCrudMenuColumns({
    label: '操作',
    add: false,
    del: false,
    edit: false,
    fixed: 'right',
    addText: '新增',
    detail: true,
    width: '150',
    addProps: {
        type: 'primary',
        plain: true,
        icon: 'Plus'
    },
    editProps: {
        link: true,
        type: 'primary',
        icon: 'Edit'
    },
    delProps: {
        link: true,
        type: 'danger',
        icon: 'Delete'
    },
    detailProps: {
        link: true,
        icon: 'View',
        type: 'primary'
    },
    searchResetProps: {
        icon: 'Refresh'
    },
    searchProps: {
        type: 'primary',
        icon: 'Search'
    },
    delText: '删除',
    editText: '修改',
    searchText: '搜索',
    searchResetText: '重置',
    submitText: '确定',
    resetText: '取消',
    detailText: '查看详情'
});
const form = ref({});
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
let skList = ref([]);
let dialogVisible = ref(false);
let DateValue = ref('');
let sn = ref(null);
let TableLoading = ref(false);
const Tdata = ref([]);
const EquipmentStatusInformationEcharts = ref(null);
const dictStore = useDictionaryStore();
const { proxy } = getCurrentInstance();
const columns = defineCrudColumns([
    {
        label: '序号',
        prop: 'index',
        search: false,
        form: true
    },
    {
        label: '设备名称',
        prop: 'name',
        component: 'el-input',
        props: {
            placeholder: '请输入名称',
            clearable: true
        },
        form: true,
        search: true
    },
    {
        label: '设备SN码',
        prop: 'sn',
        component: 'el-input',
        props: {
            placeholder: '请输入设备SN码',
            clearable: true
        },
        search: true,
        form: true
    },
    {
        label: '供电电压（v）',
        prop: 'extPowerVolt',
        search: false,
        form: true
    },
    {
        label: '电量剩余百分比',
        prop: 'batteryDumpEnergy',
        search: false,
        form: true
    },
    {
        label: '环境温度',
        prop: 'temp',
        search: false,
        form: true
    },
    {
        label: '经度',
        prop: 'lon',
        search: false,
        form: true
    },
    {
        label: '纬度',
        prop: 'lat',
        search: false,
        form: true
    },
    {
        label: '是否是4G网络',
        prop: 'on4g',
        component: 'pro-select',
        props: {
            placeholder: '请选择',
            clearable: true,
            data:[{label:'全部',value:''},{label:'是',value:'是'},{label:'否',value:'否'}],
            config: { value: 'value', label: 'label' }
        },
        search: true,
        form: true
    },
    {
        label: '4G信号强度',
        prop: 'signal4g',
        search: false,
        form: true
    },
    {
        label: '固件版本号',
        prop: 'swVersion',
        search: false,
        form: true
    },
    {
        label: '最新监测时间',
        prop: 'monitorTime',
        component: 'el-date-picker',
        props: {
            clearable: true,
            type: 'daterange',
            'start-placeholder': '开始时间',
            'end-placeholder': '结束时间',
            'range-separator': '-',
            'value-format': 'YYYY-MM-DD'
        },
        search: false,
        form: true
    },
    {
        label: '最新入库时间',
        prop: 'storageTime',
        component: 'el-date-picker',
        props: {
            clearable: true,
            type: 'daterange',
            'start-placeholder': '开始时间',
            'end-placeholder': '结束时间',
            'range-separator': '-',
            'value-format': 'YYYY-MM-DD'
        },
        search: false,
        form: true
    }
]);
const formColumns = defineFormColumns([
    {
        label: '设备名称',
        prop: 'name',
        component: 'el-input',
        props: {
            placeholder: '请输入名称',
            clearable: true
        },
        form: true,
        search: true
    }
]);

onMounted(() => {
    DateValue.value = [dayjs(new Date() - 72 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00'), dayjs(new Date()).format('YYYY-MM-DD 23:59:59')];
    getData();
    // getSkList({stType:'RR'}).then(res=>{
    //   if (res.success) {
    //     skList.value = res.data.map(r=>({label:r.stName,value:r.stCode}));
    //   }
    // })
});

const getData = () => {
    gettblJcZt({
        ...serachForm.value,
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        startTime: serachForm.value.tm ? serachForm.value.tm[0] : '',
        endTime: serachForm.value.tm ? serachForm.value.tm[1] : '',
        tm: null
    }).then(res => {
        if (res.success) {
            res.data.data.map((item, index) => {
                item.index = (currentPage.value - 1) * pageSize.value + index + 1
            });

            data.value = res.data.data;
            total.value = res.data.total;
        }
    });
};

const searchSubmit = defineCrudSearch((done, isValid, invalidFields) => {
    getData();
    done();
});

const searchReset = () => {
    currentPage.value = 1;
    getData();
};
const DetailQuery = () => {
    GetDetailData();
};

const GetDetailData = row => {
    sn.value = row.sn;
    TableLoading.value = true;
    getdetailtblJcZt({ sn: sn.value, starttime: DateValue.value ? DateValue.value[0] : '', endtime: DateValue.value ? DateValue.value[1] : '' }).then(res => {
        TableLoading.value = false;
        if (res.success) {
            const chartE = echarts.init(EquipmentStatusInformationEcharts.value);
            res.data.map((item, index) => {
                item.index = index + 1;
            });
            Tdata.value = res.data;
            chartE.setOption({
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: res.data.map(r => r.monitorTime)
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {},
                yAxis: [
                    {
                        type: 'value',
                        name: '供电电压(v)',
                        nameTextStyle: {
                            color: '#aaa',
                            nameLocation: 'start'
                        }
                    },
                    {
                        type: 'value',
                        name: '环境温度(°)',
                        nameTextStyle: {
                            color: '#aaa',
                            nameLocation: 'start'
                        }
                    }
                ],
                series: [
                    {
                        data: res.data.map(r => r.extPowerVolt),
                        type: 'line',
                        yAxisIndex: 0,
                        name: '供电电压(v)',
                        showSymbol: false,
                        smooth: true
                    },
                    {
                        data: res.data.map(r => r.temp),
                        type: 'line',
                        yAxisIndex: 1,
                        name: '环境温度(°)',
                        showSymbol: false,
                        smooth: true
                    },
                    {
                        data: res.data.map(r => r.batteryDumpEnergy),
                        type: 'line',
                        yAxisIndex: 1,
                        name: '电量剩余百分比(%)',
                        showSymbol: false,
                        smooth: true
                    }
                ]
            });
        }
    });
};
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
    dialogVisible.value = true;
    GetDetailData(row);
    //     console.log('123123',type)
    //   if (type === 'edit' || type === 'detail') {

    //   } else {
    //     console.log('123123')
    //   }
    //   done();
});

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
    if (isValid) {
        if (type == 'add') {
        }
    }
    done();
});

// 分页选择
const load = () => {
    getData();
};

const exportData = () => {
    proxy.download(
        '/business/huangtangMonitor/tblJcZt/page/exportDeviceStateInfo',
        {
            ...serachForm.value,
            pageNum: currentPage.value,
            pageSize: pageSize.value,
            startTime: serachForm.value.tm ? serachForm.value.tm[0] : '',
            endTime: serachForm.value.tm ? serachForm.value.tm[1] : '',
            tm: null
        },
        `设备状态信息_${dayjs().format('YYYY-MM-DD')}.xlsx`
    );
};

const DetailExportData = () => {
    proxy.download('/business/huangtangMonitor/tblJcZt/page/export', { sn: sn.value, startTime: DateValue.value ? DateValue.value[0] : '', endTime: DateValue.value ? DateValue.value[1] : '' }, `设备状态信息_${dayjs().format('YYYY-MM-DD')}.xlsx`);
};
</script>

<style scoped lang="scss">
.parent-element {
    width: 650px;
    display: flex;
    align-items: center;
}
.Table {
    width: 540px;
}
</style>
