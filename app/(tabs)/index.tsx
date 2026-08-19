import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { ScreenContainer } from "@/components/screen-container";

const COLORS = {
  canvas: "#050816",
  surface: "#0C1224",
  surfaceRaised: "#111A31",
  border: "#1F2B4A",
  text: "#F8FAFC",
  muted: "#8290AC",
  violet: "#A855F7",
  cyan: "#22D3EE",
  red: "#FB7185",
  green: "#6EE7B7",
};

type Tool = "Record" | "Beat" | "MIDI" | "Loops" | "Mix" | "AI";

type Track = {
  id: string;
  name: string;
  type: "audio" | "drums" | "midi" | "loop";
  color: string;
  clips: number[];
};

const initialTracks: Track[] = [
  { id: "vox", name: "Vocal take", type: "audio", color: COLORS.violet, clips: [20, 48, 76] },
  { id: "drums", name: "Neon kit", type: "drums", color: COLORS.cyan, clips: [8, 28, 48, 68, 88] },
  { id: "bass", name: "Bass MIDI", type: "midi", color: "#F0ABFC", clips: [30, 60] },
];

const toolMeta: Record<Tool, { eyebrow: string; title: string; hint: string }> = {
  Record: { eyebrow: "INPUT", title: "Capture a take", hint: "Choose an input, check your level, then record into the timeline." },
  Beat: { eyebrow: "RHYTHM", title: "Build a beat", hint: "Tap pads or place steps. Every pattern stays editable." },
  MIDI: { eyebrow: "INSTRUMENT", title: "Shape your notes", hint: "Sketch a melody with the piano roll and quantize only when you choose." },
  Loops: { eyebrow: "LIBRARY", title: "Find a texture", hint: "Browse ideas that match your project’s 118 BPM and F minor key." },
  Mix: { eyebrow: "BALANCE", title: "Make it land", hint: "Balance the session first. Open advanced processing when you need it." },
  AI: { eyebrow: "LUMA INTELLIGENCE", title: "Ask for a next move", hint: "Suggestions are previews. You stay in control of every change." },
};

