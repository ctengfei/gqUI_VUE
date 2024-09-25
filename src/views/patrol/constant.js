export const patrolStatus = [
  { label: "待巡查", value: "0" },
  { label: "待处理", value: "1" },
  { label: "已完成", value: "2" },
];
export const departmentStatus = [
  { label: "闸门", value: "1" },
  { label: "渡槽", value: "2" },
  { label: "副坝", value: "3" },
  { label: "泄洪隧洞(隧洞)", value: "4" },
  { label: "渠沟", value: "5" },
  { label: "涵洞", value: "6" },
  { label: "其他", value: "99" },
];
export const problemStatus = [
  { label: "待处理", value: "1" },
  { label: "已处理", value: "3" },
];
export const detailMenu = {
  label: "操作",
  add: false,
  edit: false,
  detail: true,
  del: false,
  reset: false, //弹窗内的取消按钮
  fixed: "right",
  detailText: "详情",
  width: "180",
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
  searchText: "查询",
  searchResetText: "重置",
};
export const problemMenu = {
  label: "操作",
  add: false,
  edit: false,
  detail: false,
  del: false,
  reset: false, //弹窗内的取消按钮
  fixed: "right",
  detailText: "详情",
  width: "220",
  searchResetProps: {
    icon: "Refresh",
  },
  searchProps: {
    type: "primary",
    icon: "Search",
  },
  searchText: "查询",
  searchResetText: "重置",
};

export const reportMenu = {
  label: "操作",
  add: false,
  edit: false,
  detail: false,
  del: false,
  reset: false, //弹窗内的取消按钮
  fixed: "right",
  detailText: "问题详情",
  width: "220",
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
  searchText: "查询",
  searchResetText: "重置",
};

export const departmentMenu = {
  label: "操作",
  add: false,
  edit: false,
  detail: false,
  del: false,
  reset: false, //弹窗内的取消按钮
  fixed: "right",
  width: "200",
  editProps: {
    link: true,
    type: "primary",
    icon: "Edit",
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
  searchText: "搜索",
  addText: "新增",
  searchResetText: "重置",
  submitText: "确认",
};
export const inspectionMenu = {
  label: "操作",
  add: false,
  edit: true,
  detail: true,
  del: false,
  reset: false, //弹窗内的取消按钮
  fixed: "right",
  addText: "新增",
  detailText: "查看",
  width: "240",
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
  editText: "修改",
  searchText: "搜索",
  searchResetText: "重置",
};
export const statisticData = [
  { name: "总计", value: 0, key: "totalNum" },
  { name: "待巡查", value: 0, key: "pendingPatrolNum" },
  { name: "已完成", value: 0, key: "finishedNum" },
  { name: "待处理", value: 0, key: "pendingProcessingNum" },
  { name: "已处理", value: 0, key: "processedNum" },
];
