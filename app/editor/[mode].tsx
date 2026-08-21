import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Chip, Eyebrow, LUMA, PrimaryButton } from "@/components/luma-primitives";

const titles: Record<string, { label: string; title: string; accent: string }> = {
  beat: { label: "DRUMS", title: "Beat Maker", accent: LUMA.cyan },
  midi: { label: "KEYS", title: "MIDI Piano Roll", accent: LUMA.violet },
  mix: { label: "MIX", title: "Mixer & Effects", accent: LUMA.green },
  ai: { label: "AI CO-PRODUCER", title: "Your creative partner", accent: LUMA.violet },
  export: { label: "EXPORT", title: "Export settings", accent: LUMA.cyan },
};

export default function EditorScreen() {
  const router = useRouter();
  const { mode = "beat" } = useLocalSearchParams<{ mode?: string }>();
  const config = titles[mode] ?? titles.beat;
  const [exportState, setExportState] = useState<"idle" | "rendering" | "success">("idle");
  const startExport = () => {
    if (exportState !== "idle") return;
    setExportState("rendering");
    setTimeout(() => setExportState("success"), 1400);
  };
  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-[#050816]" safeAreaClassName="bg-[#050816]">
      <View style={styles.root}>
        <View style={styles.topbar}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}><Text style={styles.iconText}>‹</Text></Pressable>
          <View style={styles.topTitle}><Text style={styles.topLabel}>{config.label}</Text><Text style={styles.topProject}>Midnight Bloom⌄</Text></View>
          <Pressable style={styles.iconButton}><Text style={styles.iconText}>•••</Text></Pressable>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {mode === "beat" && <BeatScreen accent={config.accent} />}
          {mode === "midi" && <MidiScreen accent={config.accent} />}
          {mode === "mix" && <MixScreen accent={config.accent} />}
          {mode === "ai" && <AiScreen accent={config.accent} />}
          {mode === "export" && <ExportScreen accent={config.accent} state={exportState} onExport={startExport} />}
        </ScrollView>
        <View style={styles.bottomNav}><NavItem label="Projects" icon="▣" /><NavItem label="Studio" icon="▦" active /><NavItem label="Browse" icon="⌕" /><NavItem label="AI" icon="✦" /><NavItem label="Settings" icon="⚙" /></View>
      </View>
    </ScreenContainer>
  );
}

function BeatScreen({ accent }: { accent: string }) {
  const [steps, setSteps] = useState(() => [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, true]);
  return <>
    <View style={styles.headingRow}><View><Eyebrow>BEAT MAKER</Eyebrow><Text style={styles.heading}>Build the pocket.</Text><Text style={styles.subheading}>Create a pattern, then drop it into the studio timeline.</Text></View><Text style={[styles.bpm, { color: accent }]}>124<Text style={styles.bpmUnit}> BPM</Text></Text></View>
    <View style={styles.controlRow}><Chip active>1 Bar⌄</Chip><Chip>Swing 16%</Chip><Chip>Pattern 01</Chip></View>
    <Card style={styles.darkCard}><View style={styles.trackLabels}>{["Kick", "Snare", "Hi-Hat", "Clap", "Perc 1", "Perc 2"].map((name) => <View key={name} style={styles.trackLabel}><Text style={styles.trackName}>{name}</Text><Text style={styles.trackMute}>◉ ◉</Text></View>)}</View><View style={styles.bigGrid}>{["Kick", "Snare", "Hi-Hat", "Clap", "Perc 1", "Perc 2"].map((name, row) => <View key={name} style={styles.gridRow}>{steps.map((active, col) => <Pressable key={col} onPress={() => setSteps((current) => current.map((value, index) => index === col ? !value : value))} style={[styles.gridCell, ((row === 0 && active) || (row === 1 && col % 4 === 2) || (row === 2 && col % 2 === 0 && active)) && { backgroundColor: accent, borderColor: accent }]} />)}</View>)}</View></Card>
    <View style={styles.controlRow}><Chip active>Velocity 100</Chip><Chip>A · Pattern</Chip><Chip>Duplicate</Chip><Chip>Quantize</Chip></View>
    <PrimaryButton onPress={() => undefined}>Add pattern to timeline</PrimaryButton>
  </>;
}

