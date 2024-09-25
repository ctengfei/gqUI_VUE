<template>
  <el-table :data="props.data" style="width: 100%">
    <el-table-column prop="examObjName" label="考核对象" align="center"/>
    <el-table-column prop="totalTempStandardScore" label="标准得分" align="center"/>
    <el-table-column prop="totalExamScore" label="考核得分" align="center"/>
    <el-table-column prop="examLevel" label="考核等级" align="center"/>
    <el-table-column prop="recordStatus" label="考核记录状态" align="center">
      <template #default="{row}">
        {{ formatterVal(row, 'task_status', 'recordStatus') }}
      </template>
    </el-table-column>
<!--    1、当前登录人是成员-->
<!--    评分-->
<!--    评分完成后按钮变为查看-->
<!--    所有人评分完成，按钮变为评分结果-->
<!--    不是成员-->
<!--    查看-->
<!--    所有人评分完成，按钮变为评分结果-->
    <el-table-column label="操作" align="center">
      <template #default="{row}">
        <el-button type="primary" icon="view" v-if="row.recordStatus == 2" text @click="handleScoringResult(row)">评分结果
        </el-button>
        <el-button type="primary" icon="edit"
                   v-if="row.isMember && row.recordStatus == 1 && !(row.userScoringCompleted)" text
                   @click="handleScoring(row)">评分
        </el-button>
        <el-button type="primary" icon="view" v-if="getFlag(row)"
                   @click="handleSearch(row)" text>查看
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-dialog
      v-model="dialogVisible1"
      :title="dialogTitle"
      width="50%"
      draggable
      append-to-body
  >
    <el-radio-group v-model="radio1" v-show="!(type == 'detail')">
      <el-radio label="1" size="large">显示全部</el-radio>
      <el-radio label="2" size="large">仅显示扣分项目</el-radio>
    </el-radio-group>
    <vxe-table
        ref="xTable"
        border
        :span-method="rowspanMethod"
        height="350"
        :data="vxeData"
    >
      <vxe-column field="examCategory" align="center" title="考核类目">
        <template #default="{ row }">
          {{ formatterVal(row, 'exam_category', 'examCategory') }}
        </template>
      </vxe-column>
      <vxe-column field="indexCode" align="center" title="指标编号"></vxe-column>
      <vxe-column field="indexName" align="center" title="指标名称">
        <template #default="{ row }">
          <el-popover
              placement="top-start"
              effect="dark"
              :width="200"
              trigger="hover"
              :content="row.indexDetailContent"
          >
            <template #reference>
              <a>{{ row.indexName }}</a>
            </template>
          </el-popover>
        </template>
      </vxe-column>
      <vxe-column field="totalStandardScore" align="center" title="标准分数"></vxe-column>
      <vxe-column field="score" align="center" :title="title" v-if="type == null">
        <template #default="{ row }">
          <vxe-input @change="changeVal" type="number" v-model="row.score"></vxe-input>
        </template>
      </vxe-column>
      <vxe-column field="problemDesc" align="center" title="问题描述" v-if="type == null">
        <template #default="{ row }">
          <vxe-input v-model="row.problemDesc" type="text"></vxe-input>
        </template>
      </vxe-column>
    </vxe-table>
    <template #footer>
      <span class="dialog-footer" v-if="type == null">
        <el-button type="primary" @click="handleSave">
          保存
        </el-button>
          <el-button type="primary" @click="handleDone">
          确认完成
        </el-button>
      </span>
      <span v-else>
        <el-button @click="dialogVisible1 = false">
          关闭
        </el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog
      v-model="dialogVisible2"
      title="评分结果"
      width="70%"
      draggable
      append-to-body
  >
    <el-radio-group v-model="radio2">
      <el-radio label="1" size="large">显示全部</el-radio>
      <el-radio label="2" size="large">仅显示扣分项目</el-radio>
    </el-radio-group>
    <vxe-table
        border
        :span-method="rowspanMethod"
        height="350"
        :data="vxeDates"
    >
      <vxe-column field="examCategory" align="center" title="考核类目">
        <template #default="{ row }">
          {{ formatterVal(row, 'exam_category', 'examCategory') }}
        </template>
      </vxe-column>
      <vxe-column field="indexCode" align="center" title="指标编号"></vxe-column>
      <vxe-column field="indexName" align="center" title="指标名称">
        <template #default="{ row }">
          <el-popover
              placement="top-start"
              effect="dark"
              :width="200"
              trigger="hover"
              :content="row.indexDetailContent"
          >
            <template #reference>
              <a>{{ row.indexName }}</a>
            </template>
          </el-popover>
        </template>
      </vxe-column>
      <vxe-column field="totalStandardScore" align="center" title="标准分数"></vxe-column>
      <vxe-column  v-for="user in users"  :field="user" align="center" :title="formatName(user)">
        <template #default="{ row }">
          <vxe-input :disabled="true" v-model="row[user]" align="center" type="text"></vxe-input>
        </template>
      </vxe-column>
      <vxe-colgroup  align="center" :title="totalAvgScore" width="250">
        <vxe-column field="avgScore" align="center" title="平均得分">
          <template #default="{ row }">
            <vxe-input :disabled="true" v-model="row.avgScore" align="center" type="text"></vxe-input>
          </template>
        </vxe-column>
      </vxe-colgroup>
    </vxe-table>
    <template #footer>
      <el-button @click="dialogVisible2 = false">
        关闭
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {
  defineCrudColumns,
  defineCrudMenuColumns,
  defineCrudSubmit,
  defineCrudSearch,
  defineFormColumns,
  defineTableIndexColumns,
  defineCrudBeforeOpen, defineCrudBeforeClose,
} from 'element-pro-components';
import {formatterVal} from '@/utils';
import {ref, reactive, onMounted, defineProps, watch, defineEmits} from "vue";
import useDictionaryStore from "@/store/modules/dictionary";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
import {getScoringObjId, getScoringResult, postBatchScoring} from "@/api/evaluationManager/evaluationTaskManager";

