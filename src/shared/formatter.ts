export const money = (input: number | string | null | undefined) => {
  let inputMoney = Number(input);
  if (isNaN(inputMoney)) {
    return input;
  }
  return new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(inputMoney);
};

export const date = (input: Date | number | string | null | undefined) => {
  if (input == null) {
    return input;
  }
  input = new Date(input);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  };
  return new Intl.DateTimeFormat(["ban", "id"], options).format(input);
};
