export const money = (input: number | string | null | undefined) => {
  let inputMoney = Number(input);
  if (isNaN(inputMoney)) {
    return input;
  }
  return new Intl.NumberFormat("id", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(inputMoney);
};

export const date = (
  input: Date | number | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (input == null) {
    return "";
  }
  input = input ? new Date(input) : undefined;
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return new Intl.DateTimeFormat(
    ["ban", "eng"],
    options || defaultOptions
  ).format(input);
};

export const dateFormatter = (
  input: Date | number | string | null | undefined
) => {
  if (input == null) {
    return "";
  }
  input = new Date(input);
  const dd = String(input.getDate()).padStart(2, '0');
  const mm = String(input.getMonth() + 1).padStart(2, '0');
  const yyyy = String(input.getFullYear());

  return dd + '-' + mm + '-' + yyyy
}

export const toLabelValue = ({
  id,
  code,
  name,
  title,
}: ToLabelValueInput): Suggestion => {
  return {
    label: code || name || title || "",
    value: id || code || "",
  };
};

export const prepDefaultValue = (value: any, options: Suggestions) => {
  return options.find((opt) => opt.value === value);
};

export const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
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
      .filter((a) => !isNaN(Number(a)))[0];
  return "";
}

export function getPathnameParams(
  pathname: string,
  basePathname: string
): Array<string | undefined> {
  const hasParam = pathname.includes(basePathname);
  if (hasParam) {
    const params = pathname
      .split("/")
      .filter(Boolean)
      .filter((a) => a !== basePathname);
    return params;
  }
  return [];
}

export function previewHtml(html: string, length: number = 300): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = doc.body.textContent;
  return (
    text?.substring(0, length).concat(text.length > length ? "..." : "") || ""
  );
}

export function takeValue(input: Suggestion): string {
  return input.value;
}

export function removeEmpty<T>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([k, v]) => v != null)
      .map(([k, v]) =>
        typeof v === "object" && !Array.isArray(v)
          ? [k, removeEmpty(v)]
          : [k, v]
      )
  );
}

export function constructUrlParams(obj: any) {
  const searchParams = new URLSearchParams();
  Object.keys(obj).forEach((key) => {
    if (obj[key]) {
      if (obj[key].hasOwnProperty("value")) {
        searchParams.set(key, obj[key]["value"]);
      } else {
        searchParams.set(key, obj[key]);
      }
    }
  });
  return searchParams.toString();
}

export function getParams(location: any) {
  const searchParams = new URLSearchParams(location.search);
  let x = {};
  searchParams.forEach((value, key) => {
    x = Object.assign({}, x, { [key]: value });
  });
  return x;
}
