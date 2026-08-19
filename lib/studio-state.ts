export type StudioTrack = {
  id: string;
  name: string;
  type: "audio" | "drums" | "midi" | "loop";
  color: string;
  clips: number[];
};

export function clampBpm(value: number, min = 60, max = 220) {
  return Math.min(max, Math.max(min, value));
}

export function toggleBoolean(value: boolean) {
  return !value;
}

export function appendTrack(tracks: StudioTrack[], track: StudioTrack) {
  return [...tracks, track];
}

export function createTrack(type: StudioTrack["type"], name: string, color: string, id: string): StudioTrack {
  return { id, name, type, color, clips: [18, 48, 78] };
}
