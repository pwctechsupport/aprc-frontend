import MyApi from "./api";

export default async function downloadXls(
  url: string,
  params: any,
  option: FileOption
) {
  const fileType = option.fileType || "xls";
  try {
    option.onStart && option.onStart();
    const res = await MyApi.get(url, {
      params,
      responseType: "blob",
      data: ["name", "Ancestry"]
    });
    const file = new Blob([res.data], {
      type: `application/${fileType}`
    });
    const targetUrl = window.URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = targetUrl;
    link.setAttribute(
      "download",
      option.fileName || `PwC-Generated.${fileType}`
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode && link.parentNode.removeChild(link);

    option.onCompleted && option.onCompleted();
  } catch (error) {
    option.onError && option.onError(error);
  }
}

interface FileOption {
  fileName?: string;
  onStart?: () => void;
  onCompleted?: () => void;
  onError?: (error: any) => void;
  fileType?: string;
}
