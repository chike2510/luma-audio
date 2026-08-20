import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { Card, Eyebrow, LUMA, PrimaryButton } from "@/components/luma-primitives";

const options = [
  { title: "Record", detail: "Start with a vocal or instrument take", icon: "●", color: LUMA.violet },
  { title: "Beat", detail: "Build a rhythm from pads and steps", icon: "▦", color: LUMA.cyan },
  { title: "Loop", detail: "Start from a sound in your library", icon: "≋", color: LUMA.amber },
  { title: "AI idea", detail: "Describe a direction and keep it editable", icon: "✦", color: LUMA.green },
];

export default function NewProjectScreen() {
  const router = useRouter();
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-[#050816]" safeAreaClassName="bg-[#050816]"><View style={styles.content}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹  Back</Text></Pressable><Eyebrow>NEW PROJECT</Eyebrow><Text style={styles.title}>What are you making?</Text><Text style={styles.subtitle}>Every starting point opens into the same Luma Audio studio timeline.</Text><View style={styles.list}>{options.map((option) => <Pressable key={option.title} onPress={() => router.replace("/studio")} style={({ pressed }) => [styles.option, pressed && { opacity: 0.75 }]}><View style={[styles.icon, { borderColor: option.color }]}><Text style={[styles.iconText, { color: option.color }]}>{option.icon}</Text></View><View style={styles.optionBody}><Text style={styles.optionTitle}>{option.title}</Text><Text style={styles.optionDetail}>{option.detail}</Text></View><Text style={styles.chevron}>›</Text></Pressable>)}</View><Card style={styles.note}><Eyebrow>ONE WORKSPACE</Eyebrow><Text style={styles.noteTitle}>Start simple. Go deep later.</Text><Text style={styles.noteText}>You can add recording, drums, loops, MIDI, and effects to the same project as it grows.</Text></Card><View style={styles.bottom}><PrimaryButton onPress={() => router.replace("/studio")}>Open empty studio</PrimaryButton></View></View></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { flex: 1, padding: 20, gap: 14 }, back: { color: LUMA.cyan, fontSize: 13, fontWeight: "900", marginBottom: 22 }, title: { color: LUMA.text, fontSize: 30, fontWeight: "900", letterSpacing: -0.8, marginTop: 7 }, subtitle: { color: LUMA.muted, fontSize: 12, lineHeight: 18, maxWidth: 320 }, list: { gap: 9, marginTop: 12 }, option: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: LUMA.surface, borderWidth: 1, borderColor: LUMA.border, borderRadius: 16, padding: 13 }, icon: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", backgroundColor: LUMA.raised }, iconText: { fontSize: 19, fontWeight: "900" }, optionBody: { flex: 1 }, optionTitle: { color: LUMA.text, fontSize: 14, fontWeight: "900" }, optionDetail: { color: LUMA.muted, fontSize: 10, marginTop: 4 }, chevron: { color: LUMA.muted, fontSize: 24 }, note: { marginTop: 10 }, noteTitle: { color: LUMA.text, fontSize: 16, fontWeight: "900", marginTop: 6 }, noteText: { color: LUMA.muted, fontSize: 11, lineHeight: 16, marginTop: 6 }, bottom: { marginTop: "auto" },
});
