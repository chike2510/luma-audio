import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Chip, Eyebrow, LUMA } from "@/components/luma-primitives";
import { MotionCard } from "@/components/motion";

const projects = [
  { title: "Midnight Drive", meta: "124 BPM · Edited 4m ago", color: LUMA.violet, kind: "Beat", length: "02:41" },
  { title: "Neon Skyline", meta: "128 BPM · Edited 7h ago", color: LUMA.cyan, kind: "Record", length: "01:18" },
  { title: "Velvet Dreams", meta: "92 BPM · Edited 2d ago", color: "#5C49C8", kind: "MIDI", length: "03:06" },
  { title: "Ocean Echoes", meta: "105 BPM · Edited 3d ago", color: "#2A6E9A", kind: "Loop", length: "00:54" },
  { title: "High Voltage", meta: "140 BPM · Edited 5d ago", color: "#7B3FA9", kind: "Beat", length: "02:12" },
  { title: "Lo-Fi Sunrise", meta: "78 BPM · Edited 1w ago", color: "#246C83", kind: "Record", length: "04:08" },
];

export default function ProjectsScreen() {
  const router = useRouter();
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-[#070A12]" safeAreaClassName="bg-[#070A12]"><ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><View><Text style={styles.brand}>LUMA AUDIO</Text><Text style={styles.title}>Projects</Text></View><Pressable onPress={() => router.push("/project/new")} style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}><Text style={styles.plus}>+</Text><Text style={styles.newText}>New project</Text></Pressable></View>
    <View style={styles.filters}><Chip active>All projects</Chip><Chip>Local</Chip><Chip>Starred</Chip></View>
    <View style={styles.sectionBar}><Eyebrow>RECENT</Eyebrow><Text style={styles.sectionAction}>Sort: Recent⌄</Text></View>
    <View style={styles.projectList}>{projects.map((project) => <MotionCard key={project.title} onPress={() => router.push("/studio")} style={styles.projectCard}>
      <View style={[styles.art, { backgroundColor: project.color }]}><View style={styles.artWave}>{Array.from({ length: 6 }, (_, index) => <View key={index} style={[styles.artBar, { height: `${30 + ((index * 23) % 58)}%` }]} />)}</View></View>
      <View style={styles.projectBody}><View style={styles.projectTop}><Text style={styles.projectTitle}>{project.title}</Text><Text style={styles.projectLength}>{project.length}</Text></View><Text style={styles.projectMeta}>{project.meta}</Text><View style={styles.projectFoot}><Text style={styles.kind}>{project.kind.toUpperCase()}</Text><Text style={styles.projectChevron}>›</Text></View></View>
    </MotionCard>)}</View>
    <Pressable onPress={() => router.push("/project/new")} style={({ pressed }) => [styles.startRow, pressed && styles.pressed]}><View><Eyebrow>START SOMETHING</Eyebrow><Text style={styles.startTitle}>Create a new session</Text><Text style={styles.startCopy}>Record, import, or start with a beat.</Text></View><Text style={styles.startArrow}>+</Text></Pressable>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: LUMA.canvas },
  content: { padding: 18, paddingBottom: 40, gap: 16 },
  header: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12, paddingTop: 4 },
  brand: { color: LUMA.cyan, fontSize: 10, fontWeight: "900", letterSpacing: 1.7 },
  title: { color: LUMA.text, fontSize: 31, fontWeight: "800", letterSpacing: -1.2, marginTop: 5 },
  newButton: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: LUMA.violet, borderRadius: 8, paddingHorizontal: 13, paddingVertical: 10 },
  plus: { color: LUMA.text, fontSize: 18, lineHeight: 18 },
  newText: { color: LUMA.text, fontSize: 11, fontWeight: "800" },
  filters: { flexDirection: "row", gap: 7 },
  sectionBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 3 },
  sectionAction: { color: LUMA.muted, fontSize: 10, fontWeight: "700" },
  projectList: { gap: 7 },
  projectCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 9, minHeight: 70, borderRadius: 9, backgroundColor: LUMA.surface, borderColor: LUMA.hairline },
  art: { width: 52, height: 52, borderRadius: 7, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  artWave: { flexDirection: "row", alignItems: "center", gap: 2, height: 32 },
  artBar: { width: 3, backgroundColor: "rgba(255,255,255,0.86)", borderRadius: 1 },
  projectBody: { flex: 1, minWidth: 0 },
  projectTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  projectTitle: { color: LUMA.text, fontSize: 14, fontWeight: "800" },
  projectLength: { color: LUMA.muted, fontSize: 10, fontVariant: ["tabular-nums"] },
  projectMeta: { color: LUMA.muted, fontSize: 10, marginTop: 4 },
  projectFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  kind: { color: LUMA.cyan, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  projectChevron: { color: LUMA.muted, fontSize: 19, lineHeight: 16, paddingRight: 2 },
  startRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderBottomWidth: 1, borderColor: LUMA.hairline, paddingVertical: 15, paddingHorizontal: 2 },
  startTitle: { color: LUMA.text, fontSize: 16, fontWeight: "800", marginTop: 5 },
  startCopy: { color: LUMA.muted, fontSize: 10, marginTop: 4 },
  startArrow: { color: LUMA.violet, fontSize: 26, fontWeight: "300", paddingRight: 5 },
  pressed: { opacity: 0.68 },
});
