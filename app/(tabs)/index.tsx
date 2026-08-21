import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Chip, Eyebrow, LUMA } from "@/components/luma-primitives";
import { MotionCard } from "@/components/motion";
import { getSessionDuration, getSessionKind, readSavedSessions, type SavedSession } from "@/lib/project-storage";

type Filter = "All projects" | "Local" | "Starred";
const artwork = [LUMA.violet, LUMA.cyan, "#5C49C8", "#2A6E9A", "#7B3FA9", "#246C83"];

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function formatEdited(timestamp: number) {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `Edited ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Edited ${hours}h ago`;
  return `Edited ${Math.floor(hours / 24)}d ago`;
}

export default function ProjectsScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [filter, setFilter] = useState<Filter>("All projects");
  const [sortNewest, setSortNewest] = useState(true);

  useEffect(() => { void readSavedSessions().then(setSessions); }, []);

  const visibleSessions = useMemo(() => {
    const filtered = filter === "All projects" ? sessions : filter === "Starred" ? sessions.filter((session) => session.starred) : sessions;
    return [...filtered].sort((a, b) => sortNewest ? b.updatedAt - a.updatedAt : a.updatedAt - b.updatedAt);
  }, [filter, sessions, sortNewest]);

  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-[#070A12]" safeAreaClassName="bg-[#070A12]"><ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><View><Text style={styles.brand}>LUMA AUDIO</Text><Text style={styles.title}>Projects</Text></View><Pressable onPress={() => router.push("/project/new")} style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}><Text style={styles.plus}>+</Text><Text style={styles.newText}>New session</Text></Pressable></View>
    <View style={styles.filters}>{(["All projects", "Local", "Starred"] as Filter[]).map((item) => <Chip key={item} active={filter === item} onPress={() => setFilter(item)}>{item}</Chip>)}</View>
    <View style={styles.sectionBar}><Eyebrow>RECENT</Eyebrow><Pressable onPress={() => setSortNewest((value) => !value)}><Text style={styles.sectionAction}>Sort: {sortNewest ? "Recent" : "Oldest"}⌄</Text></Pressable></View>
    <View style={styles.projectList}>{visibleSessions.map((session, index) => { const duration = getSessionDuration(session); const kind = getSessionKind(session); return <MotionCard key={session.id} onPress={() => router.push(`/studio?name=${encodeURIComponent(session.name)}`)} style={styles.projectCard}>
      <View style={[styles.art, { backgroundColor: artwork[index % artwork.length] }]}><View style={styles.artWave}>{Array.from({ length: 6 }, (_, barIndex) => <View key={barIndex} style={[styles.artBar, { height: `${30 + ((barIndex * 23) % 58)}%` }]} />)}</View></View>
      <View style={styles.projectBody}><View style={styles.projectTop}><Text style={styles.projectTitle}>{session.name}</Text><Text style={styles.projectLength}>{formatDuration(duration)}</Text></View><Text style={styles.projectMeta}>{session.project.bpm} BPM · {formatEdited(session.updatedAt)}</Text><View style={styles.projectFoot}><Text style={styles.kind}>{kind.toUpperCase()}</Text><Text style={styles.projectChevron}>›</Text></View></View>
    </MotionCard>; })}</View>
    {visibleSessions.length === 0 ? <View style={styles.empty}><Eyebrow>NO MATCHES</Eyebrow><Text style={styles.emptyTitle}>Nothing in {filter.toLowerCase()}.</Text><Text style={styles.emptyCopy}>Change the filter to see more sessions.</Text></View> : null}
    <Pressable onPress={() => router.push("/project/new")} style={({ pressed }) => [styles.startRow, pressed && styles.pressed]}><View><Eyebrow>START SOMETHING</Eyebrow><Text style={styles.startTitle}>Create a new session</Text><Text style={styles.startCopy}>Record, import, or start with a beat.</Text></View><Text style={styles.startArrow}>+</Text></Pressable>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: LUMA.canvas }, content: { padding: 18, paddingBottom: 40, gap: 16 }, header: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12, paddingTop: 4 }, brand: { color: LUMA.cyan, fontSize: 10, fontWeight: "900", letterSpacing: 1.7 }, title: { color: LUMA.text, fontSize: 31, fontWeight: "800", letterSpacing: -1.2, marginTop: 5 }, newButton: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: LUMA.violet, borderRadius: 8, paddingHorizontal: 13, paddingVertical: 10 }, plus: { color: LUMA.text, fontSize: 18, lineHeight: 18 }, newText: { color: LUMA.text, fontSize: 11, fontWeight: "800" }, filters: { flexDirection: "row", gap: 7 }, sectionBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 3 }, sectionAction: { color: LUMA.muted, fontSize: 10, fontWeight: "700" }, projectList: { gap: 7 }, projectCard: { flexDirection: "row", alignItems: "center", gap: 11, padding: 9, minHeight: 70, borderRadius: 9, backgroundColor: LUMA.surface, borderColor: LUMA.hairline }, art: { width: 52, height: 52, borderRadius: 7, alignItems: "center", justifyContent: "center", overflow: "hidden" }, artWave: { flexDirection: "row", alignItems: "center", gap: 2, height: 32 }, artBar: { width: 3, backgroundColor: "rgba(255,255,255,0.86)", borderRadius: 1 }, projectBody: { flex: 1, minWidth: 0 }, projectTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, projectTitle: { color: LUMA.text, fontSize: 14, fontWeight: "800" }, projectLength: { color: LUMA.muted, fontSize: 10, fontVariant: ["tabular-nums"] }, projectMeta: { color: LUMA.muted, fontSize: 10, marginTop: 4 }, projectFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }, kind: { color: LUMA.cyan, fontSize: 8, fontWeight: "900", letterSpacing: 1 }, projectChevron: { color: LUMA.muted, fontSize: 19, lineHeight: 16, paddingRight: 2 }, empty: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: LUMA.hairline, paddingVertical: 16 }, emptyTitle: { color: LUMA.text, fontSize: 14, fontWeight: "800", marginTop: 6 }, emptyCopy: { color: LUMA.muted, fontSize: 10, marginTop: 4 }, startRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderBottomWidth: 1, borderColor: LUMA.hairline, paddingVertical: 15, paddingHorizontal: 2 }, startTitle: { color: LUMA.text, fontSize: 16, fontWeight: "800", marginTop: 5 }, startCopy: { color: LUMA.muted, fontSize: 10, marginTop: 4 }, startArrow: { color: LUMA.violet, fontSize: 26, fontWeight: "300", paddingRight: 5 }, pressed: { opacity: 0.68 },
});
