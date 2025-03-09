/* eslint-disable @typescript-eslint/no-unsafe-argument */
export const prettyObject = (
  obj: Record<string, any>,
  deletes: any[] = [undefined, '', null],
) => {
  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'object' && value !== null) {
      prettyObject(value, deletes);

      if (!Object.keys(value).length) {
        delete obj[key]; // 🔹 Xóa object nếu rỗng
      }
    } else if (deletes.includes(value)) {
      delete obj[key]; // 🔹 Xóa thuộc tính nếu thuộc `deletes`
    }
  }

  return obj;
};
