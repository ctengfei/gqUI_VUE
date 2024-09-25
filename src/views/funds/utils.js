export const getList = (arr, key) => {
  if (arr && arr?.length > 0) {
    return arr.map((item) => item[key]);
  }
  return [];
};