function MidiScreen({ accent }: { accent: string }) {
  const notes = useMemo(() => Array.from({ length: 18 }, (_, index) => ({ left: `${(index * 17) % 82}%` as `${number}%`, top: `${(index * 23) % 78}%` as `${number}%`, width: (index % 3 === 0 ? "21%" : "13%") as `${number}%` })), []);
  return <>
    <View style={styles.headingRow}><View><Eyebrow>MIDI PIANO ROLL</Eyebrow><Text style={styles.heading}>Shape the melody.</Text><Text style={styles.subheading}>Draw, move, and quantize notes inside the selected instrument.</Text></View><Text style={[styles.bpm, { color: accent }]}>C Maj<Text style={styles.bpmUnit}> KEY</Text></Text></View>
    <View style={styles.controlRow}><Chip active>Grand Piano⌄</Chip><Chip>1 Bar⌄</Chip><Chip>Quantize 1/16</Chip></View>
    <Card style={styles.darkCard}><View style={styles.pianoRoll}><View style={styles.pianoKeys}>{["C5", "B4", "A4", "G4", "F4", "E4", "D4", "C4"].map((key) => <Text key={key} style={styles.pianoKey}>{key}</Text>)}</View><View style={styles.noteGrid}>{Array.from({ length: 32 }, (_, index) => <View key={index} style={[styles.gridLine, { left: `${index * 3.2}%` }]} />)}{notes.map((note, index) => <Pressable key={index} style={[styles.note, { left: note.left, top: note.top, width: note.width, backgroundColor: index % 2 ? accent : LUMA.cyan }]} />)}</View></View><Text style={styles.caption}>DRAW  ·  SELECT  ·  ERASE  ·  QUANTIZE</Text></Card>
    <View style={styles.controlRow}><Chip active>Velocity 127</Chip><Chip>Octave 4</Chip><Chip>Snap On</Chip></View>
    <PrimaryButton onPress={() => undefined}>Add MIDI track</PrimaryButton>
  </>;
}

function MixScreen({ accent }: { accent: string }) {
  return <>
    <View style={styles.headingRow}><View><Eyebrow>MIXER & EFFECTS</Eyebrow><Text style={styles.heading}>Make every layer sit.</Text><Text style={styles.subheading}>Balance the song before opening advanced effects.</Text></View><Text style={[styles.bpm, { color: accent }]}>-1.2<Text style={styles.bpmUnit}> dB</Text></Text></View>
    <View style={styles.mixerCard}>{["Vocals", "Drums", "Bass", "Keys", "FX", "Master"].map((name, index) => <View key={name} style={styles.channel}><View style={styles.meterRail}><View style={[styles.meterFill, { height: `${38 + ((index * 17) % 48)}%`, backgroundColor: index === 5 ? LUMA.violet : accent }]} /></View><View style={styles.knob}><Text style={styles.knobText}>{index === 5 ? "-1.2" : `-${(index + 2).toFixed(1)}`}</Text></View><Text style={styles.channelName}>{name}</Text><Text style={styles.channelButtons}>S  M</Text></View>)}</View>
    <Card style={styles.darkCard}><View style={styles.sectionLine}><Text style={styles.cardTitle}>Drums Bus</Text><Text style={styles.cardMeta}>EQ · COMPRESSOR · REVERB</Text></View><View style={styles.effectRow}>{["EQ", "COMP", "REV", "LIMIT"].map((effect, index) => <View key={effect} style={styles.effect}><View style={[styles.effectDial, { borderColor: index === 0 ? accent : LUMA.border }]} /><Text style={styles.effectLabel}>{effect}</Text></View>)}</View></Card>
    <PrimaryButton onPress={() => undefined}>Open advanced mixer</PrimaryButton>
  </>;
}

