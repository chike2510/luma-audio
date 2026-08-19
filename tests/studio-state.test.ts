import { describe, expect, it } from "vitest";

import { appendTrack, clampBpm, createTrack, toggleBoolean } from "../lib/studio-state";

describe("studio state helpers", () => {
  it("keeps BPM within the supported production range", () => {
    expect(clampBpm(40)).toBe(60);
    expect(clampBpm(118)).toBe(118);
    expect(clampBpm(240)).toBe(220);
  });

  it("toggles transport-style booleans predictably", () => {
    expect(toggleBoolean(false)).toBe(true);
    expect(toggleBoolean(true)).toBe(false);
  });

  it("creates and appends an editable track without mutating the source list", () => {
    const original = createTrack("audio", "Vocal take", "#A855F7", "vox");
    const next = appendTrack([original], createTrack("midi", "Bass MIDI", "#22D3EE", "bass"));

    expect(next).toHaveLength(2);
    expect(next[0]).toEqual(original);
    expect(next[1].type).toBe("midi");
    expect(next[0].clips).toEqual([18, 48, 78]);
  });
});
