export default function getRiskColor(level: string | null | undefined): string {
  if (!level) {
    return "";
  }
  return level.match(/low/gi)
    ? "success"
    : level.match(/medium/gi)
    ? "warning"
    : level.match(/high/gi)
    ? "danger"
    : "";
}
