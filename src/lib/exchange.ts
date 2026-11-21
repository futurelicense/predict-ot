import { assetsToCsv, assetTemplate, toCsv } from "../domain/csv";
import { download } from "./format";
import { useWorkspace } from "../store/workspace";

export function exportAssetTemplate() {
  download("predict-ot-asset-template.csv", assetTemplate(), "text/csv");
}

export function exportAssets() {
  download("predict-ot-assets.csv", assetsToCsv(useWorkspace.getState().data.assets), "text/csv");
}

export function exportAudit() {
  const audit = useWorkspace.getState().data.audit;
  download("predict-ot-audit.csv", audit.length ? toCsv(audit) : "id,type,details,when,actor\n", "text/csv");
}

export function exportBackup() {
  download("predict-ot-workspace-backup.json", JSON.stringify(useWorkspace.getState().data, null, 2), "application/json");
}

export function exportReport() {
  const report = useWorkspace.getState().data.reports[0];
  if (!report) return false;
  download(`PREDICT-OT-${report.id}.txt`, report.body);
  return true;
}