let dialogVisible1 = ref(false);
let dialogVisible2 = ref(false);
let radio1 = ref('1');
let radio2 = ref('1');
const xTable = ref({});
let vxeData = ref([]);
let vxeDates = ref([]);
let cloneData = ref([]);// 备份数据
let cloneDates = ref([]);
let title = ref('考核得分0');
let dialogTitle = ref('评分')
let type = ref(null);
let users = ref([]);
let totalAvgScore = ref('综合得分 （0）');
const props = defineProps(['data']);
const emit = defineEmits(['getData'])

watch(radio1, (dio) => {
  if (dio == 1) {
    vxeData.value = cloneData.value;
  } else {
    vxeData.value = vxeData.value.filter(r => r.score < r.totalStandardScore);
  }
  const totlaScore = vxeData.value.reduce((a, b) => {
    return a + (b.score || b.totalStandardScore);
  }, 0)
  title.value = `考核得分 (${totlaScore})`;
})
watch(radio2, (dio) => {
  if (dio == 1) {
    vxeDates.value = cloneDates.value;
  } else {
    if(users.length){
      vxeDates.value = vxeDates.value.filter(r => r[users.value[0]] < r.totalStandardScore ||  r[users.value[1]] < r.totalStandardScore);
    }
  }
})

const getFlag = row => {
  if(row.recordStatus == 2){ // 评分完成不显示查看
    return false;
  }
  if(row.recordStatus == 1 && !row.isMember){  //  如果评分中并且不是成员 显示查看
    return true;
  }
  if(row.isMember){ // 是成员
    if(row.userScoringCompleted){ // 当前登录人评分完成 显示查看
        return true;
    }else{
      return false
    }
  }
}

const formatName = name =>{
  return name.split('/')[1]
}

