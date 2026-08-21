import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import type { ReactNode } from "react";

export const LUMA = {
  canvas: "#070A12",
  surface: "#0D1320",
  raised: "#151D2D",
  border: "#263249",
  hairline: "#1B2537",
  text: "#F4F7FB",
  muted: "#8C98AA",
  violet: "#A34BFF",
  cyan: "#2DD4E8",
  green: "#72E0B4",
  amber: "#F2C14E",
  red: "#FF647D",
};

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({ children, active = false, onPress }: { children: ReactNode; active?: boolean; onPress?: PressableProps["onPress"] }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{children}</Text></Pressable>;
}

export function PrimaryButton({ children, onPress }: { children: ReactNode; onPress?: PressableProps["onPress"] }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{children}</Text></Pressable>;
}

export function SectionTitle({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return <View style={styles.sectionHeader}><View><Eyebrow>{eyebrow}</Eyebrow><Text style={styles.sectionTitle}>{title}</Text></View>{detail ? <Text style={styles.detail}>{detail}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: LUMA.surface, borderWidth: 1, borderColor: LUMA.border, borderRadius: 10, padding: 14 },
  eyebrow: { color: LUMA.cyan, fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  sectionTitle: { color: LUMA.text, fontSize: 17, fontWeight: "800", marginTop: 5, letterSpacing: -0.25 },
  detail: { color: LUMA.muted, fontSize: 10, fontWeight: "700" },
  chip: { borderWidth: 1, borderColor: LUMA.border, backgroundColor: "transparent", borderRadius: 7, paddingHorizontal: 10, paddingVertical: 7 },
  chipActive: { backgroundColor: "#231340", borderColor: LUMA.violet },
  chipText: { color: LUMA.muted, fontSize: 10, fontWeight: "700" },
  chipTextActive: { color: LUMA.text },
  primaryButton: { backgroundColor: LUMA.violet, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, alignItems: "center" },
  primaryButtonText: { color: LUMA.text, fontSize: 12, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});

export const primitiveStyles = styles;
