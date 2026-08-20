import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import type { ReactNode } from "react";

export const LUMA = {
  canvas: "#050816",
  surface: "#0B1223",
  raised: "#111A31",
  border: "#263557",
  text: "#F8FAFC",
  muted: "#8B98B5",
  violet: "#A855F7",
  cyan: "#22D3EE",
  green: "#6EE7B7",
  amber: "#FBBF24",
};

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({ children, active = false, onPress }: { children: ReactNode; active?: boolean; onPress?: PressableProps["onPress"] }) {
  return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{children}</Text></Pressable>;
}

export function PrimaryButton({ children, onPress }: { children: ReactNode; onPress?: PressableProps["onPress"] }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{children}</Text></Pressable>;
}

export function SectionTitle({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return <View style={styles.sectionHeader}><View><Eyebrow>{eyebrow}</Eyebrow><Text style={styles.sectionTitle}>{title}</Text></View>{detail ? <Text style={styles.detail}>{detail}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: LUMA.surface, borderWidth: 1, borderColor: LUMA.border, borderRadius: 18, padding: 16 },
  eyebrow: { color: LUMA.cyan, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  sectionTitle: { color: LUMA.text, fontSize: 18, fontWeight: "900", marginTop: 5, letterSpacing: -0.2 },
  detail: { color: LUMA.muted, fontSize: 10, fontWeight: "800" },
  chip: { borderWidth: 1, borderColor: LUMA.border, backgroundColor: LUMA.raised, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8 },
  chipActive: { backgroundColor: "#2A1452", borderColor: LUMA.violet },
  chipText: { color: LUMA.muted, fontSize: 10, fontWeight: "800" },
  chipTextActive: { color: LUMA.text },
  primaryButton: { backgroundColor: LUMA.violet, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, alignItems: "center" },
  primaryButtonText: { color: LUMA.text, fontSize: 12, fontWeight: "900" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});

export const primitiveStyles = styles;
