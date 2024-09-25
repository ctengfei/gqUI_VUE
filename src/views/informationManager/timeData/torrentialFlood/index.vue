<template>
    <div class="app-container" v-show="ShowDetails">
        <TableCom :index="8" :type="type" @ParentDetails="Details"></TableCom>
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
        </pro-crud>
    </div>
</template>

<script setup>
import { defineCrudColumns, defineCrudMenuColumns, defineCrudSubmit, defineCrudSearch, defineFormColumns, defineTableIndexColumns, defineCrudBeforeOpen, defineCrudBeforeClose } from 'element-pro-components';
import { formatterVal } from '@/utils';
import TableCom from '../comonents/TableCom.vue';
import { ref, reactive, onMounted } from 'vue';
// import { useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();
import useDictionaryStore from '@/store/modules/dictionary';
import dayjs from 'dayjs';
import { addRain, exportRainExcel, getRaine } from '@/api/informationManager/timeData/rainfallTimeData';
import { ElMessage } from 'element-plus';
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
const ShowDetails = ref(true);
const crudRef = ref();
const serachForm = ref({});
let data = ref([]);
let type = ref('PPS');
let Code = ref(null);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
    {
        label: '测站编码',
        prop: 'stcd',
        component: 'el-input',
        props: {
            placeholder: '请输入测站编码',
            clearable: true
        },
        form: true,
        search: false
    },
    {
        label: '测站名称',
        prop: 'stName',
        component: 'el-input',
        props: {
            placeholder: '请输入测站名称',
            clearable: true
        },
        form: true,
        search: false
    },
    {
        label: '时段降水量(mm)',
        prop: 'drp',
        search: false,
        form: true
    },
    {
        label: '时段长(h)',
        prop: 'intv',
        search: false,
        form: true
    },
    {
        label: '日降水量(mm)',
        prop: 'dyp',
        search: false,
        form: true
    },
    {
        label: '降水历时',
        prop: 'pdr',
        search: false,
        form: true
    },
    {
        label: '天气状况',
        prop: 'wth',
        search: false,
        form: true
    },
    {
        label: '数据时间',
        prop: 'tm',
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
        form: true
    }
    /* {
        label: '备注',
        prop: 'remark',
        search: false,
        form: true
    } */
]);
const formColumns = defineFormColumns([
    {
        label: '测站编码',
        prop: 'stcd',
        component: 'el-input',
        rules: [{ required: true, message: '请输入测站编码' }],
        props: {
            placeholder: '请输入测站编码'
        },
        md: 12
    },
    {
        label: '时段降水量(mm)',
        prop: 'drp',
        component: 'el-input',
        props: {
            placeholder: '请输入时段降水量'
        },
        md: 12
    },
    {
        label: '日降水量(mm)',
        prop: 'dyp',
        component: 'el-input',
        props: {
            placeholder: '请输入日降水量'
        },
        md: 12
    },
    {
        label: '时段长(h)',
        prop: 'intv',
        component: 'el-input',
        props: {
            placeholder: '请输入时段长'
        },
        md: 12
    },
    {
        label: '降水历时',
        prop: 'pdr',
        component: 'el-input',
        props: {
            placeholder: '请输入降水历时'
        },
        md: 12
    },
    {
        label: '天气状况',
        prop: 'wth',
        component: 'el-input',
        props: {
            placeholder: '请输入天气状况'
        },
        md: 12
    },
    {
        label: '数据时间',
        prop: 'tm',
        component: 'el-date-picker',
        props: {
            clearable: true,
            type: 'datetime',
            placeholder: '数据时间',
            'value-format': 'YYYY-MM-DD HH:mm:ss'
        },
        md: 12
    },
    {
        label: '备注',
        prop: 'remark',
        component: 'el-input',
        props: {
            autosize: { minRows: 2 },
            type: 'textarea',
            placeholder: '请输入备注'
        },
        md: 12
    }
]);

onMounted(() => {
    if (route.query.stCode != undefined) {
        //如果有参数传过来就是从首页跳转过来的
        ShowDetails.value = false;
        Code.value = route.query.stCode;
    }
    serachForm.value.tm = [dayjs(new Date() - 48 * 60 * 60 * 1000).format('YYYY-MM-DD 00:00:00'), dayjs(new Date()).format('YYYY-MM-DD 23:59:59')];
    getData();
});
const Details = stCode => {
    ShowDetails.value = false;
    Code.value = stCode;
    getData();
};

const back = () => {
    // if (route.query.stCode != undefined) {
    //     router.go(-1);
    // } else {
    //     ShowDetails.value = true;
    // }
    ShowDetails.value = true;
};
const getData = () => {
    getRaine({
        stcd: Code.value,
        type: '0',
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
        '/business/realData/pptnR/page/export',
        {
            stcd: Code.value,
            pageNum: currentPage.value,
            pageSize: pageSize.value,
            startTime: serachForm.value.tm ? dayjs(serachForm.value.tm[0]).format('YYYY-MM-DD 00:00:00') : '',
            endTime: serachForm.value.tm ? dayjs(serachForm.value.tm[1]).format('YYYY-MM-DD 23:59:59') : '',
            tm: null
        },
        `降雨实时数据_${new Date().getTime()}.xlsx`
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
</style>
