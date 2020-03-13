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
): string => {
  if (input == null) {
    return "";
  }
  input = new Date(input);
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  };
  return new Intl.DateTimeFormat(
    ["ban", "id"],
    options || defaultOptions
  ).format(input);
};

export const toLabelValue = ({
  id,
  code,
  name,
  title
}: ToLabelValueInput): ToLabelValueOutput => {
  return {
    label: code || name || title || "",
    value: id || code || ""
  };
};

export const prepDefaultValue = (value: any, options: Suggestions) => {
  return options.find(opt => opt.value === value);
};

export const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

// ==========================================
// Type Definitions
// ==========================================

interface ToLabelValueInput {
  id?: string;
  code?: string | null;
  name?: string | null;
  title?: string | null;
}
export interface ToLabelValueOutput {
  label: string;
  value: string;
}

export type Suggestions = Array<Suggestion>;

export interface Suggestion {
  label: string;
  value: string;
}

export function getActiveIdFromPathname(
  pathname: string,
  basePathname: string
): string {
  const hasParam = pathname.includes(basePathname);
  if (hasParam)
    return pathname
      .split("/")
      .filter(Boolean)
      .filter(a => !isNaN(Number(a)))[0];
  return "";
}
