<template>
  <div class="app-container">
    <div class="search-box">
      <el-input
        v-model="input"
        style="width: 50%"
        placeholder="请输入文件名称"
        size="large"
      >
        <template #append
          ><el-icon @click="handleChangeInput" style="font-size: 20px"
            ><Search /></el-icon
        ></template>
      </el-input>
    </div>
    <div class="filter-box">
      <div class="rg">
        <el-button
          type="primary"
          plain
          icon="Upload"
          @click="dialogVisible = true"
          >上传</el-button
        >
      </div>
    </div>
    <vxe-table
      ref="xTable"
      :data="tableData"
      align="center"
      header-row-class-name="vxe-rowClass"
      :seq-config="{ startIndex: 0 }"
      :edit-config="{ trigger: 'manual', mode: 'row' }"
    >
      <vxe-column type="seq" width="auto" title="序号"></vxe-column>
      <vxe-column
        field="fileName"
        width="55%"
        title="文件名称"
        :edit-render="{}"
      >
        <template #edit="{ row }">
          <vxe-input v-model="row.fileName" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="createBy" width="auto" title="上传人"> </vxe-column>
      <vxe-column field="createTime" width="10%" title="上传时间"> </vxe-column>
      <vxe-column title="操作" width="20%">
        <template #default="{ row }">
          <template v-if="isActiveStatus(row)">
            <vxe-button
              style="color: #409eff"
              type="text"
              @click="saveRowEvent(row)"
              >保存</vxe-button
            >
            <vxe-button
              style="color: #f56c6c"
              type="text"
              @click="cancelRowEvent(row)"
              >取消</vxe-button
            >
          </template>
          <template v-else>
            <vxe-button
              style="color: var(--el-color-primary)"
              icon="vxe-icon-edit"
              type="text"
              @click="editRowEvent(row)"
              >修改</vxe-button
            >
            <vxe-button
              style="color: #f56c6c"
              icon="vxe-icon-delete"
              type="text"
              @click="deleteRowEvent(row)"
              >删除</vxe-button
            >
            <vxe-button
              style="color: #67c23a"
              icon="vxe-icon-eye-fill"
              type="text"
              v-if="
                ['png', 'jpg', 'jpeg'].includes(row.fileType) &&
                row.filePath
              "
              @click="downloadPreviewEvent(row.filePath)"
              >预览</vxe-button
            >
            <vxe-button
              style="color: #67c23a"
              icon="vxe-icon-download"
              type="text"
              @click="downloadRowEvent(row)"
              >下载</vxe-button
            >
          </template>
        </template>
      </vxe-column>
    </vxe-table>
    <vxe-pager
      :layouts="['PrevPage', 'Number', 'NextPage', 'FullJump']"
      :current-page="tablePage.pageNum"
      :page-size="tablePage.pageSize"
      style="margin-top: 10px"
      size="mini"
      :total="tablePage.total"
      @page-change="handlePageChange"
    >
    </vxe-pager>
  </div>
  <el-dialog
    v-model="dialogVisible"
    title="上传文件"
    width="40%"
    draggable
    destroy-on-close
    :before-close="handleClose"
  >
    <el-upload
      drag
      :headers="headers"
      multiple
      limit="10"
      :before-upload="beforeChange"
      :action="uploadFileUrl"
      :data="params"
      :on-success="handleSuccess"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">单击或拖动文件到此区域进行上传</div>
    </el-upload>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleClose"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { VXETable } from "vxe-table";
import dayjs from "dayjs";
import {
  addOperateApi,
  getOperateListApi,
  delOperateApi,
  editOperateApi,
} from "../apis";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import { getToken } from "@/utils/auth";
import { downloadFile, removeFile, uploadFile } from "@/api/tool/file";
const {proxy} = getCurrentInstance();
const input = ref("");
const index = ref(1);
let tableData = ref([]);
const xTable = ref();
let params = reactive(null);
let dialogVisible = ref(false);
const headers = ref({ Authorization: "Bearer " + getToken() });
const uploadFileUrl = ref(import.meta.env.VITE_APP_BASE_API + "/file/eos/upload"); // 上传文件服务器地址
const tablePage = reactive({
  total: 10,
  pageNum: 1,
  pageSize: 10,
});
let datetime = ref(dayjs().format("YYYY-MM-DD"));
let total = ref(0);
const date = ref([]);

function handlePageChange({ currentPage, pageSize }) {
  tablePage.pageNum = currentPage;
  tablePage.pageSize = 10;
}

function handleChangeInput() {
  getData();
}

const isActiveStatus = (row) => {
  const $table = xTable.value;
  if ($table) {
    return $table.isEditByRow(row);
  }
};

const editRowEvent = (row) => {
  const $table = xTable.value;
  if ($table) {
    $table.setEditRow(row);
  }
};

const saveRowEvent = (row) => {
  const $table = xTable.value;
  if ($table) {
    $table.clearEdit().then(() => {
      const { fileId, fileName, filePath, fileType } = row;
      const params = {
        fileId,
        fileName,
        filePath,
        fileType,
      };
      editOperateApi(row.id, params).then((res) => {
        getData();
        ElMessage({
          message: "修改成功",
          type: "success",
        });
      });
    });
  }
};

const cancelRowEvent = (row) => {
  const $table = xTable.value;
  if ($table) {
    $table.clearEdit().then(() => {
      // 还原行数据
      $table.revertData(row);
    });
  }
};

onMounted(() => {
  getData();
});

watch(index, (i) => {
  getData();
});

const getData = () => {
  getOperateListApi({
    fileName: input.value,
    pageNum: tablePage.pageNum,
    pageSize: tablePage.pageSize,
  }).then((res) => {
    if (res.success) {
      tablePage.total = res.data.total;
      tableData.value = res.data.data;
    }
  });
};

const deleteRowEvent = (row) => {
  ElMessageBox.confirm(`是否确认删除文件？`, "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // 删词库中记录
    delOperateApi(row.id).then((res) => {
      if (res.success) {
        getData();
        // 删除服务器上的文件
        removeFile(row.fileId).then((res) => {
          if (res.success) {
            ElMessage({
              message: "删除成功",
              type: "success",
            });
          }
        });
      }
    });
  });
};

const beforeChange = (rawFile) => {
  if (rawFile.name.includes("~")) {
    ElMessage({
      message: '文件名不能包含 "~"',
      type: "error",
    });
    return false;
  }
  return true;
};

const handleSuccess = (res) => {
  if (res.success) {
    const file = res.data;
    addOperateApi({
      fileId: file.id,
      fileName: file.name,
      filePath: file.storagePath,
      fileType: file.fileSuffix,
    }).then((res) => {
      if (res.success) {
        ElMessage({
          message: "上传成功",
          type: "success",
        });
      }
    });
  }
};

const handleClose = () => {
  getData();
  dialogVisible.value = false;
};

const downloadRowEvent = (row) => {
  const id = row.fileId;
  downloadFile(id).then((res) => {
    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", row.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};

const downloadPreviewEvent = (url) =>{
  proxy.$v3ImgPreviewFn(`${import.meta.env.VITE_FILE_URL}${url}`);
}
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>