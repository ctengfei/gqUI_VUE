<template>
    <div class="app-container">
        <pro-crud
            ref="crudRef"
            v-model="form"
            v-model:search="serachForm"
            :columns="columns"
            :form-columns="formColumns"
            :gutter="20"
            :menu="menu"
            class="dialog-class"
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
            width="50%"
            align="center"
            :before-open="beforeOpen"
            :before-close="beforeClose"
            label-width="155px"
            direction="vertical"
            @search="searchSubmit"
            @search-reset="searchReset"
            @submit="submit"
            @delete="deleteRow">
            <template #form-menu-right="{ size }">
                <el-button :size="size" @click="crudRef.closeDialog()">关闭</el-button>
            </template>
            <template #search-menu-right="{ size }">
                <el-button style="margin-left: 30px" type="primary" plain icon="Plus" @click="crudRef.openDialog('add')">新增</el-button>
                <el-button type="success" plain icon="Download" @click="exportData">导出</el-button>
            </template>
            <template #table-wagaType="{ size, row, column, $index }">
                {{ formatterVal(row, 'WAGA_TYPE', 'wagaType') }}
            </template>
            <template #table-engGrad="{ size, row, column, $index }">
                {{ formatterVal(row, 'ENG_GRAD', 'engGrad') }}
            </template>
            <template #table-engScal="{ size, row, column, $index }">
                {{ formatterVal(row, 'PROJ_SCAL', 'engScal') }}
            </template>
            <template #table-engStat="{ size, row, column, $index }">
                {{ formatterVal(row, 'ENG_STAT', 'engStat') }}
            </template>
            <template #table-mainBuildGrad="{ size, row, column, $index }">
                {{ formatterVal(row, 'BUILDING_GRAD', 'mainBuildGrad') }}
            </template>
            <template #crud-detail="{ props, columns, size }">
                <pro-form label-width="155px" v-model="form" @reset="crudRef.closeDialog()" :menu="detailMenu" :columns="detailColumns"></pro-form>
            </template>
        </pro-crud>
    </div>
</template>

