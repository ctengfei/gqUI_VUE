<template>
    <pro-crud ref="crudRef" v-model="form" v-model:search="serachForm" :columns="columns" :form-columns="formColumns" :gutter="20" :menu="menu"
        :data="tableData" v-model:current-page="currentPage" v-model:page-size="pageSize"
        layout="->,total,sizes,prev, pager, next, jumper" background :page-sizes="[10, 20, 30, 40, 50]"
        :total="total" @load="load" :column="2" width="45%" align="center" :before-open="beforeOpen"
        :before-close="beforeClose" label-width="110px" direction="vertical" @search="searchSubmit"
        @search-reset="searchReset" @submit="submit" @delete="deleteRow">
        <template #search-menu-right="{ size }">
            <el-button :size="size" type="primary" icon="Plus" plain @click="crudRef.openDialog('add')"
                style="margin-left: 30px">新增预警参数设置</el-button>
        </template>
        <template #form-menu-right="{ size }">
            <el-button :size="size" @click="crudRef.closeDialog()">
                关闭
            </el-button>
        </template>
    </pro-crud>
</template>
<script setup>
import {
    defineCrudColumns,
    defineCrudMenuColumns,
    defineCrudSubmit,
    defineCrudSearch,
    defineFormColumns,
    defineCrudBeforeOpen,
    defineCrudBeforeClose,
} from 'element-pro-components';
import { getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { getParmAlarmFcstList, addParmAlarmFcst, upDateParmAlarmFcst, delParmAlarmFcst, getChanBaseList,  } from "@/api/evolutionPlanData"
import { ElMessage, ElMessageBox } from "element-plus";
let form = ref();
const crudRef = ref();
const serachForm = ref({});
const tableData = ref([]);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
let gateNameList = ref([]);

const menu = defineCrudMenuColumns({
    label: '操作',
    add: false,
    fixed: 'right',
    addText: '新增预警参数设置',
    detail: false,
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
        icon: "Refresh",
    },
    searchProps: {
        type: 'primary',
        icon: "Search",
    },
    delText: '删除',
    editText: '编辑',
    searchText: '搜索',
    searchResetText: '重置',
    submitText: '确定',
    resetText: '取消',
});

const columns = defineCrudColumns([
    {
        label: '渠道名称',
        prop: 'chanCode',
        component: 'el-input',
        props: {
            placeholder: '请输入渠道名称',
        },
        search: true,
    },
    {
        label: '断面桩号',
        prop: 'bnch',
    },
    {
        label: '渠道编码',
        prop: 'chanCode',
    },
    {
        label: '渠道深度(m)',
        prop: 'depth',
    },
    {
        label: '渠底高程(m)',
        prop: 'elev',
    },
    {
        label: '预警百分比',
        prop: 'ratio',
    },
    {
        label: '河段编码',
        prop: 'rvskCode',
    },
    {
        label: '河段名称',
        prop: 'rvskName',
    },
    {
        label: '闸门编码',
        prop: 'wraRepCd',
    },
    {
        label: '闸门名称',
        prop: 'wraRepNm',
    },
]);

const formColumns = defineFormColumns(computed(()=>[
    {
        label: '渠道编码',
        prop: 'chanCode',
        component: 'el-input',
        props: {
            clearable: true,
            placeholder: '请输入渠道编码',
        },
        md:12
    },
    {
        label: '断面桩号',
        prop: 'bnch',
        component: 'el-input',
        props: {
            clearable: true,
            placeholder: '请输入断面名称/桩号',
        },
        md:12
    },
    {
        label: '渠道深度(m)',
        prop: 'depth',
        component: 'el-input-number',
        props: {
            min:0,
            step: 0.01,
            placeholder: '请输入渠道深度',
        },
        md:12
    },
    {
        label: '渠底高程(m)',
        prop: 'elev',
        component: 'el-input-number',
        props: {
            min:0,
            step: 0.01,
            placeholder: '请输入渠底高程',
        },
        md:12
    },
    {
        label: '预警百分比',
        prop: 'ratio',
        component: 'el-input-number',
        props: {
            min: 0,
            max: 1,
            step: 0.1,
            placeholder: '请输入预警百分比',
        },
        md:12
    },
    {
        label: '河段编码',
        prop: 'rvskCode',
        component: 'el-input',
        props: {
            clearable: true,
            placeholder: '请输入河段编码',
        },
        md:12
    },
    {
        label: '河段名称',
        prop: 'rvskName',
        component: 'el-input',
        props: {
            clearable: true,
            placeholder: '请输入河段名称',
        },
        md:12
    },
    {
        label: '闸门名称',
        prop: 'wraRepCd',
        component: 'pro-select',
        props: {
            placeholder: '请输入闸门名称',
            style: { width: '100%' },
            filterable: true,
            data: gateNameList.value,
            clearable:true,
            onChange: wraChange,
            // config: {value: 'allocCode', label: 'iimsAllocName'},
            config: {value: 'wraRepCd', label: 'wraRepNm'},
        },
        md:12
    },
]));
onMounted(() => {
    getData();
})

// 获取闸门名称列表
const gateNames = (val) => {
  getChanBaseList().then(res => {
    gateNameList.value = res.data
  })
}
const wraChange = (val) => {
    let temp = gateNameList.value.filter(item => {
        return item.wraRepCd == val
    })
    form.value.wraRepNm = temp[0].wraRepNm;
}
const getData = () => {
    const { bnch } = serachForm.value;
    const params = {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        bnch,
    }
    getParmAlarmFcstList(params).then(res => {
        console.log(res, "res")
        tableData.value = res.data;
    })
}

const beforeOpen = defineCrudBeforeOpen((done, type, row) => {
    gateNames();
    if (type === 'edit') {
        form.value = row || {};
        done();
    } else {
        form.value = {};
        done();
    }
});

const beforeClose = defineCrudBeforeClose((done) => {
    form.value = {};
    done()
});

const searchReset = () => {
    currentPage.value = 1;
}

const searchSubmit = defineCrudSearch((done) => {
    done();
});

const submit = defineCrudSubmit((close, done, type, isValid, invalidFields) => {
    console.log(form.value, "form.value")
    if (isValid) {
        if (type == 'add') {
            const params = {
                ...form.value,
            }
            addParmAlarmFcst(params).then(res => {
                getData();
                ElMessage({
                    message: '添加成功',
                    type: 'success',
                });
                close()
            })
        } else {
            const params = {
                ...form.value,
            }
            upDateParmAlarmFcst(params).then(res => {
                getData();
                ElMessage({
                    message: '修改成功',
                    type: 'success',
                });
                close()
            })
        }
    }
    done()
});

//删除
const deleteRow = (row) => {
    ElMessageBox.confirm(`是否确认删除数据项？`, "系统提示", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: "warning",
    }).then(() => {
        delParmAlarmFcst({ bnch: row.bnch, rvskCode: row.rvskCode }).then(() => {
            getData();
            ElMessage({
                message: '删除成功',
                type: 'success',
            });
        });
    })
};

const load = () => {

}
</script>
<style lang="scss" scoped></style>