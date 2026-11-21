import type { Asset } from "./types";

const ASSET_COLUMNS = ["id", "name", "sector", "service", "criticality", "exposure", "condition", "site", "rto", "rpo"] as const;

export function assetTemplate() {
  return `${ASSET_COLUMNS.join(",")}\n`;
}

export function assetsToCsv(assets: Asset[]) {
  if (!assets.length) return assetTemplate();
  return toCsv(
    assets.map(({ id, name, sector, service, criticality, exposure, condition, site, rto, rpo, cve }) => ({
      id, name, sector, service, criticality, exposure, condition, site, rto, rpo, cve,
    })),
  );
}

export function toCsv(rows: readonly object[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const lines = rows.map((row) => keys.map((key) => quote((row as Record<string, unknown>)[key])).join(","));
  return [keys.join(","), ...lines].join("\n");
}

export function parseAssetCsv(text: string): Asset[] {
  const rows = parseCsv(text);
  if (!rows.length) throw new Error(`Required columns: ${ASSET_COLUMNS.join(", ")}`);
  const heads = Object.keys(rows[0]);
  if (!ASSET_COLUMNS.every((column) => heads.includes(column))) {
    throw new Error(`Required columns: ${ASSET_COLUMNS.join(", ")}`);
  }
  return rows.map((row) => {
    const asset: Asset = {
      id: row.id.trim(),
      name: row.name.trim(),
      sector: row.sector.trim(),
      service: row.service.trim(),
      criticality: Number(row.criticality),
      exposure: Number(row.exposure),
      condition: Number(row.condition),
      site: row.site.trim(),
      rto: Number(row.rto),
      rpo: Number(row.rpo),
      cve: (row.cve ?? "").trim(),
    };
    const scores = [asset.criticality, asset.exposure, asset.condition];
    if (!asset.id || !asset.name || !asset.service || scores.some((score) => !(score >= 1 && score <= 5))) {
      throw new Error("Invalid asset row");
    }
    if (![asset.rto, asset.rpo].every((value) => Number.isFinite(value) && value >= 0)) {
      throw new Error("Invalid asset row");
    }
    return asset;
  });
}

function quote(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      if (row.some((item) => item.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell.length || row.length) {
    row.push(cell);
    if (row.some((item) => item.trim() !== "")) rows.push(row);
  }
  if (!rows.length) return [];
  const heads = rows[0].map((item) => item.trim());
  return rows.slice(1).map((values) => {
    const record: Record<string, string> = {};
    heads.forEach((head, index) => {
      record[head] = (values[index] ?? "").trim();
    });
    return record;
  });
}
