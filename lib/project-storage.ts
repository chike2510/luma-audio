import AsyncStorage from "@react-native-async-storage/async-storage";

export const PROJECTS_STORAGE_KEY = "luma-audio:record-sessions:v2";

export type AudioClip = {
  id: string;
  name: string;
  uri: string;
  duration: number;
  waveform: number[];
  source: "recording" | "instrumental";
};

export type StoredProject = {
  bpm: number;
  clips: AudioClip[];
  steps: boolean[];
};

export type SavedSession = {
  id: string;
  name: string;
  project: StoredProject;
  updatedAt: number;
  starred?: boolean;
};

export const DEFAULT_STEPS = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false];
export const FALLBACK_SESSIONS: SavedSession[] = [{ id: "midnight-bloom", name: "Midnight Bloom", project: { bpm: 118, clips: [], steps: DEFAULT_STEPS }, updatedAt: Date.now() }];

export async function readSavedSessions() {
  const saved = await AsyncStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!saved) return FALLBACK_SESSIONS;
  try {
    const parsed = JSON.parse(saved) as SavedSession[] | StoredProject;
    if (Array.isArray(parsed)) return parsed.length ? parsed : FALLBACK_SESSIONS;
    if (parsed && "clips" in parsed) return [{ ...FALLBACK_SESSIONS[0], project: parsed }];
  } catch {
    // Invalid local data falls back to a clean session.
  }
  return FALLBACK_SESSIONS;
}

export async function writeSavedSessions(sessions: SavedSession[]) {
  await AsyncStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(sessions));
}

export function getSessionDuration(session: SavedSession) {
  return session.project.clips.reduce((total, clip) => total + Math.max(0, clip.duration), 0);
}

export function getSessionKind(session: SavedSession) {
  if (session.project.clips.some((clip) => clip.source === "instrumental")) return "Record";
  if (session.project.steps.some(Boolean)) return "Beat";
  return "Record";
}
