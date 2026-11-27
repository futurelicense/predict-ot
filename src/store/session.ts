import { create } from "zustand";
import type { PageId } from "../nav";

const KEY = "predict-ot.session.v1";

export const ROLES = ["Research analyst", "Sector planner", "Recovery reviewer", "Exercise lead"] as const;

export interface AnalystSession {
  name: string;
  organization: string;
  role: string;
  signedInAt: string;
}

interface SessionState {
  session: AnalystSession | null;
  signIn: (input: { name: string; organization: string; role: string }) => void;
  signOut: () => void;
}

function readSession(): AnalystSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AnalystSession>;
    if (!parsed || typeof parsed.name !== "string" || !parsed.name.trim()) return null;
    return {
      name: parsed.name.trim(),
      organization: typeof parsed.organization === "string" ? parsed.organization.trim() : "",
      role: typeof parsed.role === "string" && parsed.role.trim() ? parsed.role.trim() : ROLES[0],
      signedInAt: typeof parsed.signedInAt === "string" ? parsed.signedInAt : "",
    };
  } catch {
    return null;
  }
}

let pendingPage: PageId | null = null;

export function rememberWorkspace(page: PageId) {
  pendingPage = page;
}

export function takeWorkspace(): PageId {
  const page = pendingPage ?? "command";
  pendingPage = null;
  return page;
}

export const useSession = create<SessionState>((set) => ({
  session: typeof localStorage === "undefined" ? null : readSession(),
  signIn: (input) => {
    const session: AnalystSession = {
      name: input.name.trim(),
      organization: input.organization.trim(),
      role: input.role.trim() || ROLES[0],
      signedInAt: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(session));
    set({ session });
  },
  signOut: () => {
    localStorage.removeItem(KEY);
    set({ session: null });
  },
}));
