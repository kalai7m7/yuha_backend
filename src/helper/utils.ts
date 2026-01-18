export const toNullableNumber = (value: any) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};
