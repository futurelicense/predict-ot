import { create } from "zustand";
import { pageFromHash, type PageId } from "../nav";

interface ConfirmState {
  message: string;
  confirmLabel: string;
  run: () => void;
}

interface UiState {
  page: PageId;
  sidebarOpen: boolean;
  assetFilter: string;
  selectedAsset: string | null;
  reportType: string;
  toast: string | null;
  confirm: ConfirmState | null;
  go: (page: PageId) => void;
  setSidebar: (open: boolean) => void;
  notify: (message: string) => void;
  askConfirm: (message: string, confirmLabel: string, run: () => void) => void;
  closeConfirm: () => void;
  setAssetFilter: (value: string) => void;
  setSelectedAsset: (id: string | null) => void;
  setReportType: (value: string) => void;
  setPageFromHash: (hash: string) => void;
}

let toastTimer = 0;

export const useUi = create<UiState>((set) => ({
  page: pageFromHash(typeof location === "undefined" ? "" : location.hash),
  sidebarOpen: false,
  assetFilter: "All sectors",
  selectedAsset: null,
  reportType: "Risk and resilience brief",
  toast: null,
  confirm: null,
  go: (page) => {
    const next = `#/${page}`;
    if (typeof location !== "undefined" && location.hash !== next) location.hash = next;
    set({ page, sidebarOpen: false });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  },
  setSidebar: (sidebarOpen) => set({ sidebarOpen }),
  notify: (toast) => {
    set({ toast });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => set({ toast: null }), 3500);
  },
  askConfirm: (message, confirmLabel, run) => set({ confirm: { message, confirmLabel, run } }),
  closeConfirm: () => set({ confirm: null }),
  setAssetFilter: (assetFilter) => set({ assetFilter }),
  setSelectedAsset: (selectedAsset) => set({ selectedAsset }),
  setReportType: (reportType) => set({ reportType }),
  setPageFromHash: (hash) => set({ page: pageFromHash(hash), sidebarOpen: false }),
}));