//评分结果
const handleScoringResult = (row) => {
  getScoringResult(row.id).then(res => {
    if (res.code == 200) {
      let list1 = res.data.indexInfoList;
      let list2 = res.data.userScoreMap;
      users.value = Object.keys(res.data.userScoreMap);
      let obj = {};
      users.value.forEach(c => {
        list1 = list1.map(r => {
          obj[c] = 0
          return {
            ...r,
            ...obj
          }
        })
      })
      list1.forEach(r => {
        for (const key in list2) {
          list2[key].forEach(c => {
            r[key] = c.score
          })
        }
      })
      for (let i = 0; i < list1.length; i++) {
        for (let key in list2) {
          if (list1[i].hasOwnProperty(key)) {
            list1[i][key] = list2[key][i].score;
          }
        }
      }
      vxeDates.value = list1;
      cloneDates.value = list1;
      totalAvgScore.value = `综合得分 (${res.data.totalAvgScore})`
      dialogVisible2.value = true;
    }
  })
}

// 点击评分
const handleScoring = (row) => {
  getScoringObjId(row.id).then(res => {
    if (res.code == 200) {
      vxeData.value = res.data.map(r => ({...r, score: r.score || r.totalStandardScore}));
      const totlaScore = res.data.reduce((a, b) => {
        return a + (b.score || b.totalStandardScore);
      }, 0)
      title.value = `考核得分 (${totlaScore})`;
      dialogVisible1.value = true;
      dialogTitle.value = '评分'
    }
  })
}

//点击查看
const handleSearch = (row) => {
  getScoringObjId(row.id).then(res => {
    if (res.code == 200) {
      vxeData.value = res.data.map(r => ({...r, score: r.score || r.totalStandardScore}));
      cloneData.value = vxeData.value;
      const totlaScore = res.data.reduce((a, b) => {
        return a + (b.score || b.totalStandardScore);
      }, 0)
      title.value = `考核得分 (${totlaScore})`;
      type.value = 'detail';
      dialogVisible1.value = true;
      dialogTitle.value = '查看'
    }
  })
}

// 监听总考核得分
const changeVal = (val) => {
  const $table = xTable.value;
  if ($table) {
    const {tableData} = $table.getTableData();
    const totlaScore = tableData.reduce((a, b) => {
      return a + parseFloat(b.score || 0);
    }, 0)
    title.value = `考核得分 (${totlaScore})`;
  }
}

// 保存
const handleSave = () => {
  const $table = xTable.value;
  if ($table) {
    const {tableData} = $table.getTableData();
    let dates = tableData.map(r => {
      return {
        examObjInfoId: r.examObjInfoId,
        indexId: r.indexId,
        problemDesc: r.problemDesc,
        score: r.score,
        id: r.id,
        createById: r.createById,
        deductPoints: r.totalStandardScore - (r.score || 0),
        scoreStatus: '1'
      }
    })
    postBatchScoring(dates).then(res => {
      if (res.success) {
        ElMessage({
          message: '保存成功',
          type: 'success',
        });
        dialogVisible1.value = false;
        type.value = null;
      }
    })
  }

}

// 完成
const handleDone = () => {
  const $table = xTable.value;
  if ($table) {
    const {tableData} = $table.getTableData();
    let dates = tableData.map(r => {
      return {
        examObjInfoId: r.examObjInfoId,
        indexId: r.indexId,
        problemDesc: r.problemDesc,
        score: r.score,
        id: r.id,
        createById: r.createById,
        deductPoints: r.totalStandardScore - (r.score || 0),
        scoreStatus: '2'
      }
    })
    postBatchScoring(dates).then(res => {
      if (res.success) {
        ElMessage({
          message: '评分完成',
          type: 'success',
        });
        emit('getData')
        dialogVisible1.value = false;
        type.value = null;
      }
    })
  }

}

// 合并相同数据行
const rowspanMethod = ({row, _rowIndex, column, visibleData}) => {
  const fields = ['examCategory']
  const cellValue = row[column.field]
  if (cellValue && fields.includes(column.field)) {
    const prevRow = visibleData[_rowIndex - 1]
    let nextRow = visibleData[_rowIndex + 1]
    if (prevRow && prevRow[column.field] === cellValue) {
      return {rowspan: 0, colspan: 0}
    } else {
      let countRowspan = 1
      while (nextRow && nextRow[column.field] === cellValue) {
        nextRow = visibleData[++countRowspan + _rowIndex]
      }
      if (countRowspan > 1) {
        return {rowspan: countRowspan, colspan: 1}
      }
    }
  }
}

</script>

<style scoped lang="scss">

</style>