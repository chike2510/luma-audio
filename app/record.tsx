import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { RecordingPresets, createAudioPlayer, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { ScreenContainer } from "@/components/screen-container";
import { Eyebrow, LUMA } from "@/components/luma-primitives";
import { DEFAULT_STEPS, FALLBACK_SESSIONS, type AudioClip, type SavedSession, type StoredProject, readSavedSessions, writeSavedSessions } from "@/lib/project-storage";
const COLORS = { ...LUMA, canvas: "#070A12", surface: "#0D1320", raised: "#151D2D", border: "#263249", red: "#FF647D" };

type Clip = AudioClip;
const fallbackProject: StoredProject = { bpm: 118, clips: [], steps: DEFAULT_STEPS };
const fallbackSessions = FALLBACK_SESSIONS;

function makeWaveform(seed: number, length = 48) { return Array.from({ length }, (_, index) => 0.18 + ((Math.sin(index * 1.83 + seed) + 1) / 2) * 0.76); }

export default function RecordScreen() {
  const router = useRouter();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const [sessions, setSessions] = useState<SavedSession[]>(fallbackSessions);
  const [activeSessionId, setActiveSessionId] = useState("midnight-bloom");
  const [project, setProject] = useState<StoredProject>(fallbackProject);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [recordStatus, setRecordStatus] = useState<"idle" | "preparing" | "recording" | "saving" | "success" | "error">("idle");
  const [importStatus, setImportStatus] = useState<"idle" | "picking" | "success" | "error">("idle");
  const [inputLevel, setInputLevel] = useState(0.22);
  const [countIn, setCountIn] = useState(true);
  const [monitor, setMonitor] = useState(false);
  const [gain, setGain] = useState(0);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    void readSavedSessions().then((restored) => { setSessions(restored); setActiveSessionId(restored[0].id); setProject(restored[0].project); });
    return () => playerRef.current?.remove();
  }, []);

  useEffect(() => {
    if (recordStatus !== "recording") return;
    const timer = setInterval(() => setInputLevel(0.18 + Math.random() * 0.64), 120);
    return () => clearInterval(timer);
  }, [recordStatus]);

  const persistSessions = async (next: SavedSession[]) => { setSessions(next); await writeSavedSessions(next); };
  const persist = async (next: StoredProject) => { const updated = sessions.map((session) => session.id === activeSessionId ? { ...session, project: next, updatedAt: Date.now() } : session); setProject(next); await persistSessions(updated); };
  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0] ?? fallbackSessions[0];
  const switchSession = (session: SavedSession) => { if (recordStatus === "recording" || recordStatus === "saving") return; setActiveSessionId(session.id); setProject(session.project); setShowSwitcher(false); setImportStatus("idle"); };
  const createSession = async () => { const number = sessions.length + 1; const session: SavedSession = { id: `session-${Date.now()}`, name: `New Session ${number}`, project: { ...fallbackProject, clips: [] }, updatedAt: Date.now() }; await persistSessions([...sessions, session]); setActiveSessionId(session.id); setProject(session.project); setShowSwitcher(false); };

  const handleRecord = async () => {
    try {
      if (recordStatus === "recording") {
        setRecordStatus("saving");
        await recorder.stop();
        const uri = recorder.uri;
        if (!uri) throw new Error("Recording URI unavailable");
        const duration = Math.max(1, Math.round((recorderState.durationMillis ?? 1000) / 1000));
        const clip: Clip = { id: `take-${Date.now()}`, name: `Take ${project.clips.filter((item) => item.source === "recording").length + 1}`, uri, duration, waveform: makeWaveform(Date.now() % 20), source: "recording" };
        await persist({ ...project, clips: [...project.clips, clip] });
        setRecordStatus("success");
        setTimeout(() => setRecordStatus("idle"), 2200);
        return;
      }
      setRecordStatus("preparing");
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) throw new Error("Microphone permission denied");
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordStatus("recording");
    } catch {
      setRecordStatus("error");
      Alert.alert("Recording unavailable", "Luma Audio could not start or save this take on the device.");
      setTimeout(() => setRecordStatus("idle"), 2200);
    }
  };

  const importInstrumental = async () => {
    try {
      setImportStatus("picking");
      const result = await DocumentPicker.getDocumentAsync({ type: ["audio/*", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4"], copyToCacheDirectory: true, multiple: false });
      if (result.canceled || !result.assets[0]) { setImportStatus("idle"); return; }
      const asset = result.assets[0];
      const clip: Clip = { id: `instrumental-${Date.now()}`, name: asset.name.replace(/\.[^/.]+$/, "") || "Instrumental", uri: asset.uri, duration: Math.max(1, Math.round((asset.size ?? 1000) / 16000)), waveform: makeWaveform(Date.now() % 17), source: "instrumental" };
      await persist({ ...project, clips: [...project.clips, clip] });
      setImportStatus("success");
      setTimeout(() => setImportStatus("idle"), 2400);
    } catch {
      setImportStatus("error");
      setTimeout(() => setImportStatus("idle"), 2200);
    }
  };

  const latestTake = [...project.clips].reverse().find((clip) => clip.source === "recording");
  const playTake = () => { if (!latestTake) return; playerRef.current?.remove(); playerRef.current = createAudioPlayer({ uri: latestTake.uri }); playerRef.current.play(); };
  const meterWidth = `${Math.round(inputLevel * 100)}%` as `${number}%`;
  const recordLabel = recordStatus === "recording" ? "Stop and save take" : recordStatus === "preparing" ? "Preparing microphone…" : recordStatus === "saving" ? "Saving take…" : recordStatus === "success" ? "Record another take" : "Record";

  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-[#070A12]" safeAreaClassName="bg-[#070A12]"><View style={styles.root}><View style={styles.topbar}><Pressable onPress={() => router.back()} style={styles.topButton}><Text style={styles.back}>‹</Text></Pressable><View style={styles.topCenter}><Text style={styles.overline}>LUMA AUDIO / STUDIO / RECORD</Text><Pressable onPress={() => setShowSwitcher((value) => !value)} style={styles.sessionButton}><Text style={styles.session}>{activeSession.name}⌄</Text></Pressable></View><Pressable onPress={() => router.push("/studio")} style={styles.topButton}><Text style={styles.more}>•••</Text></Pressable></View>{showSwitcher ? <View style={styles.switcher}><View style={styles.switcherHeader}><Text style={styles.switcherTitle}>SAVED SESSIONS</Text><Pressable onPress={createSession}><Text style={styles.newSession}>+ New</Text></Pressable></View>{sessions.sort((a, b) => b.updatedAt - a.updatedAt).map((session) => <Pressable key={session.id} onPress={() => switchSession(session)} style={[styles.sessionRow, session.id === activeSessionId && styles.sessionRowActive]}><View style={styles.sessionRowBody}><Text style={styles.sessionRowName}>{session.name}</Text><Text style={styles.sessionRowMeta}>{session.project.clips.length} clip{session.project.clips.length === 1 ? "" : "s"} · {session.project.bpm} BPM</Text></View><Text style={styles.sessionCheck}>{session.id === activeSessionId ? "✓" : ""}</Text></Pressable>)}</View> : null}<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.inputHeader}><View><Eyebrow>INPUT</Eyebrow><Text style={styles.heading}>Built-in mic</Text><Text style={styles.subheading}>Input 1 · Mono · 48 kHz</Text></View><Text style={styles.peak}>{recordStatus === "recording" ? `-${Math.max(1, Math.round((1 - inputLevel) * 32))}.4 dB` : "-12.4 dB"}</Text></View>
    <View style={styles.meterBlock}><View style={styles.meterLabels}><Text style={styles.meterText}>-48</Text><Text style={styles.meterText}>-24</Text><Text style={styles.meterText}>-12</Text><Text style={styles.meterText}>0 dB</Text></View><View style={styles.meterRail}><View style={[styles.meterFill, { width: meterWidth }, recordStatus === "recording" && inputLevel > 0.82 && styles.meterHot]} /></View><View style={styles.waveArea}>{Array.from({ length: 48 }, (_, index) => <View key={index} style={[styles.waveBar, { height: `${recordStatus === "recording" ? 18 + ((index * 31) % 70) : 10 + ((index * 17) % 28)}%`, opacity: recordStatus === "recording" ? 0.9 : 0.35 }]} />)}</View><View style={styles.timeRow}><Text style={styles.timecode}>{recordStatus === "recording" ? `${Math.floor((recorderState.durationMillis ?? 0) / 1000).toString().padStart(2, "0")}:${Math.floor(((recorderState.durationMillis ?? 0) % 60000) / 1000).toString().padStart(2, "0")}` : "00:00.0"}</Text><Text style={styles.status}>{recordStatus === "recording" ? "RECORDING" : recordStatus === "success" ? "TAKE SAVED" : "READY"}</Text></View></View>
    <Pressable disabled={recordStatus === "preparing" || recordStatus === "saving"} onPress={handleRecord} style={({ pressed }) => [styles.recordButton, recordStatus === "recording" && styles.recordingButton, (recordStatus === "preparing" || recordStatus === "saving") && styles.disabled, pressed && styles.pressed]}><View style={styles.recordDot} /><Text style={styles.recordLabel}>{recordLabel}</Text></Pressable>
    <View style={styles.controlRow}><Pressable onPress={() => setCountIn((value) => !value)} style={[styles.control, countIn && styles.controlActive]}><Text style={styles.controlTitle}>Count-in</Text><Text style={styles.controlValue}>{countIn ? "4 bars" : "Off"}</Text></Pressable><Pressable onPress={() => setMonitor((value) => !value)} style={[styles.control, monitor && styles.controlActive]}><Text style={styles.controlTitle}>Monitor</Text><Text style={styles.controlValue}>{monitor ? "On" : "Off"}</Text></Pressable><Pressable onPress={() => setGain((value) => Math.max(-12, Math.min(12, value + 1)))} style={styles.control}><Text style={styles.controlTitle}>Input gain</Text><Text style={styles.controlValue}>{gain > 0 ? "+" : ""}{gain} dB</Text></Pressable></View>
    <View style={styles.sectionHeader}><Eyebrow>TAKE HISTORY</Eyebrow><Text style={styles.sectionMeta}>{project.clips.filter((clip) => clip.source === "recording").length} take{project.clips.filter((clip) => clip.source === "recording").length === 1 ? "" : "s"}</Text></View>{latestTake ? <View style={styles.takeRow}><Pressable onPress={playTake} style={styles.playTake}><Text style={styles.playIcon}>▶</Text></Pressable><View style={styles.takeBody}><Text style={styles.takeName}>{latestTake.name}</Text><Text style={styles.takeMeta}>{latestTake.duration}s · Saved locally</Text></View><Text style={styles.takeMore}>•••</Text></View> : <View style={styles.emptyTake}><Text style={styles.emptyTitle}>No takes yet</Text><Text style={styles.emptyCopy}>Your recorded takes will appear here.</Text></View>}
    <Pressable disabled={importStatus === "picking"} onPress={importInstrumental} style={({ pressed }) => [styles.importRow, pressed && styles.pressed, importStatus === "picking" && styles.disabled]}><Text style={styles.importIcon}>↑</Text><View style={styles.importBody}><Text style={styles.importTitle}>{importStatus === "picking" ? "Choosing instrumental…" : importStatus === "success" ? "Instrumental added" : "Import instrumental"}</Text><Text style={styles.importMeta}>{importStatus === "success" ? "Saved to the session timeline" : "MP3, WAV, or M4A · stored locally"}</Text></View><Text style={styles.arrow}>›</Text></Pressable>
    <Pressable onPress={() => router.push("/studio")} style={styles.timelineLink}><Text style={styles.timelineLinkText}>View session timeline</Text><Text style={styles.arrow}>›</Text></Pressable>
  </ScrollView></View></ScreenContainer>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: COLORS.canvas }, sessionButton: { alignItems: "center", paddingHorizontal: 8, paddingVertical: 2 }, switcher: { marginHorizontal: 12, marginTop: 8, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 9, padding: 10, zIndex: 3 }, switcherHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 7, borderBottomWidth: 1, borderBottomColor: COLORS.hairline }, switcherTitle: { color: COLORS.cyan, fontSize: 8, fontWeight: "900", letterSpacing: 1 }, newSession: { color: COLORS.violet, fontSize: 10, fontWeight: "900" }, sessionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.hairline }, sessionRowActive: { backgroundColor: "#111B2A" }, sessionRowBody: { flex: 1 }, sessionRowName: { color: COLORS.text, fontSize: 11, fontWeight: "800" }, sessionRowMeta: { color: COLORS.muted, fontSize: 9, marginTop: 3 }, sessionCheck: { color: COLORS.cyan, fontSize: 14, fontWeight: "900" }, topbar: { height: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: COLORS.hairline }, topButton: { width: 42, alignItems: "flex-start" }, back: { color: COLORS.text, fontSize: 28 }, more: { color: COLORS.text, fontSize: 17, letterSpacing: 1, textAlign: "right" }, topCenter: { alignItems: "center" }, overline: { color: COLORS.cyan, fontSize: 8, fontWeight: "900", letterSpacing: 1.1 }, session: { color: COLORS.text, fontSize: 12, fontWeight: "900", marginTop: 4 }, content: { padding: 18, paddingBottom: 38, gap: 15 }, inputHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }, heading: { color: COLORS.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.8, marginTop: 6 }, subheading: { color: COLORS.muted, fontSize: 10, marginTop: 5 }, peak: { color: COLORS.cyan, fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] }, meterBlock: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 9, padding: 13 }, meterLabels: { flexDirection: "row", justifyContent: "space-between" }, meterText: { color: COLORS.muted, fontSize: 8, fontVariant: ["tabular-nums"] }, meterRail: { height: 8, backgroundColor: "#141E31", borderRadius: 4, overflow: "hidden", marginTop: 8 }, meterFill: { height: "100%", backgroundColor: COLORS.cyan, borderRadius: 4 }, meterHot: { backgroundColor: COLORS.red }, waveArea: { height: 108, flexDirection: "row", alignItems: "center", gap: 3, marginTop: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.hairline }, waveBar: { flex: 1, maxWidth: 6, backgroundColor: COLORS.cyan, borderRadius: 2 }, timeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 11 }, timecode: { color: COLORS.text, fontSize: 24, fontWeight: "700", fontVariant: ["tabular-nums"], letterSpacing: -0.8 }, status: { color: COLORS.cyan, fontSize: 8, fontWeight: "900", letterSpacing: 1 }, recordButton: { height: 58, borderRadius: 8, backgroundColor: COLORS.violet, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 }, recordingButton: { backgroundColor: "#7F2943" }, recordDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.text }, recordLabel: { color: COLORS.text, fontSize: 13, fontWeight: "900" }, controlRow: { flexDirection: "row", gap: 8 }, control: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 7, padding: 10, backgroundColor: COLORS.surface }, controlActive: { borderColor: COLORS.cyan, backgroundColor: "#0D2631" }, controlTitle: { color: COLORS.muted, fontSize: 8, fontWeight: "800" }, controlValue: { color: COLORS.text, fontSize: 10, fontWeight: "800", marginTop: 5 }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 3 }, sectionMeta: { color: COLORS.muted, fontSize: 9 }, takeRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.hairline }, playTake: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.raised, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.border }, playIcon: { color: COLORS.cyan, fontSize: 11 }, takeBody: { flex: 1 }, takeName: { color: COLORS.text, fontSize: 12, fontWeight: "800" }, takeMeta: { color: COLORS.muted, fontSize: 9, marginTop: 4 }, takeMore: { color: COLORS.muted, fontSize: 15 }, emptyTake: { paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.hairline }, emptyTitle: { color: COLORS.text, fontSize: 12, fontWeight: "800" }, emptyCopy: { color: COLORS.muted, fontSize: 9, marginTop: 4 }, importRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.hairline }, importIcon: { color: COLORS.cyan, fontSize: 22 }, importBody: { flex: 1 }, importTitle: { color: COLORS.text, fontSize: 12, fontWeight: "800" }, importMeta: { color: COLORS.muted, fontSize: 9, marginTop: 4 }, arrow: { color: COLORS.cyan, fontSize: 22 }, timelineLink: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 11 }, timelineLinkText: { color: COLORS.text, fontSize: 11, fontWeight: "800" }, pressed: { opacity: 0.72 }, disabled: { opacity: 0.55 },
});
