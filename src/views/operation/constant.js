//操作指令
export const operateOrderData = [
  { label: "开闸", value: "1" },
  { label: "闭闸", value: "2" },
];
//状态
export const statusData = [
  { label: "正常", value: "1" },
  { label: "无人为事故", value: "2" },
  { label: "有人为事故", value: "3" },
  { label: "其他", value: "4" },
];
export const editMenu = {
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
