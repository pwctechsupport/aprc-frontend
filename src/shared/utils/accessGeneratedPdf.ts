import MyApi from "./api";

export async function downloadPdf(url: string, option: Options) {
  try {
    option.onStart && option.onStart();
    const res = await MyApi.get(url, {
      responseType: "blob"
    });
    const file = new Blob([res.data], {
      type: "application/pdf"
    });
    const targetUrl = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = targetUrl;
    link.setAttribute("download", option.fileName || "PwC-Generated");
    document.body.appendChild(link);
    link.click();
    link.parentNode && link.parentNode.removeChild(link);

    option.onCompleted && option.onCompleted();
  } catch (error) {
    option.onError && option.onError(error);
  }
}

export async function previewPdf(url: string, option: Options) {
  try {
    option.onStart && option.onStart();
    const res = await MyApi.get(url, {
      responseType: "blob"
    });
    const file = new Blob([res.data], {
      type: "application/pdf"
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

export async function emailPdf(url: string) {
  try {
    // option.onStart && option.onStart();
    const res = await MyApi.get(url, {
      responseType: "blob"
    });
    const file = new Blob([res.data], {
      type: "application/pdf"
    });
    const targetUrl = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.target = "_blank";
    link.href = `mailto:someone@yoursite.com?subject=${targetUrl}`;
    document.body.appendChild(link);
    link.click();
    link.parentNode && link.parentNode.removeChild(link);

    // option.onCompleted && option.onCompleted();
  } catch (error) {
    // option.onError && option.onError(error);
  }
}

interface Options {
  fileName?: string;
  onStart?: () => void;
  onCompleted?: () => void;
  onError?: (error: any) => void;
}
