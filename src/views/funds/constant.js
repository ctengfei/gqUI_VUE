import overviewImg from "@/assets/images/overview.png";
import completedImg from "@/assets/images/completed.png";
import buildingImg from "@/assets/images/building.png";
import noConstructionStartedImg from "@/assets/images/noConstructionStarted.png";
import moneyImg from "@/assets/images/money.png";
import completionRateImg from "@/assets/images/completionRate.png";
import { formatterVal } from "@/utils";
import BigNumber from "bignumber.js";

export const PROJECT_TYPE = [
  { name: "资金项目总数", value: 0, icon: overviewImg, key: "totalNum" },
  { name: "已完工项目", value: 0, icon: completedImg, key: "completedNum" },
  { name: "在建项目", value: 0, icon: buildingImg, key: "buildingNum" },
  {
    name: "未开工项目",
    value: 0,
    icon: noConstructionStartedImg,
    key: "notStartedNum",
  },
];
export const PAYMENT_TYPE = [
  PROJECT_TYPE[0],
  PROJECT_TYPE[2],
  {
    name: "在建项目完成投资",
    value: 0,
    icon: moneyImg,
    unit: "万元",
    key: "buildingPay",
  },
  {
    name: "在建项目投资完成率",
    value: 0,
    icon: completionRateImg,
    unit: "%",
    key: "buildingRate",
  },
];
const common = (deptOptions, projectTypeData) => [
  {
    label: "项目名称",
    prop: "projectName",
    component: "el-input",
    props: {
      maxlength: "50",
      placeholder: "请输入项目名称",
    },
    search: true,
  },
  {
    label: "项目编码",
    prop: "projectCode",
  },
  {
    label: "项目类型",
    prop: "projectType",
    component: "pro-select",
    props: {
      clearable:true,
      data: projectTypeData || [],
      style: { width: "100%" },
    },
    render: (row) => {
      return formatterVal(row, "project_type_list", "projectType");
    },
    search: true,
  },
  {
    label: "管理单位",
    prop: "manUnitId",
    component: "el-tree-select",
    props: {
      data: deptOptions || [],
      style: { width: "100%" },
      checkStrictly: true,
      clearable:true,
      valueKey: "id",
      "default-expand-all": true,
    },
    render: (row) => {
      return row.manUnitName;
    },
    search: true,
    width: "160px",
  },
];
export const projectColumns = (
  deptOptions,
  projectStateData,
  projectTypeData
) => {
  return [
    ...common(deptOptions, projectTypeData),
    {
      label: "资金预算执行进度",
      prop: "budgetFundProgress",
      render: (row) => row.budgetFundProgress && `${row.budgetFundProgress}%`,
    },
    {
      label: "启动日期",
      prop: "projectDate",
      component: "el-date-picker",
      props: {
        clearable:true,
        type: "daterange",
        "start-placeholder": "开始时间",
        "end-placeholder": "结束时间",
        "value-format": "YYYY-MM-DD",
      },
      search: true,
      hide: true,
    },
    {
      label: "启动日期",
      prop: "projectStartDate",
    },
    {
      label: "计划完成日期",
      prop: "planCompDate",
    },
    {
      label: "项目状态",
      prop: "projectStatus",
      component: "pro-select",
      props: {
        clearable:true,
        data: projectStateData || [],
        style: { width: "100%" },
      },
      render: (row) => {
        return formatterVal(row, "project_status", "projectStatus");
      },
      search: true,
    },
  ];
};
export const paymentColumns = (
  deptOptions,
  projectStateData,
  projectTypeData
) => [
  ...common(deptOptions, projectTypeData),
  {
    label: "填报日期",
    prop: "projectDate",
    component: "el-date-picker",
    props: {
      clearable:true,
      type: "daterange",
      "start-placeholder": "开始时间",
      "end-placeholder": "结束时间",
      "value-format": "YYYY-MM-DD",
    },
    search: true,
    hide: true,
  },
  {
    label: "项目状态",
    prop: "projectStatus",
    component: "pro-select",
    props: {
      clearable:true,
      data: projectStateData || [],
      style: { width: "100%" },
    },
    render: (row) => {
      return formatterVal(row, "project_status", "projectStatus");
    },
    search: true,
  },
  {
    label: "累计资金预算执行进度",
    prop: "totalRate",
    render: (row) => row.totalRate && `${row.totalRate}%`,
    width: "160px",
  },
  {
    label: "本期资金投入(万元)",
    prop: "currPay",
    width: "160px",
  },
  {
    label: "累计至当期资金投入(万元)",
    prop: "totalCurrPay",
    width: "180px",
  },
  {
    label: "填报日期",
    prop: "fillDate",
  },
  {
    label: "启动日期",
    prop: "projectStartDate",
  },
];
export const projectMenu = {
  label: "操作",
  add: false,
  edit: false,
  detail: true,
  del: false,
  reset: false, //弹窗内的取消按钮
  fixed: "right",
  detailText: "查看",
  width: "240",
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
  searchText: "搜索",
  searchResetText: "重置",
  submitText: "提交",
};
export const infoColumns = (projectStateData, projectTypeData, form) => [
  {
    label: "项目名称",
    prop: "projectName",
    component: "el-input",
    props: {
      maxlength: "50",
      placeholder: "请输入项目名称",
    },
    md: 12,
  },
  {
    label: "项目编码",
    prop: "projectCode",
    component: "el-input",
    props: {
      maxlength: "20",
      placeholder: "请输入项目编码",
    },
    md: 12,
  },
  {
    label: "项目类型",
    prop: "projectType",
    component: "pro-select",
    props: {
      clearable:true,
      data: projectTypeData || [],
      style: { width: "100%" },
    },
    md: 12,
  },
  {
    label: "项目状态",
    prop: "projectStatus",
    component: "pro-select",
    props: {
      data: projectStateData || [],
      style: { width: "100%" },
    },
    md: 12,
  },
  {
    label: "管理单位",
    prop: "manUnitId",
    md: 12,
  },
  {
    label: "项目启动日期",
    prop: "projectStartDate",
    component: "el-date-picker",
    props: {
      clearable:true,
      style: { width: "100%" },
      type: "date",
      "value-format": "YYYY-MM-DD",
    },
    md: 12,
  },
  {
    label: "计划完成日期",
    prop: "planCompDate",
    component: "el-date-picker",
    props: {
      clearable:true,
      style: { width: "100%" },
      type: "date",
      "value-format": "YYYY-MM-DD",
    },
    md: 12,
  },
  {
    label: "资金预算合计(万元)",
    prop: "totalFunds",
    component: "el-input",
    props: {
      disabled: true,
    },
    render: (row) => {
      return row.centerAidFunds;
    },
    md: 12,
  },
  {
    label: "中央补助资金(万元)",
    prop: "centerAidFunds",
    component: "el-input-number",
    props: {
      min: 0,
      max: 999999,
      precision: 2,
      placeholder: "",
      style: { width: "100%" },
      "controls-position": "right",
      onInput: (val) => {
        const { localFinancialFunds, investmentFunds } = form.value || {};
        const num = new BigNumber(val);
        form.value.totalFunds = num
          .plus(localFinancialFunds || 0)
          .plus(investmentFunds || 0)
          .toFixed(2);
      },
    },
    md: 12,
  },
  {
    label: "地方财政资金(万元)",
    prop: "localFinancialFunds",
    component: "el-input-number",
    props: {
      min: 0,
      max: 999999,
      precision: 2,
      style: { width: "100%" },
      "controls-position": "right",
      onInput: (val) => {
        const { centerAidFunds, investmentFunds } = form.value || {};
        const num = new BigNumber(val);
        form.value.totalFunds = num
          .plus(centerAidFunds || 0)
          .plus(investmentFunds || 0)
          .toFixed(2);
      },
    },
    md: 12,
  },
  {
    label: "投工投劳资金(万元)",
    prop: "investmentFunds",
    component: "el-input-number",
    props: {
      min: 0,
      max: 999999,
      precision: 2,
      style: { width: "100%" },
      "controls-position": "right",
      onInput: (val) => {
        const { centerAidFunds, localFinancialFunds } = form.value || {};
        const num = new BigNumber(val);
        form.value.totalFunds = num
          .plus(centerAidFunds || 0)
          .plus(localFinancialFunds || 0)
          .toFixed(2);
      },
    },
    md: 12,
  },
  {
    label: "资金预算执行进度(%)",
    prop: "budgetFundProgress",
    component: "el-input-number",
    props: {
      min: 0,
      max: 100,
      precision: 2,
      style: { width: "100%" },
      "controls-position": "right",
    },
    md: 12,
  },
  {
    label: "项目形象进度(%)",
    prop: "projectImageProgress",
    component: "el-input-number",
    props: {
      min: 0,
      max: 100,
      precision: 2,
      style: { width: "100%" },
      "controls-position": "right",
    },
    md: 12,
  },
  {
    label: "预计解决人饮困难人数(万人)",
    prop: "peopleDrinkingNumber",
    component: "el-input-number",
    props: {
      min: 0,
      max: 99999999,
      precision: 2,
      style: { width: "100%" },
      "controls-position": "right",
    },
    md: 12,
  },
  {
    label: "预计灌溉亩数(万亩)",
    prop: "irrigationNumber",
    component: "el-input-number",
    props: {
      min: 0,
      max: 99999999,
      precision: 2,
      style: { width: "100%" },
      "controls-position": "right",
    },
    md: 12,
  },
  {
    label: "项目内容",
    prop: "projectContent",
    component: "el-input",
    props: {
      type: "textarea",
      maxlength: "3000",
      placeholder: "请输入项目内容",
    },
    md: 24,
  },
];
export const cumulativeColumns = (projectTypeData) => [
  {
    label: "填报日期",
    prop: "fillDate",
    component: "el-date-picker",
    props: {
      clearable:true,
      style: { width: "100%" },
      type: "date",
      "value-format": "YYYY-MM-DD",
    },
    md: 12,
  },
  {
    label: "管理单位",
    prop: "manUnitName",
    component: "el-input",
    props: {
      disabled: true,
    },
    md: 12,
  },
  {
    label: "项目类型",
    prop: "projectType",
    component: "pro-select",
    props: {
      disabled: true,
      placeholder: "",
      data: projectTypeData || [],
      style: { width: "100%" },
    },
    md: 12,
  },
  {
    label: "项目名称",
    prop: "projectName",
    md: 12,
  },
  {
    label: "项目启动日期",
    prop: "projectStartDate",
    component: "el-date-picker",
    props: {
      disabled: true,
      clearable:true,
      style: { width: "100%" },
      type: "date",
      "value-format": "YYYY-MM-DD",
    },
    md: 12,
  },
  {
    label: "计划完成日期",
    prop: "planCompDate",
    component: "el-date-picker",
    props: {
      disabled: true,
      clearable:true,
      style: { width: "100%" },
      type: "date",
      "value-format": "YYYY-MM-DD",
    },
    md: 12,
  },
  {
    label: "资金预算合计(万元)",
    prop: "totalFunds",
    component: "el-input",
    props: {
      disabled: true,
      type: "number",
    },
    md: 12,
  },
  {
    label: "中央补助资金(万元)",
    prop: "centerAidFunds",
    component: "el-input",
    props: {
      disabled: true,
    },
    md: 12,
  },
  {
    label: "地方财政资金(万元)",
    prop: "localFinancialFunds",
    component: "el-input",
    props: {
      disabled: true,
    },
    md: 12,
  },
  {
    label: "投工投劳资金(万元)",
    prop: "investmentFunds",
    component: "el-input",
    props: {
      disabled: true,
    },
    md: 12,
  },
  {
    label: "累至当期资金投入合计(万元)",
    prop: "totalCurrPay",
    component: "el-input",
    props: {
      disabled: true,
    },
    md: 12,
  },
  {
    label: "累至资金预算执行进度(%)",
    prop: "totalRate",
    component: "el-input",
    props: {
      disabled: true,
    },
    md: 12,
  },
  {
    label: "累计至当期中央补助资金(万元)",
    prop: "totalCurrCenterAidFunds",
    component: "el-input",
    props: {
      disabled: true,
    },
    md: 12,
  },
  {
    label: "累计至当期地方财政资金(万元)",
    prop: "totalCurrLocalFinancialFunds",
    component: "el-input",
    props: {
      disabled: true,
    },
    md: 12,
  },
  {
    label: "累计至当期投工投劳资金(万元)",
    prop: "totalCurrInvestmentFunds",
    component: "el-input",
    props: {
      disabled: true,
    },
    md: 12,
  },
  {
    label: "累计至当期项目形象进度(%)",
    prop: "totalCurrProjectImageProgress",
    component: "el-input",
    props: {
      disabled: true,
    },
    md: 12,
  },
  {
    label: "项目内容",
    prop: "projectContent",
    component: "el-input",
    props: {
      disabled: true,
      type: "textarea",
    },
    md: 24,
  },
];
export const progressColumns = (projectStateData, form) => [
  {
    label: "本期资金投入合计(万元)",
    prop: "currPay",
    component: "el-input",
    props: {
      disabled: true,
    },
    md: 12,
  },
  {
    label: "本期中央补助资金(万元)",
    prop: "currCenterAidFunds",
    component: "el-input-number",
    props: {
      min: 0,
      max: 999999,
      precision: 2,
      style: { width: "100%" },
      "controls-position": "right",
      onInput: (val) => {
        const { currLocalFinancialFunds, currInvestmentFunds } =
          form.value || {};
        const num = new BigNumber(val);
        form.value.currPay = num
          .plus(currLocalFinancialFunds || 0)
          .plus(currInvestmentFunds || 0)
          .toFixed(2);
      },
    },
    md: 12,
  },
  {
    label: "本期地方财政资金(万元)",
    prop: "currLocalFinancialFunds",
    component: "el-input-number",
    props: {
      min: 0,
      max: 999999,
      precision: 2,
      style: { width: "100%" },
      "controls-position": "right",
      onInput: (val) => {
        const { currCenterAidFunds, currInvestmentFunds } = form.value || {};
        const num = new BigNumber(val);
        form.value.currPay = num
          .plus(currCenterAidFunds || 0)
          .plus(currInvestmentFunds || 0)
          .toFixed(2);
      },
    },
    md: 12,
  },
  {
    label: "本期投工投劳资金(万元)",
    prop: "currInvestmentFunds",
    component: "el-input-number",
    props: {
      min: 0,
      max: 999999,
      precision: 2,
      style: { width: "100%" },
      "controls-position": "right",
      onInput: (val) => {
        const { currCenterAidFunds, currLocalFinancialFunds } =
          form.value || {};
        const num = new BigNumber(val);
        form.value.currPay = num
          .plus(currCenterAidFunds || 0)
          .plus(currLocalFinancialFunds || 0)
          .toFixed(2);
      },
    },
    md: 12,
  },
  {
    label: "本期项目形象进度(%)",
    prop: "currProjectImageProgress",
    component: "el-input-number",
    props: {
      min: 0,
      max: 100,
      precision: 2,
      style: { width: "100%" },
      "controls-position": "right",
    },
    md: 12,
  },
  {
    label: "项目状态",
    prop: "projectStatus",
    component: "pro-select",
    props: {
      data: projectStateData || [],
      style: { width: "100%" },
    },
    md: 12,
  },
];
export const projectStatistColumns = (projectTypeData, projectStateData) => [
  {
    label: "项目名称",
    prop: "projectName",
    component: "el-input",
    md: 12,
  },
  {
    label: "项目编码",
    prop: "projectCode",
    component: "el-input",
    md: 12,
  },
  {
    label: "项目类型",
    prop: "projectType",
    component: "pro-select",
    props: {
      data: projectTypeData || [],
      style: { width: "100%" },
    },
    md: 12,
  },
  {
    label: "项目状态",
    prop: "projectStatus",
    component: "pro-select",
    props: {
      data: projectStateData || [],
      style: { width: "100%" },
    },
    md: 12,
  },
  {
    label: "管理单位",
    prop: "manUnitId",
    component: "el-input",
    md: 12,
  },
  {
    label: "项目启动日期",
    prop: "projectStartDate",
    component: "el-input",
    md: 12,
  },
  {
    label: "计划完成日期",
    prop: "planCompDate",
    component: "el-input",
    md: 12,
  },
  {
    label: "资金预算合计(万元)",
    prop: "totalFunds",
    component: "el-input",
    md: 12,
  },
  {
    label: "中央补助资金(万元)",
    prop: "centerAidFunds",
    component: "el-input",
    md: 12,
  },
  {
    label: "地方财政资金(万元)",
    prop: "localFinancialFunds",
    component: "el-input",
    md: 12,
  },
  {
    label: "投工投劳资金(万元)",
    prop: "investmentFunds",
    component: "el-input",
    md: 12,
  },
  {
    label: "预计解决人饮困难人数(万人)",
    prop: "peopleDrinkingNumber",
    component: "el-input",
    md: 12,
  },
  {
    label: "预计灌溉亩数(万亩)",
    prop: "irrigationNumber",
    component: "el-input",
    md: 12,
  },
  {
    label: "项目内容",
    prop: "projectContent",
    component: "el-input",
    props: {
      type: "textarea",
    },
    md: 24,
  },
];
export const progressStatistColumns = (projectStateData, form) => [
  {
    label: "累至当期资金投入合计(万元)",
    prop: "totalCurrPay",
    component: "el-input",
    md: 12,
  },
  {
    label: "累至资金预算执行进度(%)",
    prop: "totalRate",
    component: "el-input",
    md: 12,
  },
  {
    label: "累计至当期中央补助资金(万元)",
    prop: "totalCurrCenterAidFunds",
    component: "el-input",
    md: 12,
  },
  {
    label: "累计至当期地方财政资金(万元)",
    prop: "totalCurrLocalFinancialFunds",
    component: "el-input",
    md: 12,
  },
  {
    label: "累计至当期投工投劳资金(万元)",
    prop: "totalCurrInvestmentFunds",
    component: "el-input",
    md: 12,
  },
  {
    label: "累计至当期项目形象进度(%)",
    prop: "totalCurrProjectImageProgress",
    component: "el-input",
    md: 12,
  },
];
