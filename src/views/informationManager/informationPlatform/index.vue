<template>
  <div style="width: 100%;text-align: right">
    <el-button style="margin-top: 10px; margin-right: 15px" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
  </div>
  <div class="card-container">
    <li v-for="item in data" @click="handleOpenPlaform(item)">
      <div class="img">
        <img v-if="item.url" :src="item.url" style="width: 100%;height: 100%">
        <span v-else>无图片</span>
        <el-button type="primary" class="plaft_edit" icon="Edit" @click.stop="handleEdit(item)" circle />
        <el-button type="danger" class="plaft_del" icon="Delete" circle @click.stop="handleDelete(item)" />
      </div>
      <div class="detail">
          <strong>{{ item.appName }}</strong>
        <div class="description">
        {{ item.describe }}
        </div>
      </div>
    </li>
  </div>
  <el-dialog
      v-model="dialogVisible"
      :title="title"
      width="50%"
      draggable
      destroy-on-close
      :before-close="handleClose"
  >
    <pro-form
        ref="formIns"
        v-model="form"
        :columns="columns"
        :menu="menu"
        label-width="100px"
        @submit="submit"
        @reset="reset"
    >
      <template #form-attach>
        <AlUpload v-model:fileList="fileList"
                  limit="1"
                  accept=".png,.jpg,.jpeg"
        />
      </template>
    </pro-form>
  </el-dialog>
</template>

<script setup>
import {
  defineFormColumns,
  defineFormMenuColumns,
  defineFormSubmit,
} from 'element-pro-components'
import {computed, nextTick, onMounted, ref, watchEffect} from "vue";
import {deptTreeSelect} from "@/api/system/user";
import {loopTree} from "@/utils";
import {getToken} from "@/utils/auth";
import {addPlatform, delPlatform, getPlatform, updatePlatform} from "@/api/informationManager/informationPlatform";
import {ElMessage, ElMessageBox} from "element-plus";
import {downloadFile, removeFile} from "@/api/tool/file";
const { proxy } = getCurrentInstance();
const headers = ref({Authorization: "Bearer " + getToken()});
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
const form = ref({attach:[]});
const formIns = ref();
let data = ref([]);
let fileList = ref([]);
let department = ref([]);
let dialogVisible = ref(false);
let type = ref('add');
let title = ref('新增平台');