function AiScreen({ accent }: { accent: string }) {
  return <>
    <View style={styles.aiHero}><Eyebrow>AI CO-PRODUCER</Eyebrow><Text style={styles.heading}>Hi, I&apos;m Luma.</Text><Text style={styles.subheading}>Your creative partner. Every suggestion stays editable and reversible.</Text><View style={styles.aiOrb}><Text style={[styles.aiOrbText, { color: accent }]}>✦</Text></View></View>
    <Text style={styles.question}>What would you like to improve?</Text>
    {["Generate a beat from this groove", "Suggest chords for the chorus", "Make the vocal feel more present", "Analyze my mix"].map((item, index) => <Pressable key={item} style={({ pressed }) => [styles.aiOption, pressed && styles.pressed]}><View style={[styles.aiIcon, { backgroundColor: index === 0 ? "#2A1452" : LUMA.raised }]}><Text style={{ color: index === 0 ? accent : LUMA.muted }}>✦</Text></View><View style={styles.aiBody}><Text style={styles.aiTitle}>{item}</Text><Text style={styles.aiMeta}>{index === 0 ? "Creates an editable pattern" : "Non-destructive suggestion"}</Text></View><Text style={styles.arrow}>›</Text></Pressable>)}
    <PrimaryButton onPress={() => undefined}>Ask Luma</PrimaryButton>
  </>;
}

function ExportScreen({ accent, state, onExport }: { accent: string; state: "idle" | "rendering" | "success"; onExport: () => void }) {
  return <>
    <View style={styles.headingRow}><View><Eyebrow>EXPORT SETTINGS</Eyebrow><Text style={styles.heading}>Take it out of the studio.</Text><Text style={styles.subheading}>Choose a delivery format while keeping your project editable.</Text></View><Text style={[styles.bpm, { color: accent }]}>WAV</Text></View>
    <Card style={styles.darkCard}><Field label="FILE NAME" value="Midnight Bloom" /><Field label="FORMAT" value="WAV   ·   MP3   ·   AAC" active /><Field label="SAMPLE RATE" value="48.0 kHz" /><Field label="BIT DEPTH" value="24-bit" /><Field label="EXPORT RANGE" value="Full song⌄" /><View style={styles.switchRow}><Text style={styles.fieldLabel}>Normalize</Text><View style={styles.switchOn}><View style={styles.switchKnob} /></View></View></Card>
    <PrimaryButton onPress={onExport}>{state === "rendering" ? "Rendering…" : state === "success" ? "✓ Export ready" : "Export track"}</PrimaryButton>
    <Text style={[styles.exportStatus, state === "success" && { color: LUMA.green }]}>{state === "rendering" ? "Rendering your selected format…" : state === "success" ? "WAV 24-bit render completed. Ready to share." : "Estimated size: 78.4 MB"}</Text>
  </>;
}