<script setup>
import { defineCrudColumns, defineCrudMenuColumns, defineCrudSubmit, defineCrudSearch, defineFormColumns, defineTableIndexColumns, defineCrudBeforeOpen, defineCrudBeforeClose } from 'element-pro-components';
import { formatterVal } from '@/utils';
import { ref, reactive, onMounted, computed } from 'vue';
import useDictionaryStore from '@/store/modules/dictionary';
import { addSli, delSli, exportSliExcel, getSli, updateSli } from '@/api/informationManager/basicData/sluiceBasicData';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCanList } from '@/api/informationManager/basicData/canalBasicData';
const menu = defineCrudMenuColumns({
    label: '操作',
    add: false,
    fixed: 'right',
    addText: '新增',
    detail: true,
    reset: false,
    width: '250',
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
const crudRef = ref();
const dialog = ref();
const serachForm = ref({});
let data = ref([]);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
let channelList = ref([]);
const { proxy } = getCurrentInstance();
const dictStore = useDictionaryStore();
const columns = defineCrudColumns([
    {
        label: '水闸代码',
        prop: 'wagaCode',
        component: 'el-input',
        props: {
            placeholder: '请输入水闸代码'
        },
        form: true,
        search: true
    },
    {
        label: '水闸名称',
        prop: 'wagaName',
        component: 'el-input',
        props: {
            placeholder: '请输入水闸名称'
        },
        form: true,
        search: true
    },
    {
        label: '经度',
        prop: 'longitude',
        search: false,
        form: true
    },
    {
        label: '纬度',
        prop: 'latitude',
        search: false,
        form: true
    },
    {
        label: '所在位置',
        prop: 'wagaLoc',
        search: false,
        form: true
    },
    {
        label: '水闸类型',
        prop: 'wagaType',
        component: 'pro-select',
        props: {
            data: dictStore.getDict('WAGA_TYPE'),
            config: { value: 'value', label: 'label' },
            placeholder: '请选择水闸类型',
            clearable: true
        },
        search: true,
        form: true
    },
    {
        label: '工程类别',
        prop: 'engGrad',
        component: 'pro-select',
        props: {
            data: dictStore.getDict('ENG_GRAD'),
            config: { value: 'value', label: 'label' },
            placeholder: '请选择工程类别',
            clearable: true
        },
        search: true,
        form: true
    },
    {
        label: '工程规模',
        prop: 'engScal',
        component: 'pro-select',
        props: {
            data: dictStore.getDict('PROJ_SCAL'),
            config: { value: 'value', label: 'label' },
            placeholder: '请选择工程规模',
            clearable: true
        },
        search: true,
        form: true
    },
    {
        label: '设计最大过闸流量',
        prop: 'desLockMsc',
        search: false,
        form: true
    },
    {
        label: '闸孔数量',
        prop: 'gaorNum',
        search: false,
        form: true
    },
    {
        label: '闸孔总净宽',
        prop: 'gaorTotNetWid',
        search: false,
        form: true
    },
    {
        label: '归属管理部门',
        prop: 'admDep',
        form: true
    },
    {
        label: '备注',
        prop: 'remark',
        search: false,
        form: true
    }
]);
const formColumns = defineFormColumns(
    computed(() => [
        {
            label: '水闸代码',
            prop: 'wagaCode',
            component: 'el-input',
            rules: [{ required: true, message: '请输入水闸代码' }],
            props: {
                disabled: !!form.value?.wagaCode,
                placeholder: '请输入水闸代码'
            },
            md: 12
        },
        {
            label: '水闸名称',
            prop: 'wagaName',
            component: 'el-input',
            rules: [{ required: true, message: '请输入水闸名称' }],
            props: {
                placeholder: '请输入水闸名称'
            },
            md: 12
        },
        {
            label: '经度',
            prop: 'longitude',
            component: 'el-input',
            props: {
                placeholder: '请输入经度'
            },
            md: 12
        },
        {
            label: '纬度',
            prop: 'latitude',
            component: 'el-input',
            props: {
                placeholder: '请输入纬度'
            },
            md: 12
        },
        {
            label: '桩号',
            prop: 'bnch',
            component: 'el-input',
            rules: [{ required: true, message: '请输入桩号' }],
            props: {
                placeholder: '请输入桩号'
            },
            md: 12
        },
        {
            label: '所属渠道',
            prop: 'chanCode',
            component: 'pro-select',
            rules: [{ required: true, message: '请选择所属渠道' }],
            props: {
                style: { width: '100%' },
                data: channelList.value,
                placeholder: '请选择所属渠道',
                clearable: true
            },
            md: 12
        },
        {
            label: '水闸所在位置',
            prop: 'wagaLoc',
            component: 'el-input',
            props: {
                placeholder: '请输入水闸所在位置'
            },
            md: 12
        },
        {
            label: '水闸类型',
            prop: 'wagaType',
            component: 'pro-select',
            rules: [{ required: true, message: '请选择水闸类型' }],
            props: {
                style: { width: '100%' },
                data: dictStore.getDict('WAGA_TYPE'),
                config: { value: 'value', label: 'label' },
                placeholder: '请选择水闸类型',
                clearable: true
            },
            md: 12
        },
        {
            label: '水闸用途',
            prop: 'wagaUse',
            component: 'el-input',
            props: {
                placeholder: '请输入水闸用途'
            },
            md: 12
        },
        {
            label: '工程类别',
            prop: 'engGrad',
            rules: [{ required: true, message: '请输入灌区编码' }],
            component: 'pro-select',
            props: {
                style: { width: '100%' },
                data: dictStore.getDict('ENG_GRAD'),
                config: { value: 'value', label: 'label' },
                placeholder: '请选择工程等别',
                clearable: true
            },
            md: 12
        },
        {
            label: '工程规模',
            prop: 'engScal',
            rules: [{ required: true, message: '请输入灌区编码' }],
            component: 'pro-select',
            props: {
                style: { width: '100%' },
                data: dictStore.getDict('PROJ_SCAL'),
                config: { value: 'value', label: 'label' },
                placeholder: '请选择工程规模',
                clearable: true
            },
            md: 12
        },
        {
            label: '主要建筑物级别',
            prop: 'mainBuildGrad',
            component: 'pro-select',
            props: {
                style: { width: '100%' },
                data: dictStore.getDict('BUILDING_GRAD'), // ENG_STAT.value
                config: { value: 'value', label: 'label' },
                placeholder: '请选择主要建筑物级别',
                clearable: true
            },
            md: 12
        },
        {
            label: '设计最大过闸流量',
            prop: 'desLockMsc',
            component: 'el-input',
            props: {
                placeholder: '请输入设计最大过闸流量'
            },
            md: 12
        },
        {
            label: '闸孔数量',
            prop: 'gaorNum',
            component: 'el-input',
            props: {
                placeholder: '请输入闸孔数量'
            },
            md: 12
        },
        {
            label: '闸孔直径',
            prop: 'gaorTotNetWid',
            component: 'el-input',
            props: {
                placeholder: '请输入闸孔直径'
            },
            md: 12
        },
        {
            label: '工程建设情况',
            prop: 'engStat',
            component: 'pro-select',
            props: {
                style: { width: '100%' },
                data: dictStore.getDict('ENG_STAT'), // ENG_STAT.value
                config: { value: 'value', label: 'label' },
                placeholder: '请选择工程建设情况',
                clearable: true
            },
            md: 12
        },
        {
            label: '开工时间',
            prop: 'startDate',
            component: 'el-input',
            props: {
                placeholder: '请输入开工时间'
            },
            md: 12
        },
        {
            label: '建成时间',
            prop: 'compDate',
            component: 'el-input',
            props: {
                placeholder: '请输入建成时间'
            },
            md: 12
        },
        {
            label: '归属管理部门',
            prop: 'admDep',
            component: 'el-input',
            props: {
                placeholder: '请输入归属管理部门'
            },
            md: 12
        },
        {
                label: '老桩号',
                prop: 'bnchOld',
                component: 'el-input',
                props: {
                    placeholder: '请输入老桩号'
                },
                md: 12
            },
            {
                label: '型式',
                prop: 'strPatt',
                component: 'el-input',
                props: {
                    placeholder: '请输入型式'
                },
                md: 12
            },
            {
                label: '设计流量',
                prop: 'dsfl',
                component: 'el-input',
                props: {
                    placeholder: '请输入设计流量'
                },
                md: 12
            },
            {
                label: '灌溉面积',
                prop: 'desIrrA',
                component: 'el-input',
                props: {
                    placeholder: '请输入灌溉面积'
                },
                md: 12
            },
            {
                label: '运行状况',
                prop: 'runStart',
                component: 'el-input',
                props: {
                    placeholder: '请输入运行状况'
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
            md: 24
        }
    ])
);
const detailColumns = defineFormColumns(
    computed(() =>
        [
            {
                label: '水闸代码',
                prop: 'wagaCode',
                component: 'el-input',
                rules: [{ required: true, message: '请输入水闸代码' }],
                props: {
                    placeholder: '请输入水闸代码'
                },
                md: 12
            },
            {
                label: '水闸名称',
                prop: 'wagaName',
                component: 'el-input',
                rules: [{ required: true, message: '请输入水闸名称' }],
                props: {
                    placeholder: '请输入水闸名称'
                },
                md: 12
            },
            {
                label: '经度',
                prop: 'longitude',
                component: 'el-input',
                props: {
                    placeholder: '请输入经度'
                },
                md: 12
            },
            {
                label: '纬度',
                prop: 'latitude',
                component: 'el-input',
                props: {
                    placeholder: '请输入纬度'
                },
                md: 12
            },
            {
                label: '桩号',
                prop: 'bnch',
                component: 'el-input',
                rules: [{ required: true, message: '请输入桩号' }],
                props: {
                    placeholder: '请输入桩号'
                },
                md: 12
            },
            {
                label: '所属渠道',
                prop: 'chanCode',
                component: 'pro-select',
                rules: [{ required: true, message: '请选择所属渠道' }],
                props: {
                    style: { width: '100%' },
                    data: channelList.value,
                    placeholder: '请选择所属渠道',
                    clearable: true
                },
                md: 12
            },
            {
                label: '水闸所在位置',
                prop: 'wagaLoc',
                component: 'el-input',
                props: {
                    placeholder: '请输入水闸所在位置'
                },
                md: 12
            },
            {
                label: '水闸类型',
                prop: 'wagaType',
                component: 'pro-select',
                rules: [{ required: true, message: '请选择水闸类型' }],
                props: {
                    style: { width: '100%' },
                    data: dictStore.getDict('WAGA_TYPE'),
                    config: { value: 'value', label: 'label' },
                    placeholder: '请选择水闸类型',
                    clearable: true
                },
                md: 12
            },
            {
                label: '水闸用途',
                prop: 'wagaUse',
                component: 'el-input',
                props: {
                    placeholder: '请输入水闸用途'
                },
                md: 12
            },
            {
                label: '工程类别',
                prop: 'engGrad',
                rules: [{ required: true, message: '请输入灌区编码' }],
                component: 'pro-select',
                props: {
                    style: { width: '100%' },
                    data: dictStore.getDict('ENG_GRAD'),
                    config: { value: 'value', label: 'label' },
                    placeholder: '请选择工程等别',
                    clearable: true
                },
                md: 12
            },
            {
                label: '工程规模',
                prop: 'engScal',
                rules: [{ required: true, message: '请输入灌区编码' }],
                component: 'pro-select',
                props: {
                    style: { width: '100%' },
                    data: dictStore.getDict('PROJ_SCAL'),
                    config: { value: 'value', label: 'label' },
                    placeholder: '请选择工程规模',
                    clearable: true
                },
                md: 12
            },
            {
                label: '主要建筑物级别',
                prop: 'mainBuildGrad',
                component: 'pro-select',
                props: {
                    style: { width: '100%' },
                    data: dictStore.getDict('BUILDING_GRAD'), // ENG_STAT.value
                    config: { value: 'value', label: 'label' },
                    placeholder: '请选择主要建筑物级别',
                    clearable: true
                },
                md: 12
            },
            {
                label: '设计最大过闸流量',
                prop: 'desLockMsc',
                component: 'el-input',
                props: {
                    placeholder: '请输入设计最大过闸流量'
                },
                md: 12
            },
            {
                label: '闸孔数量',
                prop: 'gaorNum',
                component: 'el-input',
                props: {
                    placeholder: '请输入闸孔数量'
                },
                md: 12
            },
            {
                label: '闸孔直径',
                prop: 'gaorTotNetWid',
                component: 'el-input',
                props: {
                    placeholder: '请输入闸孔直径'
                },
                md: 12
            },
            {
                label: '工程建设情况',
                prop: 'engStat',
                component: 'pro-select',
                props: {
                    style: { width: '100%' },
                    data: dictStore.getDict('ENG_STAT'), // ENG_STAT.value
                    config: { value: 'value', label: 'label' },
                    placeholder: '请选择工程建设情况',
                    clearable: true
                },
                md: 12
            },
            {
                label: '开工时间',
                prop: 'startDate',
                component: 'el-input',
                props: {
                    placeholder: '请输入开工时间'
                },
                md: 12
            },
            {
                label: '建成时间',
                prop: 'compDate',
                component: 'el-input',
                props: {
                    placeholder: '请输入建成时间'
                },
                md: 12
            },
            {
                label: '归属管理部门',
                prop: 'admDep',
                component: 'el-input',
                props: {
                    placeholder: '请输入归属管理部门'
                },
                md: 12
            },
            // {
            //     label: '老桩号',
            //     prop: 'bnchOld',
            //     component: 'el-input',
            //     props: {
            //         placeholder: '请输入老桩号'
            //     },
            //     md: 12
            // },
            {
                label: '型式',
                prop: 'strPatt',
                component: 'el-input',
                props: {
                    placeholder: '请输入型式'
                },
                md: 12
            },
            {
                label: '设计流量',
                prop: 'dsfl',
                component: 'el-input',
                props: {
                    placeholder: '请输入设计流量'
                },
                md: 12
            },
            {
                label: '灌溉面积',
                prop: 'desIrrA',
                component: 'el-input',
                props: {
                    placeholder: '请输入灌溉面积'
                },
                md: 12
            },
            {
                label: '运行状况',
                prop: 'runStart',
                component: 'el-input',
                props: {
                    placeholder: '请输入运行状况'
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
                md: 24
            }
        ].map(r => ({ ...r, props: { ...r.props, disabled: true } }))
    )
);
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
    getData();
    getCanList().then(res => {
        if (res.success) {
            channelList.value = res.data.map(r => ({ label: r.chanName, value: r.chanCode }));
        }
    });
});

const getData = () => {
    getSli({ ...serachForm.value, pageNum: currentPage.value, pageSize: pageSize.value }).then(res => {
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
            addSli({ ...form.value }).then(res => {
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
            updateSli(form.value.wagaCode, form.value).then(res => {
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

const deleteRow = row => {
    ElMessageBox.confirm(`是否确认删除数据项？`, '系统提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        delSli(row.wagaCode).then(res => {
            if (res.success) {
                getData();
                ElMessage({
                    message: '删除成功',
                    type: 'success'
                });
            }
        });
    });
};

const exportData = () => {
    proxy.download(
        'business/base/wagaBase/page/export',
        {
            ...serachForm.value,
            pageNum: currentPage.value,
            pageSize: pageSize.value
        },
        `水闸基础数据_${new Date().getTime()}.xlsx`
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