const columns = defineFormColumns(computed(()=>[
  {
    label: '平台名称',
    prop: 'appName',
    component: 'el-input',
    props:{
      placeholder:'请输入平台名称'
    },
    rules: [{required: true, message: '请输入平台名称'}],
    md:12
  },
  {
    label: '平台地址',
    prop: 'appUrl',
    component: 'el-input',
    props:{
      placeholder:'请输入平台地址'
    },
    rules: [
        {required: true, message: '请输入平台地址'},
        {pattern:/(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%$#_]*)?/,message: '请输入正确平台地址'}
    ],
    md:12
  },
  {
    label: '账号',
    prop: 'account',
    component: 'el-input',
    props:{
      placeholder:'请输入账号',
    },
    md:12
  },
  {
    label: '密码',
    prop: 'password',
    component: 'el-input',
    props:{
      placeholder:'请输入密码',
      type:'password',
      'show-password':true
    },
    md:12
  },
  {
    label: '负责人',
    prop: 'chargePerson',
    component: 'el-input',
    props:{
      placeholder:'请输入负责人',
    },
    rules: [{required: true, message: '请输入负责人'}],
    md:12
  },
  {
    label: '负责人电话',
    prop: 'contactPhone',
    component: 'el-input',
    props:{
      placeholder:'请输入负责人电话',
    },
    rules: [{pattern:/^1[3-9]\d{9}$/,message:'请输入正确电话',trigger:'change'}],
    md:12
  },
  {
    label: '建成时间',
    prop: 'appTime',
    component: 'el-date-picker',
    props:{
      clearable:true,
      type:'month',
      style: {width: '100%'},
      placeholder:'请选择建成时间',
      'value-format':'YYYY-MM',
      format:'YYYY-MM',
    },
    md:12
  },
  {
    label: '所属单位',
    prop: 'deptId',
    component: 'el-tree-select',
    rules: [{required: true, message: '请选择所属单位'}],
    props:{
      data:department.value,
      'check-strictly':true,
      clearable:true,
      'default-expand-all':true,
      style: {width: '100%'},
      placeholder:'请选择所属单位',
    },
    md:12
  },
  {
    label: '描述',
    prop: 'describe',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder:'请输入描述',
    },
    md: 24,
  },
  {
    label:'备注',
    prop: 'remark',
    component: 'el-input',
    props:{
      autosize:{minRows:2},
      type:'textarea',
      placeholder: '请输入备注',
    },
    md: 24,
  },
  {
    label: '平台图片',
    prop: 'attach',
    md: 24,
  }
]))
const menu = defineFormMenuColumns({
  submitText: '确定',
  resetText:'关闭',
})

onMounted(()=>{
  // 获取部门
  deptTreeSelect().then(res=>{
    if(res.code){
      department.value = loopTree(res.data);
    }
  })
  getData();
})


const getData = () =>{
  // 获取所有平台
  getPlatform().then(res=>{
    if (res.success) {
      data.value = res.data.map(r=>{
        const atta = JSON.parse(r.attach);
        return{
          ...r,
          url:atta.length ? `${import.meta.env.VITE_FILE_URL}${atta[0].url}` : null
        }
      });
    }
  })
}

// 跳转到平台
const handleOpenPlaform = (row) => {
  window.open(row.appUrl)
}

// 新增平台
const handleAdd = () => {
  title.value = '新增平台'
  type.value = 'add';
  form.value = {};
  fileList.value = [];
  dialogVisible.value = true;
}

//编辑平台
const handleEdit = (row) => {
  fileList.value = row.attach;
  form.value = {...row};
  title.value = '编辑平台'
  type.value = 'edit';
  dialogVisible.value = true;
}

//删除平台
const handleDelete = (row) => {
  ElMessageBox.confirm(`是否确认删除平台？`, "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(() => {
    delPlatform(row.id).then(res => {
      if (res.success) {
        getData()
        ElMessage({
          message: '删除成功',
          type: 'success',
        });
      }
    });
  })
}

// 关闭弹框
const handleClose =() =>{
  form.value = {};
  fileList.value = [];
  dialogVisible.value = false;
}

// 表单提交
const submit = (done, isValid, invalidFields) => {
  if (isValid) {
    if (type.value == 'add'){
      addPlatform({
        ...form.value,
        attach:JSON.stringify(fileList.value),
      }).then(res=>{
        if (res.success) {
          ElMessage({
            message: '添加成功',
            type: 'success',
          });
          dialogVisible.value = false;
          getData();
        }
      })
    }else{
      updatePlatform(form.value.id,{
        ...form.value,
        attach: JSON.stringify(fileList.value),
      }).then(res=>{
        if (res.success) {
          ElMessage({
            message: '修改成功',
            type: 'success',
          });
          dialogVisible.value = false;
          getData();
        }
      })
    }

  }
  done()
}

const reset = () =>{
  dialogVisible.value = false;
}

</script>

<style scoped lang="scss">
.card-container{
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  padding: 10px;
  li{
    position: relative;
    width: calc(calc(100% / 4) - 20px);
    height: 350px;
    margin: 10px;
    background: #Fff;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    .img{
      position: relative;
      height: 200px;
      .plaft_edit{
        position: absolute;
        top: 10px;
        right: 50px;
      }
      .plaft_del{
        position: absolute;
        top: 10px;
        right: 5px;
      }
    }
    .detail{
      height: 150px;
      strong{
        display: block;
        height: 15%;
        width: 100%;
        text-align: center;
        margin-top: 0.3em;
        font-size: 15px;
      }
      .description{
        width:100%;
        height: 85%;
        padding: 0 10px;
        font-size: 15px;
        color: #afaaaa;
        word-break: break-all;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 5; /* 这里是超出几行省略 */
        overflow: hidden;
      }
    }
  }
}
</style>