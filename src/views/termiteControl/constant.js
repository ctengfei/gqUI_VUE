import logImg from "@/assets/images/log.png";
import spiderImg from "@/assets/images/spider.png";
import administerImg from "@/assets/images/administer.png";
import moneyImg from "@/assets/images/money.png";
import { formatterVal } from "@/utils";

export const recordColumns = [
  {
    width: 260,
    label: "检查时间",
    prop: "checkTime",
    render: (row) => {
      const { checkStartTime, checkEndTime } = row || {};
      return `${checkStartTime}至${checkEndTime}`;
    },
  },
  {
    label: "桩号范围",
    prop: "loc",
    render: (row) => {
      const { bnchStartLoc, bnchEndLoc } = row || {};
      return `${bnchStartLoc || ""}~${bnchEndLoc || ""}`;
    },
  },
  {
    label: "检查地点或部位",
    prop: "checkPos",
  },
  {
    label: "检查单位",
    prop: "checkUnitName",
  },
  {
    label: "检查负责人及参与人员",
    prop: "person",
    render: (row) => {
      const { checkPsnChrg, partiName } = row || {};
      return partiName ? `${checkPsnChrg},${partiName}` : `${checkPsnChrg}`;
    },
  },
];
export const recordMenu = {
  label: "操作",
  add: false,
  edit: true,
  detail: true,
  del: false,
  reset: false, //弹窗内的取消按钮
  fixed: "right",
  addText: "新增",
  detailText: "查看",
  width: "360",
  addProps: {
    type: "primary",
    plain: true,
    icon: "Plus",
  },
  editProps: {
    link: true,
    type: "primary",
    icon: "Edit",
  },
  detailProps: {
    link: true,
    type: "primary",
    icon: "View",
  },
  searchResetProps: {
    icon: "Refresh",
  },
  searchProps: {
    type: "primary",
    icon: "Search",
  },
  delText: "删除",
  editText: "修改",
  searchText: "查询",
  searchResetText: "重置",
  submitText: "提交",
  resetText: "取消",
};
export const tabsData = [
  { label: "基本情况", name: 1 },
  { label: "蚁患区检查情况", name: 2 },
  // { label: "随检防治情况", name: 3 },
  // { label: "专门防治情况", name: 4 },
];
export const followUpColumns = [
  {
    label: "药品名称",
    prop: "unit",
    component: "el-input",
    props: {
      placeholder: "请输入药品名称",
    },
    md: 12,
  },
  {
    label: "药品剂型",
    prop: "address",
    component: "el-input",
    props: {
      placeholder: "请输入药品剂型",
    },
    md: 12,
  },
  {
    label: "包装式样",
    prop: "person",
    component: "el-input",
    props: {
      placeholder: "请输入包装式样",
    },
    md: 12,
  },
  {
    label: "使用数量",
    prop: "person4",
    component: "el-input",
    props: {
      type: "number",
      placeholder: "请输入使用数量",
    },
    md: 12,
  },
  {
    label: "使用浓度",
    prop: "range2",
    component: "el-input",
    props: {
      placeholder: "请输入使用浓度",
    },
    md: 12,
  },
  {
    label: "总用药量(m³)",
    prop: "person4",
    component: "el-input",
    props: {
      type: "number",
      placeholder: "请输入总用药量(m³)",
    },
    md: 12,
  },
  {
    label: "施药方式",
    prop: "person2",
    component: "el-input",
    props: {
      placeholder: "请输入施药方式",
    },
    md: 12,
  },
  {
    label: "描述",
    prop: "remark",
    component: "el-input",
    props: {
      type: "textarea",
      placeholder: "请输入描述",
    },
    md: 24,
  },
];
export const PROJECT_TYPE = [
  { name: "防治日志", value: 0, icon: logImg, key: "logNum" },
  {
    name: "发现危害",
    value: 0,
    icon: spiderImg,
    unit: "处",
    key: "hazardTotalNum",
  },
  // {
  //   name: "挖巢治理",
  //   value: 0,
  //   icon: administerImg,
  //   unit: "次",
  //   key: "administer",
  // },
  // { name: "防治经费", value: 0, icon: moneyImg, unit: "元", key: "money" },
];
export const statisticsColumns = [
  {
    label: "检查地点或部位",
    prop: "checkPos",
  },
  {
    label: "检查单位",
    prop: "checkUnitName",
  },
  {
    label: "危害范围（桩号）",
    prop: "bnchLoc",
  },
  {
    label: "危害处数",
    prop: "hazardNum",
    width: "100px",
  },
  {
    label: "危害程度",
    prop: "hazardDegree",
    render: (row) => {
      return formatterVal(row, "HAZARD_DEGREE", "hazardDegree");
    },
  },
  {
    label: "是否临水",
    prop: "bywater",
    render: (row) => {
      return formatterVal(row, "IS_FACING_WATER", "bywater");
    },
  },
  {
    label: "危害描述",
    prop: "hazardDesc",
  },
];
export const statisticsMenu = {
  label: "操作",
  add: false,
  edit: false,
  detail: true,
  del: false,
  reset: false, //弹窗内的取消按钮
  fixed: "right",
  detailText: "查看",
  width: "80",
  detailProps: {
    link: true,
    type: "primary",
    icon: "View",
  },
  searchResetProps: {
    icon: "Refresh",
  },
  searchProps: {
    type: "primary",
    icon: "Search",
  },
  delText: "删除",
  searchText: "查询",
  searchResetText: "重置",
  submitText: "提交",
  resetText: "取消",
};