export default function HomeScreen() {
  const [activeTool, setActiveTool] = useState<Tool>("Record");
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [bpm, setBpm] = useState(118);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
  }, []);

  const isRecording = recorderState.isRecording;
  const timelineLabel = useMemo(() => (isPlaying ? "00:12.4" : "00:00.0"), [isPlaying]);

  const addTrack = (type: Track["type"], name: string, color: string) => {
    setTracks((current) => [
      ...current,
      { id: `${type}-${Date.now()}`, name, type, color, clips: [18, 48, 78] },
    ]);
  };

  const handleRecord = async () => {
    if (isRecording) {
      await recorder.stop();
      setRecordedUri(recorder.uri ?? null);
      addTrack("audio", "New recording", COLORS.red);
      return;
    }

    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Microphone access needed", "Enable microphone access to record into Luma Audio.");
      return;
    }

    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const handleToolAction = (action: string) => {
    if (action === "Add pattern") addTrack("drums", "Pattern 01", COLORS.cyan);
    if (action === "Add MIDI") addTrack("midi", "MIDI idea", "#F0ABFC");
    if (action === "Add loop") addTrack("loop", "Midnight texture", "#FDE68A");
    if (action === "Apply suggestion") addTrack("midi", "AI suggestion", COLORS.violet);
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-[#050816]" safeAreaClassName="bg-[#050816]">
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.overline}>LUMA AUDIO / STUDIO</Text>
            <Text style={styles.projectName}>Midnight Bloom</Text>
            <Text style={styles.projectMeta}>Saved just now · 118 BPM · F minor</Text>
          </View>
          <Pressable style={styles.menuButton} onPress={() => Alert.alert("Project settings", "Project details and export controls will live here.")}>
            <Text style={styles.menuDots}>•••</Text>
          </Pressable>
        </View>

        <View style={styles.sessionRow}>
          <View style={styles.sessionPill}><View style={styles.liveDot} /><Text style={styles.sessionText}>READY TO CREATE</Text></View>
          <View style={styles.sessionActions}>
            <Pressable style={styles.smallControl} onPress={() => setBpm((value) => Math.max(60, value - 1))}><Text style={styles.controlText}>−</Text></Pressable>
            <Text style={styles.bpmText}>{bpm} BPM</Text>
            <Pressable style={styles.smallControl} onPress={() => setBpm((value) => Math.min(220, value + 1))}><Text style={styles.controlText}>+</Text></Pressable>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <View><Text style={styles.sectionEyebrow}>SONG TIMELINE</Text><Text style={styles.timelinePosition}>{timelineLabel} <Text style={styles.timelineMuted}>/ 02:48.0</Text></Text></View>
            <Pressable onPress={() => setIsLooping((value) => !value)} style={[styles.loopButton, isLooping && styles.loopButtonActive]}><Text style={[styles.loopButtonText, isLooping && styles.loopButtonTextActive]}>LOOP</Text></Pressable>
          </View>
          <View style={styles.ruler}>{["1", "5", "9", "13", "17", "21", "25"].map((mark) => <Text key={mark} style={styles.rulerText}>{mark}</Text>)}</View>
          <View style={styles.playhead}><View style={styles.playheadCap} /></View>
          {tracks.map((track) => (
            <View key={track.id} style={styles.trackRow}>
              <View style={styles.trackInfo}><View style={[styles.trackSwatch, { backgroundColor: track.color }]} /><View><Text style={styles.trackName}>{track.name}</Text><Text style={styles.trackType}>{track.type.toUpperCase()}</Text></View></View>
              <View style={styles.clipRail}>{track.clips.map((left, index) => <View key={`${track.id}-${index}`} style={[styles.clip, { left: `${left}%`, backgroundColor: track.color }]}><View style={styles.clipWave} /><View style={styles.clipWave} /><View style={styles.clipWave} /></View>)}</View>
            </View>
          ))}
          <Pressable style={styles.addTrack} onPress={() => addTrack("audio", "Empty audio lane", COLORS.muted)}><Text style={styles.addTrackPlus}>＋</Text><Text style={styles.addTrackText}>Add a track</Text></Pressable>
        </View>

        <View style={styles.transport}>
          <Pressable style={[styles.transportButton, styles.secondaryTransport]} onPress={() => setIsLooping((value) => !value)}><Text style={styles.transportIcon}>↻</Text></Pressable>
          <Pressable style={[styles.transportButton, styles.playButton]} onPress={() => setIsPlaying((value) => !value)}><Text style={styles.playIcon}>{isPlaying ? "Ⅱ" : "▶"}</Text></Pressable>
          <Pressable style={[styles.transportButton, isRecording && styles.recordingButton]} onPress={handleRecord}><View style={[styles.recordIcon, isRecording && styles.recordIconActive]} /></Pressable>
          <View style={styles.transportSpacer} />
          <Pressable style={styles.transportButton} onPress={() => Alert.alert("Metronome", "Metronome is ready for the next recording pass.")}><Text style={styles.transportIcon}>♩</Text></Pressable>
          <Text style={styles.countIn}>1 BAR</Text>
        </View>

        <View style={styles.toolBar}>{(["Record", "Beat", "MIDI", "Loops", "Mix", "AI"] as Tool[]).map((tool) => <Pressable key={tool} onPress={() => setActiveTool(tool)} style={[styles.toolButton, activeTool === tool && styles.toolButtonActive]}><Text style={[styles.toolText, activeTool === tool && styles.toolTextActive]}>{tool}</Text></Pressable>)}</View>

        <View style={styles.drawer}>
          <View style={styles.drawerHandle} />
          <View style={styles.drawerHeader}><View><Text style={styles.sectionEyebrow}>{toolMeta[activeTool].eyebrow}</Text><Text style={styles.drawerTitle}>{toolMeta[activeTool].title}</Text></View><Text style={styles.drawerHint}>{toolMeta[activeTool].hint}</Text></View>
          {activeTool === "Record" && <RecordPanel isRecording={isRecording} onRecord={handleRecord} recordedUri={recordedUri} />}
          {activeTool === "Beat" && <BeatPanel onAction={handleToolAction} />}
          {activeTool === "MIDI" && <MidiPanel onAction={handleToolAction} />}
          {activeTool === "Loops" && <LoopsPanel onAction={handleToolAction} />}
          {activeTool === "Mix" && <MixPanel />}
          {activeTool === "AI" && <AiPanel onAction={handleToolAction} />}
        </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

function RecordPanel({ isRecording, onRecord, recordedUri }: { isRecording: boolean; onRecord: () => void; recordedUri: string | null }) {
  return <View><View style={styles.levelRow}><Text style={styles.label}>INPUT 01 · BUILT-IN MIC</Text><Text style={styles.label}>−18 dB</Text></View><View style={styles.meter}><View style={[styles.meterFill, { width: isRecording ? "62%" : "28%" }]} /><View style={styles.meterPeak} /></View><View style={styles.optionRow}><View><Text style={styles.optionTitle}>Input monitoring</Text><Text style={styles.optionSub}>Hear yourself while recording</Text></View><View style={styles.toggle}><View style={styles.toggleKnob} /></View><View style={styles.countCard}><Text style={styles.countValue}>1</Text><Text style={styles.countLabel}>BAR COUNT-IN</Text></View></View><Pressable style={[styles.primaryAction, isRecording && styles.primaryActionRecording]} onPress={onRecord}><Text style={styles.primaryActionText}>{isRecording ? "Stop & keep take" : "Record a new take"}</Text><Text style={styles.primaryActionIcon}>{isRecording ? "■" : "●"}</Text></Pressable>{recordedUri && <Text style={styles.savedNote}>Take added to timeline · ready to edit</Text>}</View>;
}

function BeatPanel({ onAction }: { onAction: (action: string) => void }) {
  return <View><View style={styles.padGrid}>{["KICK", "SNARE", "HAT", "CLAP", "808", "RIM", "OPEN", "FX"].map((pad, index) => <Pressable key={pad} onPress={() => onAction(index === 0 ? "Add pattern" : "Pad tapped")} style={[styles.pad, index === 0 && styles.padAccent]}><Text style={styles.padLabel}>{pad}</Text><Text style={styles.padNumber}>0{index + 1}</Text></Pressable>)}</View><View style={styles.patternRow}><Text style={styles.label}>PATTERN 01 · 2 BARS</Text><Text style={styles.label}>SWING 54%</Text></View><View style={styles.stepGrid}>{Array.from({ length: 16 }).map((_, index) => <View key={index} style={[styles.step, [0, 3, 4, 8, 10, 12].includes(index) && styles.stepOn]} />)}</View><Pressable style={styles.secondaryAction} onPress={() => onAction("Add pattern")}><Text style={styles.secondaryActionText}>Add pattern to timeline</Text><Text style={styles.secondaryActionIcon}>＋</Text></Pressable></View>;
}

function MidiPanel({ onAction }: { onAction: (action: string) => void }) {
  return <View><View style={styles.midiHeader}><Text style={styles.label}>SOFT KEYS · F MINOR</Text><Text style={styles.label}>1/16 QUANTIZE</Text></View><View style={styles.pianoRoll}>{["F5", "E5", "D5", "C5", "Bb4", "Ab4", "G4", "F4"].map((note, index) => <View key={note} style={styles.pianoRow}><Text style={styles.noteLabel}>{note}</Text><View style={styles.noteRail}>{index % 3 !== 1 && <View style={[styles.noteBlock, { left: `${18 + index * 8}%`, backgroundColor: index % 2 ? COLORS.cyan : COLORS.violet }]} />}</View></View>)}</View><Pressable style={styles.secondaryAction} onPress={() => onAction("Add MIDI")}><Text style={styles.secondaryActionText}>Add MIDI idea to timeline</Text><Text style={styles.secondaryActionIcon}>＋</Text></Pressable></View>;
}

function LoopsPanel({ onAction }: { onAction: (action: string) => void }) {
  return <View><View style={styles.filterRow}>{["All", "Drums", "Bass", "Textures"].map((filter, index) => <Pressable key={filter} style={[styles.filterChip, index === 0 && styles.filterChipActive]}><Text style={[styles.filterText, index === 0 && styles.filterTextActive]}>{filter}</Text></Pressable>)}</View><View style={styles.loopItem}><View style={[styles.loopArt, { backgroundColor: "#312E81" }]}><Text style={styles.loopArtText}>✦</Text></View><View style={styles.loopCopy}><Text style={styles.loopName}>Midnight texture</Text><Text style={styles.loopMeta}>Atmosphere · 118 BPM · F min</Text></View><Pressable style={styles.previewButton} onPress={() => onAction("Preview loop")}><Text style={styles.previewText}>▶</Text></Pressable><Pressable style={styles.addButton} onPress={() => onAction("Add loop")}><Text style={styles.addButtonText}>＋</Text></Pressable></View><View style={styles.loopItem}><View style={[styles.loopArt, { backgroundColor: "#164E63" }]}><Text style={styles.loopArtText}>∿</Text></View><View style={styles.loopCopy}><Text style={styles.loopName}>Glass keys</Text><Text style={styles.loopMeta}>MIDI · 118 BPM · F min</Text></View><Pressable style={styles.previewButton} onPress={() => onAction("Preview loop")}><Text style={styles.previewText}>▶</Text></Pressable><Pressable style={styles.addButton} onPress={() => onAction("Add loop")}><Text style={styles.addButtonText}>＋</Text></Pressable></View></View>;
}

function MixPanel() {
  return <View><View style={styles.mixStrip}>{["VOCAL", "DRUMS", "BASS", "MASTER"].map((name, index) => <View key={name} style={styles.mixChannel}><View style={styles.mixMeter}><View style={[styles.mixMeterFill, { height: `${36 + index * 12}%`, backgroundColor: index === 3 ? COLORS.cyan : COLORS.violet }]} /></View><View style={styles.fader}><View style={[styles.faderKnob, { bottom: `${38 + index * 7}%` }]} /></View><Text style={styles.mixName}>{name}</Text></View>)}</View><View style={styles.mixFooter}><Text style={styles.label}>MASTER PEAK −3.2 dB</Text><Text style={styles.mixDetail}>Open advanced mix</Text></View></View>;
}

function AiPanel({ onAction }: { onAction: (action: string) => void }) {
  return <View><View style={styles.aiPrompt}><Text style={styles.aiSpark}>✦</Text><Text style={styles.aiPromptText}>Ask Luma to help shape this session</Text><Text style={styles.aiArrow}>↗</Text></View><View style={styles.suggestionRow}>{["Make a darker chorus", "Find a bassline", "Clean vocal take"].map((suggestion) => <Pressable key={suggestion} style={styles.suggestionChip} onPress={() => onAction("Apply suggestion")}><Text style={styles.suggestionText}>{suggestion}</Text></Pressable>)}</View><View style={styles.aiNote}><Text style={styles.aiNoteTitle}>NON-DESTRUCTIVE BY DESIGN</Text><Text style={styles.aiNoteCopy}>Luma previews every change and adds the result as an editable layer. Your original stays untouched.</Text></View></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.canvas },
  content: { paddingHorizontal: 18, paddingBottom: 36, gap: 16 },
  header: { paddingTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  overline: { color: COLORS.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  projectName: { color: COLORS.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.6, marginTop: 5 },
  projectMeta: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  menuButton: { width: 42, height: 42, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  menuDots: { color: COLORS.text, fontSize: 15, letterSpacing: 2, marginTop: -7 },
  sessionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sessionPill: { flexDirection: "row", gap: 7, alignItems: "center" },
  liveDot: { width: 7, height: 7, borderRadius: 7, backgroundColor: COLORS.green },
  sessionText: { color: COLORS.green, fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  sessionActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  smallControl: { width: 24, height: 24, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  controlText: { color: COLORS.muted, fontSize: 16, lineHeight: 16 },
  bpmText: { color: COLORS.text, fontSize: 11, fontWeight: "700" },
  timelineCard: { backgroundColor: COLORS.surface, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, padding: 14, overflow: "hidden" },
  timelineHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionEyebrow: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  timelinePosition: { color: COLORS.text, fontSize: 18, fontWeight: "800", marginTop: 3 },
  timelineMuted: { color: COLORS.muted, fontWeight: "500" },
  loopButton: { borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10 },
  loopButtonActive: { backgroundColor: "#20103B", borderColor: COLORS.violet },
  loopButtonText: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  loopButtonTextActive: { color: COLORS.violet },
  ruler: { flexDirection: "row", justifyContent: "space-between", marginLeft: 94, marginTop: 18, marginBottom: 5 },
  rulerText: { color: COLORS.muted, fontSize: 9 },
  playhead: { position: "absolute", top: 76, bottom: 37, left: 115, width: 1, backgroundColor: COLORS.cyan, zIndex: 3 },
  playheadCap: { width: 7, height: 7, borderRadius: 3, backgroundColor: COLORS.cyan, left: -3, top: -2 },
  trackRow: { flexDirection: "row", minHeight: 45, borderTopWidth: 1, borderTopColor: "#18213A", alignItems: "center" },
  trackInfo: { width: 82, flexDirection: "row", alignItems: "center", gap: 7 },
  trackSwatch: { width: 4, height: 25, borderRadius: 4 },
  trackName: { color: COLORS.text, fontSize: 10, fontWeight: "700", maxWidth: 68 },
  trackType: { color: COLORS.muted, fontSize: 8, marginTop: 2, letterSpacing: 0.7 },
  clipRail: { flex: 1, height: 34, position: "relative", backgroundColor: "#091127", borderRadius: 9, overflow: "hidden" },
  clip: { position: "absolute", top: 5, height: 24, width: 38, borderRadius: 6, opacity: 0.78, flexDirection: "row", alignItems: "center", paddingHorizontal: 5, gap: 3 },
  clipWave: { flex: 1, height: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.55)" },
  addTrack: { borderTopWidth: 1, borderTopColor: "#18213A", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingTop: 12 },
  addTrackPlus: { color: COLORS.cyan, fontSize: 18 },
  addTrackText: { color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  transport: { flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 4 },
  transportButton: { width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.surfaceRaised, borderWidth: 1, borderColor: COLORS.border },
  secondaryTransport: { backgroundColor: "transparent" },
  playButton: { width: 55, height: 55, borderRadius: 20, backgroundColor: COLORS.text, borderColor: COLORS.text },
  playIcon: { color: COLORS.canvas, fontSize: 19, marginLeft: 2, fontWeight: "800" },
  transportIcon: { color: COLORS.text, fontSize: 20 },
  recordIcon: { width: 17, height: 17, borderRadius: 17, backgroundColor: COLORS.red },
  recordIconActive: { borderRadius: 4, width: 15, height: 15 },
  recordingButton: { borderColor: COLORS.red, backgroundColor: "#2B1422" },
  transportSpacer: { flex: 1 },
  countIn: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  toolBar: { flexDirection: "row", backgroundColor: COLORS.surface, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: COLORS.border },
  toolButton: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12 },
  toolButtonActive: { backgroundColor: "#20103B" },
  toolText: { color: COLORS.muted, fontSize: 10, fontWeight: "700" },
  toolTextActive: { color: COLORS.violet },
  drawer: { backgroundColor: COLORS.surface, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, padding: 16 },
  drawerHandle: { width: 34, height: 3, borderRadius: 3, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 15 },
  drawerHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, gap: 12 },
  drawerTitle: { color: COLORS.text, fontSize: 20, fontWeight: "800", marginTop: 4 },
  drawerHint: { color: COLORS.muted, fontSize: 10, lineHeight: 15, maxWidth: 150, textAlign: "right" },
  label: { color: COLORS.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  levelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  meter: { height: 11, borderRadius: 4, backgroundColor: "#18213A", overflow: "hidden", flexDirection: "row" },
  meterFill: { height: "100%", backgroundColor: COLORS.cyan, borderRadius: 4 },
  meterPeak: { width: 14, height: "100%", backgroundColor: COLORS.violet, marginLeft: 3 },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 17 },
  optionTitle: { color: COLORS.text, fontSize: 12, fontWeight: "700" },
  optionSub: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  toggle: { marginLeft: "auto", width: 40, height: 24, borderRadius: 15, backgroundColor: COLORS.violet, padding: 3, justifyContent: "center" },
  toggleKnob: { width: 18, height: 18, borderRadius: 10, backgroundColor: COLORS.text, alignSelf: "flex-end" },
  countCard: { borderLeftWidth: 1, borderLeftColor: COLORS.border, paddingLeft: 12, alignItems: "center" },
  countValue: { color: COLORS.text, fontSize: 15, fontWeight: "800" },
  countLabel: { color: COLORS.muted, fontSize: 7, marginTop: 2 },
  primaryAction: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.violet, borderRadius: 15, paddingVertical: 15, paddingHorizontal: 16 },
  primaryActionRecording: { backgroundColor: COLORS.red },
  primaryActionText: { color: COLORS.text, fontSize: 13, fontWeight: "800" },
  primaryActionIcon: { color: COLORS.text, fontSize: 18 },
  savedNote: { color: COLORS.green, fontSize: 10, textAlign: "center", marginTop: 12 },
  padGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  pad: { width: "23.5%", aspectRatio: 1.15, borderRadius: 12, backgroundColor: COLORS.surfaceRaised, borderWidth: 1, borderColor: COLORS.border, padding: 9, justifyContent: "space-between" },
  padAccent: { backgroundColor: "#20103B", borderColor: COLORS.violet },
  padLabel: { color: COLORS.text, fontSize: 10, fontWeight: "800" },
  padNumber: { color: COLORS.muted, fontSize: 9 },
  patternRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 18, marginBottom: 9 },
  stepGrid: { flexDirection: "row", gap: 4 },
  step: { flex: 1, height: 22, backgroundColor: COLORS.surfaceRaised, borderRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  stepOn: { backgroundColor: COLORS.cyan, borderColor: COLORS.cyan },
  secondaryAction: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, marginTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  secondaryActionText: { color: COLORS.text, fontSize: 12, fontWeight: "700" },
  secondaryActionIcon: { color: COLORS.cyan, fontSize: 20 },
  midiHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  pianoRoll: { backgroundColor: "#091127", borderRadius: 12, paddingVertical: 6, overflow: "hidden" },
  pianoRow: { height: 22, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#18213A" },
  noteLabel: { color: COLORS.muted, fontSize: 8, width: 30, textAlign: "center" },
  noteRail: { flex: 1, height: "100%", borderLeftWidth: 1, borderLeftColor: COLORS.border, position: "relative" },
  noteBlock: { position: "absolute", width: 34, height: 14, borderRadius: 4, top: 4 },
  filterRow: { flexDirection: "row", gap: 7, marginBottom: 12 },
  filterChip: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 7 },
  filterChipActive: { backgroundColor: "#20103B", borderColor: COLORS.violet },
  filterText: { color: COLORS.muted, fontSize: 10, fontWeight: "700" },
  filterTextActive: { color: COLORS.violet },
  loopItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  loopArt: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  loopArtText: { color: COLORS.text, fontSize: 18 },
  loopCopy: { flex: 1 },
  loopName: { color: COLORS.text, fontSize: 12, fontWeight: "700" },
  loopMeta: { color: COLORS.muted, fontSize: 9, marginTop: 3 },
  previewButton: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  previewText: { color: COLORS.text, fontSize: 14 },
  addButton: { width: 30, height: 30, borderRadius: 10, backgroundColor: COLORS.surfaceRaised, alignItems: "center", justifyContent: "center" },
  addButtonText: { color: COLORS.cyan, fontSize: 18 },
  mixStrip: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10 },
  mixChannel: { alignItems: "center", width: "21%" },
  mixMeter: { height: 46, width: 5, borderRadius: 5, backgroundColor: COLORS.border, justifyContent: "flex-end", overflow: "hidden" },
  mixMeterFill: { width: "100%", borderRadius: 5 },
  fader: { height: 66, width: 2, backgroundColor: COLORS.border, marginTop: 7, position: "relative" },
  faderKnob: { position: "absolute", width: 16, height: 7, left: -7, borderRadius: 4, backgroundColor: COLORS.text },
  mixName: { color: COLORS.muted, fontSize: 8, fontWeight: "800", marginTop: 8 },
  mixFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 14, paddingTop: 13 },
  mixDetail: { color: COLORS.cyan, fontSize: 10, fontWeight: "700" },
  aiPrompt: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surfaceRaised, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 13, gap: 9 },
  aiSpark: { color: COLORS.violet, fontSize: 18 },
  aiPromptText: { color: COLORS.muted, fontSize: 11, flex: 1 },
  aiArrow: { color: COLORS.cyan, fontSize: 18 },
  suggestionRow: { flexDirection: "row", gap: 7, marginTop: 12, flexWrap: "wrap" },
  suggestionChip: { borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 8 },
  suggestionText: { color: COLORS.text, fontSize: 9, fontWeight: "700" },
  aiNote: { marginTop: 15, padding: 12, backgroundColor: "#0A1C24", borderRadius: 12, borderWidth: 1, borderColor: "#124759" },
  aiNoteTitle: { color: COLORS.cyan, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  aiNoteCopy: { color: COLORS.muted, fontSize: 10, lineHeight: 15, marginTop: 5 },
});
