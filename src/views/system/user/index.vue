<template>
   <div class="app-container">
      <el-row :gutter="20">
         <!--部门数据-->
         <el-col :span="4" :xs="24">
            <div class="head-container">
               <el-input
                  v-model="deptName"
                  placeholder="请输入部门名称"
                  clearable
                  prefix-icon="Search"
                  style="margin-bottom: 20px"
               />
            </div>
            <div class="head-container">
               <el-tree
                  :data="deptOptions"
                  :props="{ label: 'label', children: 'children' }"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  ref="deptTreeRef"
                  node-key="id"
                  highlight-current
                  default-expand-all
                  @node-click="handleNodeClick"
               />
            </div>
         </el-col>
         <!--用户数据-->
         <el-col :span="20" :xs="24">
            <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
               <el-form-item label="用户姓名" prop="realName">
                  <el-input
                     v-model="queryParams.realName"
                     placeholder="请输入用户姓名"
                     clearable
                     style="width: 240px"
                     @keyup.enter="handleQuery"
                  />
               </el-form-item>
               <el-form-item label="用户账号" prop="userName">
                  <el-input
                     v-model="queryParams.userName"
                     placeholder="请输入用户账号"
                     clearable
                     style="width: 240px"
                     @keyup.enter="handleQuery"
                  />
               </el-form-item>
               <el-form-item label="手机号码" prop="phoneNumber">
                  <el-input
                     v-model="queryParams.phoneNumber"
                     placeholder="请输入手机号码"
                     clearable
                     style="width: 240px"
                     @keyup.enter="handleQuery"
                  />
               </el-form-item>
               <el-form-item label="状态" clearable prop="status">
                  <el-select
                     v-model="queryParams.status"
                     placeholder="用户状态"
                     clearable
                     style="width: 240px"
                  >
                     <el-option
                        v-for="dict in sys_normal_disable"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                     />
                  </el-select>
               </el-form-item>
               <el-form-item label="创建时间" style="width: 308px;">
                  <el-date-picker
                     v-model="dateRange"
                     value-format="YYYY-MM-DD"
                     type="daterange"
                     clearable
                     range-separator="-"
                     start-placeholder="开始日期"
                     end-placeholder="结束日期"
                  ></el-date-picker>
               </el-form-item>
               <el-form-item>
                  <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                  <el-button icon="Refresh" @click="resetQuery">重置</el-button>
               </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
               <el-col :span="1.5">
                  <el-button
                     type="primary"
                     plain
                     icon="Plus"
                     @click="handleAdd"
                     v-hasPermi="['system:user:add']"
                  >新增</el-button>
               </el-col>
<!--               <el-col :span="1.5">-->
<!--                  <el-button-->
<!--                     type="success"-->
<!--                     plain-->
<!--                     icon="Edit"-->
<!--                     :disabled="single"-->
<!--                     @click="handleUpdate"-->
<!--                     v-hasPermi="['system:user:edit']"-->
<!--                  >修改</el-button>-->
<!--               </el-col>-->
               <el-col :span="1.5">
                  <el-button
                     type="danger"
                     plain
                     icon="Delete"
                     :disabled="multiple"
                     @click="handleDelete"
                     v-hasPermi="['system:user:remove']"
                  >删除</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="info"
                     plain
                     icon="Upload"
                     @click="handleImport"
                     v-hasPermi="['system:user:import']"
                  >导入</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="warning"
                     plain
                     icon="Download"
                     @click="handleExport"
                     v-hasPermi="['system:user:export']"
                  >导出</el-button>
               </el-col>
