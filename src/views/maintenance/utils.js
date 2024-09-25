//文件转成后台需要格式
export const changeFiles = (arr) => {
  if (arr && arr.length > 0) {
    return JSON.stringify(arr);
  }else{
    return "";
  }
};
//文件json转成前端显示格式
export const changeJsonFiles = (str) => {
  return str || [];
};
//获取文件预览路径
export const getFileUrl = (file) => {
  return `${import.meta.env.VITE_FILE_URL}${
    file.url || file.response.data.storagePath
  }`;
};
//用户选择多选处理
export const getSelectData = (records) => {
  if (records && records.length > 0) {
    const arr = records.map(({ realName, userId }) => ({ realName, userId }));
    const realNames = arr.map((item) => item.realName);
    const userIds = arr.map((item) => item.userId);
    const realName = (realNames && realNames.join(",")) || "";
    const userId = (userIds && userIds.join(",")) || "";
    return { realName, userId };
  }
  return {};
};
