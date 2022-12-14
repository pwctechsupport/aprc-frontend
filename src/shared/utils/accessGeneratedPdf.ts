import MyApi from "./api";

export async function downloadPdf(url: string, option: FileOption) {
  const fileType = option.fileType || "pdf";
  try {
    option.onStart && option.onStart();
    const res = await MyApi.get(url, {
      responseType: "blob",
    });
    const file = new Blob([res.data], {
      type: `application/${fileType}`,
    });
    const targetUrl = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = targetUrl;
    link.setAttribute(
      "download",
      `${option.fileName}` || `PwC-Generated.${fileType}`
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode && link.parentNode.removeChild(link);
    option.onCompleted && option.onCompleted();
  } catch (error) {
    option.onError && option.onError(error);
  }
}

export async function previewPdf(url: string, option: FileOption, params: any = undefined) {
  try {
    option.onStart && option.onStart();
    const res = await MyApi.get(url, {
      responseType: "blob",
      params,
    });
    const file = new Blob([res.data], {
      type: "application/pdf",
    });
    const targetUrl = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.target = "_blank";
    link.href = targetUrl;
    document.body.appendChild(link);
    link.click();
    link.parentNode && link.parentNode.removeChild(link);

    option.onCompleted && option.onCompleted();
  } catch (error) {
    option.onError && option.onError(error);
  }
}

export async function emailPdf(fileName: string, id: number, policy?: boolean) {
  try {
    const link = document.createElement("a");
    link.target = "_blank";
    link.href = policy
      ? `mailto:?subject=${fileName}&body=${document.location.origin}/policy/${id}`
      : `mailto:?subject=${fileName}&body=${document.location.origin}/risk-and-control/${id}`;
    document.body.appendChild(link);
    link.click();
    link.parentNode && link.parentNode.removeChild(link);
  } catch (error) {}
}

export async function previewPdfs(endpoints: DownloadPdfInput[]) {
  for (const item of endpoints) {
    await previewPdf(item.url, Object.assign({}, item.options));
  }
}

export async function downloadPdfs(endpoints: DownloadPdfInput[]) {
  for (const item of endpoints) {
    await downloadPdf(item.url, Object.assign({}, item.options));
  }
}

export interface DownloadPdfInput {
  url: string;
  options?: FileOption;
}

export interface FileOption {
  fileName?: string;
  onStart?: () => void;
  onCompleted?: () => void;
  onError?: (error: any) => void;
  fileType?: string;
  params?: any
}
