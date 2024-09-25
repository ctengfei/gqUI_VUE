<template>
    <pro-crud
        ref="RunOffcoeRef"
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
        height="400"
        width="50%"
        align="center"
        :before-open="beforeOpen"
        :before-close="beforeClose"
        label-width="235px"
        direction="vertical"
        @search="searchSubmit"
        @search-reset="searchReset"
        @submit="submit">
        <template #form-menu-right="{ size }">
            <el-button :size="size" @click="RunOffcoeRef.closeDialog()">关闭</el-button>
        </template>
        <template #search-menu-right="{ size }">
            <el-button style="margin-left: 30px" :size="size" type="primary" plain icon="Plus" @click="RunOffcoeRef.openDialog('add')">新增</el-button>
        </template>
    </pro-crud>
</template>

<script setup>
import { defineCrudColumns, defineCrudMenuColumns, defineCrudSubmit, defineCrudSearch, defineFormColumns, defineTableIndexColumns, defineCrudBeforeOpen, defineCrudBeforeClose } from 'element-pro-components';
// import { formatterVal } from '@/utils';
import { ref, onMounted } from 'vue';
import useDictionaryStore from '@/store/modules/dictionary';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { getParmYearRpRatioListt, putParmYeatRpRatio, getParmRpRatioGroupList, postParmYeatRpRatio } from '@/api/incomingWater';
const props = defineProps(['currentPlan']);
const menu = defineCrudMenuColumns({
    label: '操作',
    add: false,
    fixed: 'right',
    addText: '新增',
    detail: false,
    reset: false,
    del: false,
    width: '100',
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
    detailProps: {
        link: true,
        type: 'primary',
        icon: 'View'
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
    resetText: '取消',
    detailText: '查看'
});
const detailMenu = defineCrudMenuColumns({
    submit: false,
    reset: true,
    resetText: '关闭'
});
const form = ref({});
const RunOffcoeRef = ref();
const serachForm = ref({});
const config = ref({ value: 'unitCode', label: 'unitName' });
let data = ref([]);
let groupList = ref([]);
let groupListArray = ref([]);
let unitCode = ref('');
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const { proxy } = getCurrentInstance();
// console.log(proxy);
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
    // {
    //     label: '年份',
    //     prop: 'date',
    //     component: 'el-input',
    //     width: '200px',
    //     props: {
    //         placeholder: '请输入测站名称'
    //     },
    //     search: true,
    //     form: true
    // },
    {
        label: '时间',
        prop: 'date',
        component: 'el-date-picker',
        hide: true,
        props: {
            type: 'year',
            clearable: true,
            'value-format': 'YYYY',
            placeholder: '请选择时间'
        },
        search: true
    },
    {
        label: '径流单元编码',
        prop: 'unitCode',
        component: 'pro-select',
        props: {
            data: groupList.value,
            config: { value: 'unitCode', label: 'unitName' },
            clearable: true,
            placeholder: '径流计算单元编号'
        },
        search: true,
    },
    // {
    //     label: '时间',
    //     prop: 'date'
    // },
    {
        label: '年份',
        prop: 'year'
    },
    {
        label: '月份',
        prop: 'month'
    },
    {
        label: '降雨量(mm)',
        prop: 'rainfall'
    },
    {
        label: '径流量(mm)',
        prop: 'runoff'
    },
    {
        label: '径流系数',
        prop: 'rpRatio'
    }
]);
const formColumns = defineFormColumns([
    {
        label: '径流计算单元编号',
        prop: 'unitCode',
        component: 'pro-select',
        props: {
            data: groupList.value,
            config: { value: 'unitCode', label: 'unitName' },
            disabled: false,
            placeholder: '径流计算单元编号'
        },
        rules: [{ required: true, message: '请选择径流计算单元编号' }],
        md: 12
    },
    // {
    //     label: '径流计算单元名称',
    //     prop: 'unitName',
    //     component: 'pro-select',
    //     props: {
    //         data: groupList.value,
    //         config: { value: 'unitCode', label: 'unitName' },
    //         disabled: false,
    //         placeholder: '径流计算单元名称'
    //     },
    //     rules: [{ required: true, message: '请选择径流计算单元名称' }],
    //     md: 12
    // },
    {
        label: '时间',
        prop: 'date',
        component: 'el-date-picker',
        props: {
            type: 'month',
            style: { width: '100%' },
            clearable: true,
            'value-format': 'YYYY-MM',
            placeholder: '请选择时间'
        },
        rules: [{ required: true, message: '请选择时间' }],
        md: 12
    },
    // {
    //     label: '时间',
    //     prop: 'date',
    //     component: 'el-date-picker',
    //     props: {
    //         type: 'year',
    //         style: { width: '100%' },
    //         clearable: true,
    //         'value-format': 'YYYY-MM-DD',
    //         placeholder: '请选择时间'
    //     },
    //     md: 12
    // },
    // {
    //     label: '年份',
    //     prop: 'year',
    //     component: 'el-date-picker',
    //     props: {
    //         type: 'year',
    //         style: { width: '100%' },
    //         clearable: true,
    //         'value-format': 'YYYY',
    //         placeholder: '请选择时间'
    //     },
    //     md: 12
    // },
    // {
    //     label: '月份',
    //     prop: 'month',
    //     component: 'el-date-picker',
    //     props: {
    //         type: 'month',
    //         style: { width: '100%' },
    //         clearable: true,
    //         'value-format': 'YYYY-MM',
    //         placeholder: '请选择时间'
    //     },
    //     md: 12
    // },
    {
        label: '降雨量',
        prop: 'rainfall',
        component: 'el-input-number',
        props: {
            disabled: false,
            placeholder: '降雨量'
        },
        rules: [{ required: true, message: '请输入降雨量' }],
        md: 12
    },
    // {
    //     label: '径流计算单元编码',
    //     prop: 'unitCode',
    //     component: 'el-select',
    //     props: {
    //         disabled: false,
    //         placeholder: '请输入径流计算单元编码'
    //     },
    //     md: 12
    // },
    {
        label: '径流量',
        prop: 'runoff',
        component: 'el-input-number',
        props: {
            style: { width: '100%' },
            placeholder: '径流量'
        },
        rules: [{ required: true, message: '请输入径流量' }],
        md: 12
    },
    {
        label: '径流系数',
        prop: 'rpRatio',
        component: 'el-input-number',
        props: {
            style: { width: '100%' },
            placeholder: '径流系数'
        },
        rules: [{ required: true, message: '请输入径流系数' }],
        md: 12
    }
]);
const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
    if (type === 'edit' || type === 'detail') {
        form.value = row || {};
    } else {
        form.value = {};
    }
    done();
});

