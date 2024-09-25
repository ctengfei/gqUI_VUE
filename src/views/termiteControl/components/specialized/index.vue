<template>
  <div class="container">
    <div class="topBox">
      <GroupLine title="防治基本信息" />
      <el-form
        ref="menuRef1"
        :disabled="type === 'detail'"
        :model="form"
        label-width="160px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="tt">
              <template #label>
                <span>
                  修正危害等级
                  <el-tooltip placement="top">
                    <template #content>
                      I 级：开挖成年巢≤1个；主巢腔直径 ≤25
                      cm，蚁后体长≤30mm。<br />
                      II 级：连续两年开挖成年巢＞3个；
                      25cm≤主巢腔直径≤35cm，30mm≤蚁 后体长≤50cm。<br />
                      III 级：开挖成年巢＞5个；主巢腔
                      直径＞35cm，蚁后体长＞30cm；定 性贯穿蚁道。
                    </template>
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-select v-model="form.tt" style="width: 100%">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="extent">
              <template #label>
                <span> 防治单位 </span>
              </template>
              <el-input v-model="form.loc" placeholder="请输入防治单位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="waterfront">
              <template #label>
                <span> 责任人 </span>
              </template>
              <el-input v-model="form.loc" placeholder="请输入责任人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="waterfront">
              <template #label>
                <span> 防治经费(元) </span>
              </template>
              <el-input
                v-model="form.loc"
                type="number"
                placeholder="请输入防治经费(元)"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="centerBox">
      <GroupLine title="挖巢治理" />
      <el-form
        ref="menuRef2"
        :model="form"
        :disabled="type === 'detail'"
        label-width="160px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="unit">
              <template #label>
                <span> 药品名称 </span>
              </template>
              <el-input v-model="form.unit" placeholder="请输入药品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="unit">
              <template #label>
                <span> 药品剂型 </span>
              </template>
              <el-input v-model="form.unit" placeholder="请输入药品剂型" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="unit">
              <template #label>
                <span> 包装式样 </span>
              </template>
              <el-input v-model="form.unit" placeholder="请输入包装式样" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="unit">
              <template #label>
                <span> 使用数量 </span>
              </template>
              <el-input
                v-model="form.unit"
                type="number"
                placeholder="请输入使用数量"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="unit">
              <template #label>
                <span> 使用浓度 </span>
              </template>
              <el-input v-model="form.unit" placeholder="请输入使用浓度" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="unit">
              <template #label>
                <span> 单巢用药量(m³) </span>
              </template>
              <el-input
                v-model="form.unit"
                type="number"
                placeholder="请输入单巢用药量(m³)"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="unit">
              <template #label>
                <span> 总用药量(m³) </span>
              </template>
              <el-input
                v-model="form.unit"
                type="number"
                placeholder="请输入总用药量(m³)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="unit">
              <template #label>
                <span> 挖巢数量(个) </span>
              </template>
              <el-input
                v-model="form.unit"
                type="number"
                placeholder="请输入挖巢数量(个)"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="unit">
              <template #label>
                <span> 治理记录 </span>
              </template>
              <el-button
                type="primary"
                v-if="type !== 'detail'"
                @click="dialogVisible = true"
                >添加</el-button
              >
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <pro-table
        :data="tableData"
        :columns="columns"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :index="index"
        :disabled="type === 'detail'"
      >
        <template #menu="{ size, row }" v-if="type !== 'detail'">
          <el-button :size="size" type="primary" @click="handleEdit(row)" link>
            编辑
          </el-button>
          <el-popconfirm title="确定删除吗" @confirm="handleDelete(row)">
            <template #reference>
              <el-button link :size="size" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </pro-table>
    </div>
    <div class="bottomBox">
      <GroupLine title="化学防治" />
      <GroupLine title="喷洒" :sub="true" />
      <el-form
        ref="menuRef3"
        :model="form"
        :disabled="type === 'detail'"
        label-width="160px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item prop="loc3">
              <template #label>
                <span>
                  桩号范围(m): 起
                  <el-tooltip placement="top">
                    <template #content>
                      桩号由公里数和米数构成，格式：字母(可省)<br />+公里数+“+”+米数(3位数字，不足前面自动补0)，<br />例：10+120，z10+012
                    </template>
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.loc3" placeholder="请输入起桩号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="loc4">
              <template #label>
                <span>
                  止
                  <el-tooltip placement="top">
                    <template #content>
                      桩号由公里数和米数构成，格式：字母(可省)<br />+公里数+“+”+米数(3位数字，不足前面自动补0)，<br />例：10+120，z10+012
                    </template>
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.loc4" placeholder="请输入止桩号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="高程范围(m)">
              <el-col :span="11">
                <el-input type="number" v-model="form.num1" />
              </el-col>
              <el-col :span="2" class="text-center">
                <span class="text-gray-500">-</span>
              </el-col>
              <el-col :span="11">
                <el-input type="number" v-model="form.num2" />
              </el-col>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="num">
              <template #label>
                <span>施药总面积(㎡)</span>
              </template>
              <el-input type="number" v-model="form.num" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="time" label="施药时间">
              <el-date-picker
                style="width: 100%"
                v-model="form.time"
                type="datetime"
                placeholder="选择施药时间"
                format="YYYY/MM/DD hh:mm"
                value-format="YYYY-MM-DD h:m"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="type" label="打孔天气">
              <el-select v-model="form.type" style="width: 100%">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="num" label="孔间距">
              <el-input placeholder="请输入孔间距" v-model="form.num1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="num" label="孔行距">
              <el-input placeholder="请输入孔行距" v-model="form.num" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="num" label="打孔深度">
              <el-input placeholder="请输入打孔深度" v-model="form.num1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="num" label="打孔数量">
              <el-input
                type="number"
                placeholder="请输入打孔数量"
                v-model="form.num"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="num" label="药品名称">
              <el-input placeholder="请输入药品名称" v-model="form.num1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="num" label="药品剂型">
              <el-input placeholder="请输入药品剂型" v-model="form.num" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="num" label="包装式样">
              <el-input placeholder="请输入包装式样" v-model="form.num1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="num" label="使用数量">
              <el-input
                type="number"
                placeholder="请输入使用数量"
                v-model="form.num"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="num" label="使用浓度">
              <el-input placeholder="请输入使用浓度" v-model="form.num1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="num" label="单孔灌药量(m³)">
              <el-input
                type="number"
                placeholder="请输入单孔灌药量"
                v-model="form.num"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item prop="num" label="总用药量(m³)">
              <el-input
                type="number"
                placeholder="请输入总用药量"
                v-model="form.num"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="footer">
      <GroupLine title="其它措施" />
      <el-form
        ref="menuRef3"
        :model="form"
        :disabled="type === 'detail'"
        label-width="160px"
      >
        <el-form-item prop="remark" label="其它措施">
          <el-input
            type="textarea"
            v-model="form.remark"
            placeholder="请输入其它措施"
          />
        </el-form-item>
      </el-form>
    </div>
    <governDialog
      title="挖巢治理记录"
      :dialogVisible="dialogVisible"
      @closeDialog="closeDialog"
    />
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, reactive, defineExpose } from "vue";
import GroupLine from "../groupLine";
import governDialog from "../governDialog";
import {
  defineTableColumns,
  defineTableMenuColumns,
  defineTableIndexColumns,
} from "element-pro-components";
const { type } = defineProps(["type"]);
let form = ref({});
const dialogVisible = ref(false); //弹窗显隐
const options = reactive([{ label: "11", value: "11" }]);
const columns = defineTableColumns([
  {
    label: "起止时间",
    prop: "date",
  },
  {
    label: "主巢桩号和高程位置",
    prop: "elevation",
    width: 160,
  },
  {
    label: "主巢腔直径(cm)",
    prop: "type",
  },
  {
    label: "副巢数量(个)",
    prop: "num",
  },
  {
    label: "蚁后长度(mm)",
    prop: "method",
  },
  {
    label: "有无繁殖蚁",
    prop: "method1",
  },
]);
const index = defineTableIndexColumns({
  label: "序号",
  width: 50,
});
let tableData = ref([{ num: 1 }]);
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(1);
// 删除按钮操作
const handleDelete = (row) => {
  console.log(row);
};
// 编辑按钮操作
const handleEdit = (row) => {
  dialogVisible.value = true;
};
const closeDialog = () => {
  dialogVisible.value = false;
};
defineExpose({
  specializedData: {
    formData: form.value,
    tableData: tableData.value,
  },
});
</script>

<style lang="scss">
@import "./index.scss";
</style>

