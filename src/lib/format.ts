export function money(value: number) {
  return `$${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`;
}

export function fmt(value: number, digits = 1) {
  return Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function stamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function download(name: string, data: string, type = "text/plain") {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36).slice(-6)}-${Math.random().toString(36).slice(2, 5)}`;
}

export function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