<!--               <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>-->
            </el-row>

            <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
               <el-table-column type="selection" width="50" align="center" :selectable="selectionChange"  />
               <el-table-column label="用户姓名" align="center" key="realName" prop="realName" v-if="columns[0].visible" />
               <el-table-column label="用户账号" align="center" key="userName" prop="userName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
               <el-table-column label="手机号码" align="center" key="phoneNumber" prop="phoneNumber" v-if="columns[2].visible" width="120" />
               <el-table-column label="职务" align="center" key="post" prop="post" v-if="columns[3].visible" :show-overflow-tooltip="true" />
               <el-table-column label="部门" align="center" key="deptName" prop="dept.deptName" v-if="columns[4].visible" width="220" :show-overflow-tooltip="true" />
               <el-table-column label="排序" align="center" key="sort" prop="sort"  v-if="columns[5].visible" :show-overflow-tooltip="true" />
               <el-table-column label="状态" align="center" key="status" v-if="columns[6].visible">
                  <template #default="scope">
                     <el-switch
                         :disabled="scope.row.userId == 1"
                        v-model="scope.row.status"
                        active-value="0"
                        inactive-value="1"
                        @change="handleStatusChange(scope.row)"
                     ></el-switch>
                  </template>
               </el-table-column>
               <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[7].visible" width="160">
                  <template #default="scope">
                     <span>{{ parseTime(scope.row.createTime) }}</span>
                  </template>
               </el-table-column>
               <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
                  <template #default="scope">
                      <el-button v-if="scope.row.userId !== 1" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']">修改</el-button>
                      <el-button v-if="scope.row.userId !== 1" link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']">删除</el-button>
                      <el-dropdown v-if="scope.row.userId !== 1" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['system:user:resetPwd', 'system:user:edit']" style="margin-top: 5px;margin-left: 5px;">
                          <el-button link type="success"  icon="DArrowRight">更多</el-button>
                          <template #dropdown>
                            <el-dropdown-menu teleported="true">
                                <el-dropdown-item command="handleResetPwd" icon="Key" type="warning"
                                v-hasPermi="['system:user:resetPwd']" teleported>重置密码</el-dropdown-item>
                                <el-dropdown-item command="handleAuthRole" icon="CircleCheck" type="success"
                                  v-hasPermi="['system:user:edit']" teleported>分配角色</el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                      </el-dropdown>
                      <!-- <el-button v-if="scope.row.userId !== 1" link type="warning" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']">重置密码</el-button>
                      <el-button v-if="scope.row.userId !== 1" link type="success" icon="CircleCheck" @click="handleAuthRole(scope.row)" v-hasPermi="['system:user:edit']">分配角色</el-button> -->
                  </template>
               </el-table-column>
            </el-table>
            <pagination
               v-show="total > 0"
               :total="total"
               v-model:page="queryParams.pageNum"
               v-model:limit="queryParams.pageSize"
               @pagination="getList"
            />
         </el-col>
      </el-row>

      <!-- 添加或修改用户配置对话框 -->
      <el-dialog :title="title" v-model="open" width="820px" append-to-body>
         <el-form :model="form" :rules="rules" ref="userRef" label-width="100px">
            <el-row>
              <el-col :span="12">
                 <el-form-item  label="真实姓名" prop="realName">
                   <el-input v-model="form.realName" placeholder="请输入真实姓名" maxlength="30" />
                 </el-form-item>
               </el-col>
             <el-col :span="12">
                 <el-form-item label="归属部门" prop="deptId">
                   <el-tree-select
                       v-model="form.deptId"
                       :data="deptOptions"
                       :props="{ value: 'id', label: 'label', children: 'children' }"
                       value-key="id"
                       default-expand-all
                       clearable
                       placeholder="请选择归属部门"
                       check-strictly
                   />
                 </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                 <el-form-item label="手机号码" prop="phoneNumber">
                   <el-input v-model="form.phoneNumber" placeholder="请输入手机号码" maxlength="11" />
                 </el-form-item>
               </el-col>
               <el-col :span="12">
               <el-form-item label="性别" prop="sex">
                 <el-select v-model="form.sex" clearable placeholder="请选择性别">
                   <el-option
                       v-for="dict in sys_user_sex"
                       :key="dict.value"
                       :label="dict.label"
                       :value="dict.value"
                   ></el-option>
                 </el-select>
               </el-form-item>
             </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                 <el-form-item v-if="form.userId == undefined" label="用户账号" prop="userName">
                   <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30" />
                 </el-form-item>
               </el-col>
               <el-col :span="12">
                 <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
                   <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20" show-password />
                 </el-form-item>
               </el-col>
            </el-row>
           <el-row>
            <el-col :span="12">
                 <el-form-item label="职务" prop="job">
                   <el-input v-model="form.job" placeholder="请输入职务" maxlength="50" />
                 </el-form-item>
               </el-col>
             <el-col :span="12">
               <el-form-item label="工号" prop="workNo">
                <el-input v-model="form.workNo" placeholder="请输入工号" maxlength="50" />
               </el-form-item>
             </el-col>
           </el-row>
           <el-row>
            <el-col :span="12">
                 <el-form-item label="邮箱" prop="email">
                   <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
                 </el-form-item>
               </el-col>
             <el-col :span="12">
               <el-form-item label="状态" prop="status">
                 <el-radio-group v-model="form.status">
                   <el-radio
                       v-for="dict in sys_normal_disable"
                       :key="dict.value"
                       :label="dict.value"
                   >{{ dict.label }}</el-radio>
                 </el-radio-group>
               </el-form-item>
             </el-col>
           </el-row>
            <el-row>
              <el-col :span="12">
                 <el-form-item label="岗位" prop="postIds">
                   <el-select v-model="form.postIds" clearable multiple placeholder="请选择岗位">
                     <el-option
                         v-for="item in postOptions"
                         :key="item.postId"
                         :label="item.postName"
                         :value="item.postId"
                         :disabled="item.status == 1"
                     ></el-option>
                   </el-select>
                 </el-form-item>
               </el-col>
              <el-col :span="12">
                <el-form-item label="角色" prop="roleIds">
                  <el-select v-model="form.roleIds" clearable multiple placeholder="请选择角色">
                    <el-option
                        v-for="item in roleOptions"
                        :key="item.roleId"
                        :label="item.roleName"
                        :value="item.roleId"
                        :disabled="item.status == 1"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                 <el-form-item label="排序" prop="sort">
                   <el-input-number v-model="form.sort" :min="1" controls-position="right" placeholder="请输入排序"></el-input-number>
                 </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                 <el-form-item label="备注" prop="remark">
                   <el-input v-model="form.remark" type="textarea" placeholder="请输入备注"></el-input>
                 </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 用户导入对话框 -->
      <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
         <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :action="upload.url + '?updateSupport=' + upload.updateSupport"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false"
            drag
         >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <template #tip>
               <div class="el-upload__tip text-center">
                  <div class="el-upload__tip">
                     <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
                  </div>
                  <span>仅允许导入xls、xlsx格式文件。</span>
                  <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
               </div>
            </template>
         </el-upload>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitFileForm">确 定</el-button>
               <el-button @click="upload.open = false">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="User">