function Field({ label, value, active = false }: { label: string; value: string; active?: boolean }) { return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><Text style={[styles.fieldValue, active && { color: LUMA.violet }]}>{value}</Text></View>; }
function NavItem({ label, icon, active = false }: { label: string; icon: string; active?: boolean }) { return <View style={styles.navItem}><Text style={[styles.navIcon, active && { color: LUMA.violet }]}>{icon}</Text><Text style={[styles.navLabel, active && { color: LUMA.text }]}>{label}</Text></View>; }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LUMA.canvas }, scroll: { flex: 1 }, content: { padding: 18, paddingBottom: 32, gap: 16 }, topbar: { height: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: LUMA.border, paddingHorizontal: 12 }, topTitle: { alignItems: "center" }, topLabel: { color: LUMA.cyan, fontSize: 8, fontWeight: "900", letterSpacing: 1.1 }, topProject: { color: LUMA.text, fontSize: 11, fontWeight: "900", marginTop: 3 }, iconButton: { width: 34, height: 34, alignItems: "center", justifyContent: "center" }, iconText: { color: LUMA.text, fontSize: 22 }, bottomNav: { height: 62, flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderTopWidth: 1, borderTopColor: LUMA.border, backgroundColor: "#070B18" }, navItem: { alignItems: "center", gap: 3 }, navIcon: { color: LUMA.muted, fontSize: 15 }, navLabel: { color: LUMA.muted, fontSize: 8, fontWeight: "800" }, headingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }, heading: { color: LUMA.text, fontSize: 28, fontWeight: "900", letterSpacing: -0.9, marginTop: 6 }, subheading: { color: LUMA.muted, fontSize: 11, lineHeight: 16, marginTop: 6, maxWidth: 270 }, bpm: { fontSize: 18, fontWeight: "900" }, bpmUnit: { color: LUMA.muted, fontSize: 8 }, controlRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, darkCard: { backgroundColor: "#080F20", borderColor: "#27365A" }, trackLabels: { gap: 12, position: "absolute", left: 14, top: 16, zIndex: 2 }, trackLabel: { height: 27, justifyContent: "space-between" }, trackName: { color: LUMA.text, fontSize: 9, fontWeight: "900" }, trackMute: { color: LUMA.muted, fontSize: 7 }, bigGrid: { marginLeft: 73, gap: 8 }, gridRow: { flexDirection: "row", gap: 4 }, gridCell: { flex: 1, height: 23, borderRadius: 4, backgroundColor: "#121C31", borderWidth: 1, borderColor: LUMA.border }, mixerCard: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#080F20", borderWidth: 1, borderColor: "#27365A", borderRadius: 18, padding: 14, minHeight: 236 }, channel: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 7 }, meterRail: { height: 125, width: 7, borderRadius: 4, backgroundColor: "#121C31", justifyContent: "flex-end", overflow: "hidden" }, meterFill: { width: "100%", borderRadius: 4 }, knob: { width: 34, height: 28, borderRadius: 17, borderWidth: 1, borderColor: LUMA.border, alignItems: "center", justifyContent: "center" }, knobText: { color: LUMA.text, fontSize: 7 }, channelName: { color: LUMA.text, fontSize: 8, fontWeight: "800" }, channelButtons: { color: LUMA.muted, fontSize: 8 }, pianoRoll: { flexDirection: "row", height: 250 }, pianoKeys: { width: 38, justifyContent: "space-around" }, pianoKey: { color: LUMA.muted, fontSize: 8 }, noteGrid: { flex: 1, position: "relative", backgroundColor: "#0D1628", borderLeftWidth: 1, borderTopWidth: 1, borderColor: LUMA.border, overflow: "hidden" }, gridLine: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "#1B2945" }, note: { position: "absolute", height: 14, borderRadius: 3 }, caption: { color: LUMA.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.8, marginTop: 12 }, effectRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 18 }, sectionLine: { flexDirection: "row", justifyContent: "space-between" }, cardTitle: { color: LUMA.text, fontSize: 12, fontWeight: "900" }, cardMeta: { color: LUMA.muted, fontSize: 8 }, effect: { alignItems: "center", gap: 7 }, effectDial: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, backgroundColor: LUMA.raised }, effectLabel: { color: LUMA.muted, fontSize: 8, fontWeight: "900" }, aiHero: { padding: 17, borderRadius: 20, backgroundColor: "#0C1022", borderWidth: 1, borderColor: "#49327A", overflow: "hidden" }, aiOrb: { position: "absolute", right: 18, bottom: 15, width: 80, height: 80, borderRadius: 40, backgroundColor: "#241244", alignItems: "center", justifyContent: "center" }, aiOrbText: { fontSize: 38 }, question: { color: LUMA.text, fontSize: 15, fontWeight: "900" }, aiOption: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: LUMA.surface, borderWidth: 1, borderColor: LUMA.border, borderRadius: 13, padding: 12 }, pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] }, aiIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" }, aiBody: { flex: 1 }, aiTitle: { color: LUMA.text, fontSize: 11, fontWeight: "900" }, aiMeta: { color: LUMA.muted, fontSize: 9, marginTop: 3 }, arrow: { color: LUMA.cyan, fontSize: 22 }, field: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: LUMA.border, gap: 6 }, fieldLabel: { color: LUMA.muted, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 }, fieldValue: { color: LUMA.text, fontSize: 12, fontWeight: "800" }, switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 14 }, switchOn: { width: 38, height: 22, borderRadius: 12, backgroundColor: LUMA.violet, padding: 3, alignItems: "flex-end" }, switchKnob: { width: 16, height: 16, borderRadius: 8, backgroundColor: LUMA.text }, exportStatus: { color: LUMA.muted, fontSize: 10, textAlign: "center" },
});
