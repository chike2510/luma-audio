import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RecordingPresets,
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { ScreenContainer } from "@/components/screen-container";

const COLORS = {
  canvas: "#050816",
  surface: "#0B1223",
  raised: "#111A31",
  border: "#263557",
  text: "#F8FAFC",
  muted: "#8B98B5",
  violet: "#A855F7",
  cyan: "#22D3EE",
  green: "#6EE7B7",
  red: "#FB7185",
  amber: "#FBBF24",
};

const STORAGE_KEY = "luma-audio:functional-studio:v1";
const kickSource = require("../assets/audio/kick.wav");
const snareSource = require("../assets/audio/snare.wav");
const hatSource = require("../assets/audio/hat.wav");

type Clip = {
  id: string;
  name: string;
  uri: string;
  duration: number;
  waveform: number[];
};

type Project = {
  bpm: number;
  clips: Clip[];
  steps: boolean[];
};

const defaultSteps = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false];
const defaultProject: Project = { bpm: 118, clips: [], steps: defaultSteps };

function makeWaveform(seed: number, length = 42) {
  return Array.from({ length }, (_, index) => 0.2 + ((Math.sin(index * 1.83 + seed) + 1) / 2) * 0.72);
}

export default function HomeScreen() {
  const [project, setProject] = useState<Project>(defaultProject);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isBeatPlaying, setIsBeatPlaying] = useState(false);
  const beatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatIndex = useRef(0);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const recordedPlayer = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [recordStatus, setRecordStatus] = useState<"idle" | "preparing" | "recording" | "finalizing" | "success" | "error">("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const kick = useAudioPlayer(kickSource);
  const snare = useAudioPlayer(snareSource);
  const hat = useAudioPlayer(hatSource);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    void AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (!saved) return;
      try {
        setProject(JSON.parse(saved) as Project);
      } catch {
        // Keep a clean project when old local state is invalid.
      }
    });
    return () => {
      if (beatTimer.current) clearInterval(beatTimer.current);
      recordedPlayer.current?.remove();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSaveState("saving");
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(project)).then(() => {
      if (!cancelled) setSaveState("saved");
    }).catch(() => {
      if (!cancelled) setSaveState("error");
    });
    return () => { cancelled = true; };
  }, [project]);

  const isRecording = recorderState.isRecording;
  const selectedClip = useMemo(() => project.clips.find((clip) => clip.id === selectedClipId) ?? null, [project.clips, selectedClipId]);
  const beatInterval = Math.max(60, Math.round(60000 / project.bpm / 4));

  const playSample = (name: "kick" | "snare" | "hat") => {
    const player = name === "kick" ? kick : name === "snare" ? snare : hat;
    player.seekTo(0);
    player.play();
  };

  const toggleStep = (index: number) => {
    setProject((current) => ({ ...current, steps: current.steps.map((step, stepIndex) => stepIndex === index ? !step : step) }));
    if (index % 4 === 0) playSample("kick");
    else if (index % 2 === 0) playSample("hat");
  };

  const stopBeat = () => {
    if (beatTimer.current) clearInterval(beatTimer.current);
    beatTimer.current = null;
    setIsBeatPlaying(false);
    beatIndex.current = 0;
  };

  const startBeat = () => {
    stopBeat();
    setIsBeatPlaying(true);
    beatTimer.current = setInterval(() => {
      const step = beatIndex.current % project.steps.length;
      if (project.steps[step]) playSample(step % 4 === 0 ? "kick" : "hat");
      if (step % 4 === 2) playSample("snare");
      beatIndex.current += 1;
    }, beatInterval);
  };

  const handleRecord = async () => {
    try {
      if (isRecording) {
        setRecordStatus("finalizing");
        await recorder.stop();
        const uri = recorder.uri;
        if (!uri) throw new Error("Recording URI unavailable");
        const duration = Math.max(1, Math.round((recorderState.durationMillis ?? 1000) / 1000));
        const clip: Clip = { id: `take-${Date.now()}`, name: `Take ${project.clips.length + 1}`, uri, duration, waveform: makeWaveform(Date.now() % 20) };
        setProject((current) => ({ ...current, clips: [...current.clips, clip] }));
        setSelectedClipId(clip.id);
        setRecordStatus("success");
        setTimeout(() => setRecordStatus("idle"), 2200);
        return;
      }
      setRecordStatus("preparing");
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setRecordStatus("error");
        Alert.alert("Microphone access needed", "Allow microphone access to record a real take into the timeline.");
        setTimeout(() => setRecordStatus("idle"), 2200);
        return;
      }
      await recorder.prepareToRecordAsync();
      recorder.record();
      setRecordStatus("recording");
    } catch {
      setRecordStatus("error");
      Alert.alert("Recording unavailable", "Luma Audio could not start or save this take on the device.");
      setTimeout(() => setRecordStatus("idle"), 2200);
    }
  };

  const playClip = (clip: Clip) => {
    recordedPlayer.current?.remove();
    try {
      const player = createAudioPlayer({ uri: clip.uri });
      recordedPlayer.current = player;
      player.play();
      setPlayingClipId(clip.id);
    } catch {
      Alert.alert("Playback unavailable", "This recording is no longer available on this device.");
    }
  };

  const trimClip = () => {
    if (!selectedClipId) return;
    setProject((current) => ({ ...current, clips: current.clips.map((clip) => clip.id === selectedClipId ? { ...clip, duration: Math.max(1, clip.duration - 1), waveform: clip.waveform.slice(3) } : clip) }));
  };

  const deleteClip = () => {
    if (!selectedClipId) return;
    setProject((current) => ({ ...current, clips: current.clips.filter((clip) => clip.id !== selectedClipId) }));
    setSelectedClipId(null);
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-[#050816]" safeAreaClassName="bg-[#050816]">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.overline}>LUMA AUDIO / FUNCTIONAL STUDIO</Text>
            <Text style={styles.title}>Untitled session</Text>
            <Text style={styles.meta}>{saveState === "saving" ? "Saving project…" : saveState === "error" ? "Save needs attention" : "Saved locally"} · {project.bpm} BPM · microphone + beat engine</Text>
          </View>
          <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>{isRecording ? "RECORDING" : "READY"}</Text></View>
        </View>

        <View style={styles.notice}><Text style={styles.noticeIcon}>✓</Text><Text style={styles.noticeText}>This build focuses on real recording and audible beats. MIDI, AI, and mixing are intentionally not enabled yet.</Text></View>

        <View style={styles.transport}>
          <Pressable onPress={() => isBeatPlaying ? stopBeat() : startBeat()} style={({ pressed }) => [styles.transportButton, pressed && styles.pressed]}><Text style={styles.transportIcon}>{isBeatPlaying ? "■" : "▶"}</Text><Text style={styles.transportLabel}>{isBeatPlaying ? "Stop" : "Play beat"}</Text></Pressable>
          <View style={styles.bpmBlock}><Text style={styles.bpmValue}>{project.bpm}</Text><Text style={styles.bpmLabel}>BPM</Text></View>
          <Pressable onPress={() => setProject((current) => ({ ...current, bpm: Math.min(200, current.bpm + 1) }))} style={styles.smallButton}><Text style={styles.smallButtonText}>＋</Text></Pressable>
        </View>

        <View style={styles.timelineCard}>
          <View style={styles.sectionHeader}><View><Text style={styles.eyebrow}>ARRANGEMENT</Text><Text style={styles.sectionTitle}>One timeline, real sources</Text></View><Text style={styles.timecode}>{project.clips.length ? `${project.clips.reduce((sum, clip) => sum + clip.duration, 0)}s` : "empty"}</Text></View>
          <View style={styles.timelineRuler}>{["1", "2", "3", "4", "5", "6", "7", "8"].map((bar) => <Text key={bar} style={styles.rulerText}>{bar}</Text>)}</View>
          <View style={styles.lane}><View style={styles.laneLabel}><Text style={styles.laneName}>AUDIO</Text><Text style={styles.laneHint}>{project.clips.length ? `${project.clips.length} take${project.clips.length > 1 ? "s" : ""}` : "No takes yet"}</Text></View><View style={styles.laneContent}>{project.clips.map((clip) => <Pressable key={clip.id} onPress={() => setSelectedClipId(clip.id)} style={[styles.clip, selectedClipId === clip.id && styles.clipSelected]}><Text style={styles.clipName}>{clip.name}</Text><View style={styles.waveform}>{clip.waveform.map((height, index) => <View key={index} style={[styles.waveBar, { height: `${height * 100}%` }]} />)}</View></Pressable>)}</View></View>
          <View style={styles.lane}><View style={styles.laneLabel}><Text style={styles.laneName}>BEAT</Text><Text style={styles.laneHint}>{project.steps.filter(Boolean).length} active steps</Text></View><View style={styles.beatLane}>{project.steps.map((step, index) => <View key={index} style={[styles.beatBlock, step && styles.beatBlockActive]} />)}</View></View>
          {selectedClip && <View style={styles.clipActions}><Text style={styles.selectedLabel}>{selectedClip.name} SELECTED</Text><Pressable onPress={() => playClip(selectedClip)} style={styles.actionButton}><Text style={styles.actionText}>{playingClipId === selectedClip.id ? "Playing" : "Play"}</Text></Pressable><Pressable onPress={trimClip} style={styles.actionButton}><Text style={styles.actionText}>Trim 1s</Text></Pressable><Pressable onPress={deleteClip} style={[styles.actionButton, styles.deleteButton]}><Text style={styles.deleteText}>Delete</Text></Pressable></View>}
        </View>

        <View style={styles.panel}>
          <View style={styles.sectionHeader}><View><Text style={styles.eyebrow}>RECORD</Text><Text style={styles.sectionTitle}>{isRecording ? "Recording a real take" : recordStatus === "preparing" ? "Preparing microphone" : recordStatus === "finalizing" ? "Saving take" : recordStatus === "success" ? "Take added to timeline" : "Capture audio"}</Text></View><Text style={[styles.inputText, recordStatus === "success" && { color: COLORS.green }]}>{recordStatus === "success" ? "SAVED" : recordStatus === "error" ? "RETRY" : "BUILT-IN MIC"}</Text></View>
          <View style={styles.levelTrack}><View style={[styles.levelFill, { width: isRecording ? "72%" : "18%" }]} /></View>
          <Pressable disabled={recordStatus === "preparing" || recordStatus === "finalizing"} onPress={handleRecord} style={({ pressed }) => [styles.recordButton, isRecording && styles.recordingButton, (recordStatus === "preparing" || recordStatus === "finalizing") && styles.disabledButton, pressed && styles.pressed]}><View style={styles.recordDot} /><Text style={styles.recordText}>{isRecording ? "Stop and add take" : recordStatus === "preparing" ? "Preparing…" : recordStatus === "finalizing" ? "Saving take…" : recordStatus === "success" ? "Record another take" : "Record new take"}</Text></Pressable>
          <Text style={styles.helper}>The take is saved locally on this device and added to the shared timeline when you stop.</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.sectionHeader}><View><Text style={styles.eyebrow}>BEAT MAKER</Text><Text style={styles.sectionTitle}>Tap pads, then edit steps</Text></View><Text style={styles.inputText}>AUDIBLE</Text></View>
          <View style={styles.padRow}><Pressable onPress={() => playSample("kick")} style={[styles.pad, styles.kickPad]}><Text style={styles.padName}>KICK</Text><Text style={styles.padSub}>Play sound</Text></Pressable><Pressable onPress={() => playSample("snare")} style={[styles.pad, styles.snarePad]}><Text style={styles.padName}>SNARE</Text><Text style={styles.padSub}>Play sound</Text></Pressable><Pressable onPress={() => playSample("hat")} style={[styles.pad, styles.hatPad]}><Text style={styles.padName}>HAT</Text><Text style={styles.padSub}>Play sound</Text></Pressable></View>
          <View style={styles.stepGrid}>{project.steps.map((step, index) => <Pressable key={index} onPress={() => toggleStep(index)} style={[styles.step, step && styles.stepActive]}><Text style={styles.stepNumber}>{index + 1}</Text></Pressable>)}</View>
          <View style={styles.beatFooter}><Text style={styles.helper}>Tap a step to toggle it. Play beat runs the pattern at {project.bpm} BPM.</Text><Pressable onPress={() => setProject((current) => ({ ...current, steps: defaultSteps }))}><Text style={styles.resetText}>Reset</Text></Pressable></View>
        </View>

        <View style={styles.future}><Text style={styles.eyebrow}>NEXT, NOT FAKED</Text><Text style={styles.futureTitle}>MIDI, AI, and mixing come after this loop is solid.</Text><Text style={styles.helper}>They will be added only when they can operate on real project data and audio.</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.canvas },
  content: { padding: 18, paddingBottom: 48, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  overline: { color: COLORS.cyan, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: "900", letterSpacing: -0.8, marginTop: 6 },
  meta: { color: COLORS.muted, fontSize: 11, marginTop: 5 },
  liveBadge: { flexDirection: "row", alignItems: "center", borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 9, paddingVertical: 7 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.green, marginRight: 6 },
  liveText: { color: COLORS.green, fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 9, backgroundColor: "#10192C", borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 11 },
  noticeIcon: { color: COLORS.green, fontWeight: "900" },
  noticeText: { flex: 1, color: COLORS.muted, fontSize: 10, lineHeight: 15 },
  transport: { flexDirection: "row", alignItems: "center", gap: 10 },
  transportButton: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COLORS.violet, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12 },
  transportIcon: { color: COLORS.text, fontSize: 15 },
  transportLabel: { color: COLORS.text, fontSize: 11, fontWeight: "900" },
  bpmBlock: { marginLeft: "auto", alignItems: "flex-end" },
  bpmValue: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  bpmLabel: { color: COLORS.muted, fontSize: 9, fontWeight: "800" },
  smallButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.raised, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border },
  smallButtonText: { color: COLORS.text, fontSize: 17 },
  timelineCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, padding: 14 },
  panel: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, padding: 14 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  eyebrow: { color: COLORS.cyan, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: "900", marginTop: 4 },
  timecode: { color: COLORS.muted, fontSize: 11, fontWeight: "800" },
  inputText: { color: COLORS.muted, fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  timelineRuler: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: COLORS.border, marginTop: 16, paddingBottom: 6, paddingLeft: 94 },
  rulerText: { color: COLORS.muted, fontSize: 9 },
  lane: { flexDirection: "row", minHeight: 76, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  laneLabel: { width: 82, paddingTop: 15 },
  laneName: { color: COLORS.text, fontSize: 10, fontWeight: "900" },
  laneHint: { color: COLORS.muted, fontSize: 9, marginTop: 4 },
  laneContent: { flex: 1, paddingVertical: 12, gap: 7 },
  clip: { minHeight: 50, backgroundColor: "#27124A", borderRadius: 10, borderWidth: 1, borderColor: "#7138B5", padding: 7 },
  clipSelected: { borderColor: COLORS.cyan, borderWidth: 2 },
  clipName: { color: COLORS.text, fontSize: 9, fontWeight: "900", marginBottom: 5 },
  waveform: { height: 22, flexDirection: "row", alignItems: "center", gap: 2 },
  waveBar: { flex: 1, minWidth: 2, maxWidth: 5, backgroundColor: COLORS.cyan, borderRadius: 2 },
  beatLane: { flex: 1, flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 24 },
  beatBlock: { flex: 1, height: 22, borderRadius: 5, backgroundColor: COLORS.raised, borderWidth: 1, borderColor: COLORS.border },
  beatBlockActive: { backgroundColor: "#123B4B", borderColor: COLORS.cyan },
  clipActions: { flexDirection: "row", alignItems: "center", gap: 7, paddingTop: 11, marginTop: 4 },
  selectedLabel: { color: COLORS.muted, fontSize: 8, fontWeight: "900", marginRight: "auto" },
  actionButton: { backgroundColor: COLORS.raised, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 7 },
  actionText: { color: COLORS.cyan, fontSize: 9, fontWeight: "900" },
  deleteButton: { borderColor: "#5A2335" },
  deleteText: { color: COLORS.red, fontSize: 9, fontWeight: "900" },
  levelTrack: { height: 10, backgroundColor: COLORS.raised, borderRadius: 8, overflow: "hidden", marginTop: 16 },
  levelFill: { height: "100%", backgroundColor: COLORS.cyan, borderRadius: 8 },
  recordButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, backgroundColor: COLORS.violet, borderRadius: 12, paddingVertical: 14, marginTop: 14 },
  recordingButton: { backgroundColor: COLORS.red },
  recordDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.text },
  recordText: { color: COLORS.text, fontSize: 12, fontWeight: "900" },
  helper: { color: COLORS.muted, fontSize: 10, lineHeight: 15, marginTop: 9 },
  padRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  pad: { flex: 1, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 8, borderWidth: 1 },
  kickPad: { backgroundColor: "#241244", borderColor: COLORS.violet },
  snarePad: { backgroundColor: "#102E3C", borderColor: COLORS.cyan },
  hatPad: { backgroundColor: "#3B2C12", borderColor: COLORS.amber },
  padName: { color: COLORS.text, fontSize: 11, fontWeight: "900" },
  padSub: { color: COLORS.muted, fontSize: 8, marginTop: 4 },
  stepGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 16 },
  step: { flex: 1, minWidth: 47, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.raised, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8 },
  stepActive: { backgroundColor: "#123B4B", borderColor: COLORS.cyan },
  stepNumber: { color: COLORS.muted, fontSize: 9, fontWeight: "800" },
  beatFooter: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  resetText: { color: COLORS.cyan, fontSize: 10, fontWeight: "900", marginTop: 9 },
  future: { borderWidth: 1, borderStyle: "dashed", borderColor: COLORS.border, borderRadius: 16, padding: 14 },
  futureTitle: { color: COLORS.text, fontSize: 16, fontWeight: "900", marginTop: 5 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  disabledButton: { opacity: 0.58 },
});