import { getToken } from "@/utils/auth";
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from "@/api/system/user";
import {ElMessage} from "element-plus";
import useUserStore from "@/store/modules/user";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex");
const userStore = useUserStore();
const userList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const realNames = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const deptName = ref("");
const deptOptions = ref(undefined);
const initPassword = ref(undefined);
const postOptions = ref([]);
const roleOptions = ref([]);
/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/system/user/importData"
});
// 列显隐信息
const columns = ref([
  { key: 0, label: `用户姓名`, visible: true },
  { key: 1, label: `用户账号`, visible: true },
  { key: 2, label: `手机号码`, visible: true },
  { key: 3, label: `职务`, visible: true },
  { key: 4, label: `部门`, visible: true },
  { key: 5, label: `排序`, visible: true },
  { key: 6, label: `状态`, visible: true },
  { key: 7, label: `创建时间`, visible: false }
]);
console.log()
const data = reactive({
  form: {
    sort:1
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    realName: undefined,
    userName: undefined,
    phoneNumber: undefined,
    status: undefined,
    deptId: undefined
  },
  rules: {
    realName:[{ required: true, message: "用户姓名不能为空", trigger: "blur" }],
    userName: [{ required: true, message: "用户名称不能为空", trigger: "blur" }, { min: 2, max: 20, message: "用户名称长度必须介于 2 和 20 之间", trigger: "blur" }],
    deptId: [{ required: true, message: "请选择所属部门", trigger: "blur" }],
    password: [{ required: true, message: "用户密码不能为空", trigger: "blur" }, { min: 5, max: 20, message: "用户密码长度必须介于 6 和 20 之间", trigger: "blur" }],
    email: [{ type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }],
    phoneNumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" },{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur" }],
    roleIds: [{ required: true, message: "请输入选择角色", trigger: ["blur", "change"]}],
  }
});

