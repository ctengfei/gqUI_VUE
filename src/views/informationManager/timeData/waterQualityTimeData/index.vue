<template>
    <div class="app-container" v-show="ShowDetails">
        <TableCom :index="7" :type="type" @ParentDetails="Details"></TableCom>
    </div>
    <div class="app-container" v-show="!ShowDetails">
        <pro-crud ref="crudRef" v-model="form" v-model:search="serachForm" :columns="columns" :form-columns="formColumns" :gutter="20" :menu="menu" :data="data" v-model:current-page="currentPage" v-model:page-size="pageSize" layout="->,total,sizes,prev, pager, next, jumper" background :page-sizes="[10, 20, 30, 40, 50]" :total="total" @load="load" column="2" width="40%" align="center" label-width="155px" direction="vertical" @search="searchSubmit" @search-reset="searchReset" @submit="submit">
            <template #form-menu-right="{ size }">
                <el-button :size="size" @click="crudRef.closeDialog()">关闭</el-button>
            </template>
            <template #search-menu-right="{ size }">
                <el-button style="margin-left: 30px" type="success" plain icon="Download" @click="exportData">导出</el-button>
                <el-button style="margin-left: 30px" type="primary" plain icon="ArrowLeftBold" @click="back">返回</el-button>
            </template>
            <template #table-level="{ size, row, column, $index }">
                <span v-if="row.level == 1" class="sp_wt" style="background-color: #c5ffff">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                <span v-if="row.level == 2" class="sp_wt" style="background-color: #34c3f6">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                <span v-if="row.level == 3" class="sp_wt" style="background-color: #03ff03">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                <span v-if="row.level == 4" class="sp_wt" style="background-color: #faff19">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                <span v-if="row.level == 5" class="sp_wt" style="background-color: #ff9000">{{ formatterVal(row, 'WATER_LEVEL', 'level') }}</span>
                <!-- {{ formatterVal(row, 'WATER_LEVEL', 'level') }} -->
            </template>
        </pro-crud>
    </div>
</template>

<script setup>
import { defineCrudColumns, defineCrudMenuColumns, defineCrudSubmit, defineCrudSearch, defineFormColumns, defineTableIndexColumns, defineCrudBeforeOpen, defineCrudBeforeClose } from 'element-pro-components';
import { formatterVal } from '@/utils';
import TableCom from '../comonents/TableCom.vue';
import { ref, reactive, onMounted } from 'vue';
import useDictionaryStore from '@/store/modules/dictionary';
import { ElMessage } from 'element-plus';
import { getQuality } from '@/api/informationManager/timeData/waterQualityTimeData';
import dayjs from 'dayjs';
const menu = defineCrudMenuColumns({
    label: '操作',
    add: false,
    hide: true,
    fixed: 'right',
    addText: '新增',
    detail: false,
    del: false,
    edit: false,
    reset: false,
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
    resetText: '取消'
});
const form = ref({});
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
let type = ref('WQ');
let Code = ref(null);
const route = useRoute();
const ShowDetails = ref(true);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
    {
        label: '测站编码',
        prop: 'stcd',
        width: 100,
        component: 'el-input',
        props: {
            placeholder: '请输入测站编码'
        },
        form: true,
        search: false
    },
    {
        label: '测站名称',
        prop: 'stName',
        width: 160,
        component: 'el-input',
        props: {
            placeholder: '请输入测站名称'
        },
        form: true,
        search: false
    },
    {
        label: '水质级别',
        prop: 'level',
        component: 'pro-select',
        props: {
            style: { width: '100%' },
            data: dictStore.getDict('WATER_LEVEL'),
            config: { value: 'value', label: 'label' }
        },
        search: false,
        form: true
    },
    {
        label: '水温(℃)',
        prop: 'wt',
        search: false,
        form: true
    },
    {
        label: 'PH值',
        prop: 'ph',
        search: false,
        form: true
    },
    {
        label: '溶解氧(mg/L)',
        prop: 'dox',
        search: false,
        form: true
    },
    {
        label: 'CODMn(mg/L)',
        prop: 'codmn',
        search: false,
        form: true
    },
    {
        label: '氨氮(mg/L)',
        prop: 'nh3n',
        search: false,
        form: true
    },
    {
        label: '总磷(mg/L)',
        prop: 'tp',
        search: false,
        form: true
    },
    {
        label: '浊度(NTU)',
        prop: 'turb',
        search: false,
        form: true
    },
    {
        label: '叶绿素(μg/L)',
        prop: 'chla',
        search: false,
        form: true
    },
    {
        label: '电导率(μs/cm)',
        prop: 'cond',
        search: false,
        form: true
    },
    {
        label: '化学需氧量(mg/L)',
        prop: 'codcr',
        search: false,
        form: true
    },
    {
        label: '总氮(mg/L)',
        prop: 'tn',
        search: false,
        form: true
    },
    {
        label: '采样时间',
        prop: 'tm',
        width: 160,
        component: 'el-date-picker',
        props: {
            clearable: true,
            type: 'daterange',
            'start-placeholder': '开始时间',
            'end-placeholder': '结束时间',
            'range-separator': '-',
            'value-format': 'YYYY-MM-DD'
        },
        search: true,
        form: true,
        fixed: 'right'
    }
]);

onMounted(() => {
    if (route.query.stCode != undefined) {
        //如果有参数传过来就是从首页跳转过来的
        ShowDetails.value = false;
        Code.value = route.query.stCode;
    }
    serachForm.value.tm=[dayjs(new Date()- 48*60*60*1000).format('YYYY-MM-DD 00:00:00'),dayjs(new Date()).format('YYYY-MM-DD 23:59:59')];
    getData();
});
const Details = stCode => {
    ShowDetails.value = false;
    Code.value = stCode;
    getData();
};

const back = () => {
    ShowDetails.value = true;
};
const getData = () => {
    getQuality({
        stcd: Code.value,
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        startTime: serachForm.value.tm ? dayjs(serachForm.value.tm[0]).format('YYYY-MM-DD 00:00:00') : '',
        endTime: serachForm.value.tm ? dayjs(serachForm.value.tm[1]).format('YYYY-MM-DD 23:59:59') : '',
        tm: null
    }).then(res => {
        if (res.success) {
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

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
    if (isValid) {
        if (type == 'add') {
            addRain({ ...form.value }).then(res => {
                if (res.success) {
                    ElMessage({
                        message: '添加成功',
                        type: 'success'
                    });
                    getData();
                    close();
                }
            });
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
        '/business/realData/awqmdD/page/export',
        {
            stcd: Code.value,
            pageNum: currentPage.value,
            pageSize: pageSize.value,
        startTime: serachForm.value.tm ? dayjs(serachForm.value.tm[0]).format('YYYY-MM-DD 00:00:00') : '',
        endTime: serachForm.value.tm ? dayjs(serachForm.value.tm[1]).format('YYYY-MM-DD 23:59:59') : '',
            tm: null
        },
        `水质实时数据_${new Date().getTime()}.xlsx`
    );
};
</script>

<style scoped lang="scss">
:deep(.pro-form:not(.el-form--inline) .pro-form-menu) {
    display: flex;
    .el-form-item__content {
        justify-content: end;
        margin-right: 40px;
    }
}
.sp_wt {
    display: block;
    border-radius: 5px;
    color: #fff;
    width: 80%;
    height: 24px;
    line-height: 25px;
    margin: auto;
}
</style>
