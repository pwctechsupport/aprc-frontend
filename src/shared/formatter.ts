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

export const date = (
  input: Date | number | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
) => {
  if (input == null) {
    return input;
  }
  input = new Date(input);
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  };
  return new Intl.DateTimeFormat(["ban", "id"], {
    ...defaultOptions,
    ...options
  }).format(input);
};

export const toLabelValue = ({ id, name }: ToLabelValueValues) => ({
  label: name,
  value: id
});

interface ToLabelValueValues {
  id: string;
  name: string;
}

export const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