const beforeClose = defineCrudBeforeClose(done => {
    form.value = {};
    done();
});

onMounted(() => {
    getParmGroupList();
    getData();
});
const getParmGroupList = () => {
    getParmRpRatioGroupList().then(res => {
        if (res.success) {
            // groupListArray.value =
            res.data.map(val => {
                groupList.value.push(val);
            });
        }
    });
};
const getData = () => {
    // const currentPlan = props.currentPlan;
    const { date,unitCode } = serachForm.value || {};
    getParmYearRpRatioListt({ unitCode,year: date, pageNum: currentPage.value, pageSize: pageSize.value }).then(res => {
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
            let unitName = groupList.value.filter(v => {
                return v.unitCode == form.value.unitCode;
            });
            let par = {
                date: dayjs(form.value.month).format('YYYY-MM-DD HH:mm:ss'),
                month: parseInt(dayjs(form.value.month).format('MM')),
                year: parseInt(dayjs(form.value.month).format('YYYY')),
                rainfall: form.value.rainfall,
                rpRatio: form.value.rpRatio,
                runoff: form.value.runoff,
                unitCode: form.value.unitCode,
                unitName: unitName[0].unitName
            };
            postParmYeatRpRatio(par).then(res => {
                if (res.success) {
                    ElMessage({
                        message: '添加成功',
                        type: 'success'
                    });
                    getData();
                    close();
                }
            });
        } else {
            putParmYeatRpRatio(form.value).then(res => {
                if (res.success) {
                    ElMessage({
                        message: '修改成功',
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