const { queryParams, form, rules } = toRefs(data);

// 控制某行不能选中
const selectionChange = (row) =>{
  return  row.userId == 1 ? false : true;
}

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};
/** 根据名称筛选部门树 */
watch(deptName, val => {
  proxy.$refs["deptTreeRef"].filter(val);
});
/** 查询部门下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data;
  });
};
/** 查询用户列表 */
function getList() {
  loading.value = true;
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    loading.value = false;
    userList.value = res.rows;
    total.value = res.total;
  });
};
/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id;
  handleQuery();
};
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  queryParams.value.deptId = undefined;
  proxy.$refs.deptTreeRef.setCurrentKey(null);
  handleQuery();
};
/** 删除按钮操作 */
function handleDelete(row) {
  if( row.userId == 1){
    ElMessage({
      message: '超级管理员不允许删除',
      type: 'error',
    });
    return
  }
  const userIds = row.userId || ids.value;
  const userNames = row.realName || realNames.value;
  proxy.$modal.confirm('是否确认删除用户姓名为"' + userNames + '"的用户？').then(function () {
    return delUser(userIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
};
/** 导出按钮操作 */
function handleExport() {
  proxy.download("system/user/export", {
    ...queryParams.value,
  },`user_${new Date().getTime()}.xlsx`);
};
/** 用户状态修改  */
function handleStatusChange(row) {
  let text = row.status === "0" ? "启用" : "停用";
  proxy.$modal.confirm('确认要"' + text + '""' + row.realName + '"用户吗?').then(function () {
    return changeUserStatus(row.userId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "成功");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
};
/** 更多操作 */
function handleCommand(command, row) {
  switch (command) {
    case "handleResetPwd":
      handleResetPwd(row);
      break;
    case "handleAuthRole":
      handleAuthRole(row);
      break;
    default:
      break;
  }
};
/** 跳转角色分配 */
function handleAuthRole(row) {
  const userId = row.userId;
  router.push("/system/user-auth/role/" + userId);
};
/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy.$prompt('请输入"' + row.realName + '"的新密码', "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "用户密码长度必须介于 6 和 20 之间",
  }).then(({ value }) => {
    resetUserPwd(row.userId, value).then(response => {
      proxy.$modal.msgSuccess("修改成功，新密码是：" + value);
    });
  }).catch(() => {});
};
/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId).filter(r=> r.userId != 1);
  realNames.value = selection.map(item => item.realName).filter(r=> r.userId != 1);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};
/** 导入按钮操作 */
function handleImport() {
  upload.title = "用户导入";
  upload.open = true;
};
/** 下载模板操作 */
function importTemplate() {
  proxy.download("system/user/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`);
};
/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
};
/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};
/** 重置操作表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    password: undefined,
    realName:undefined,
    phoneNumber: undefined,
    email: undefined,
    sex: undefined,
    status: "0",
    sort:1,
    job: undefined,
    workNo: undefined,
    remark: undefined,
    postIds: [],
    roleIds: []
  };
  proxy.resetForm("userRef");
};
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
};
/** 新增按钮操作 */
function handleAdd() {
  reset();
  getUser().then(response => {
    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    open.value = true;
    title.value = "添加用户";
    form.value.password = initPassword.value;
  });
};
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const userId = row.userId || ids.value;
  getUser(userId).then(response => {
    form.value = response.data;
    postOptions.value = response.posts;
    roleOptions.value = response.roles;
    form.value.postIds = response.postIds;
    form.value.roleIds = response.roleIds;
    open.value = true;
    title.value = "修改用户";
    form.password = "";
  });
};
/** 提交按钮 */
function submitForm() {
  proxy.$refs["userRef"].validate(valid => {
    if (valid) {
      if (form.value.userId != undefined) {
        updateUser(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addUser(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
};

getDeptTree();
getList();
</script>
