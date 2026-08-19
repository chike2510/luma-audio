from pathlib import Path
path = Path('/home/ubuntu/luma-audio/app/(tabs)/index.tsx')
s = path.read_text()
repls = {
'import { ScreenContainer } from "@/components/screen-container";': 'import { ScreenContainer } from "@/components/screen-container";\nimport { trpc } from "@/lib/trpc";',
'  const [recordedUri, setRecordedUri] = useState<string | null>(null);': '  const [recordedUri, setRecordedUri] = useState<string | null>(null);\n  const [aiRationale, setAiRationale] = useState<string | null>(null);\n  const aiPattern = trpc.ai.generateDrumPattern.useMutation();',
'''  const handleToolAction = (action: string) => {
    if (action === "Add pattern") addTrack("drums", "Pattern 01", COLORS.cyan);
    if (action === "Add MIDI") addTrack("midi", "MIDI idea", "#F0ABFC");
    if (action === "Add loop") addTrack("loop", "Midnight texture", "#FDE68A");
    if (action === "Apply suggestion") addTrack("midi", "AI suggestion", COLORS.violet);
  };''': '''  const handleToolAction = async (action: string) => {
    if (action === "Add pattern") addTrack("drums", "Pattern 01", COLORS.cyan);
    if (action === "Add MIDI") addTrack("midi", "MIDI idea", "#F0ABFC");
    if (action === "Add loop") addTrack("loop", "Midnight texture", "#FDE68A");
    if (action === "Apply suggestion") {
      const result = await aiPattern.mutateAsync({ mood: "darker, spacious chorus", bpm, key: "F minor" });
      setAiRationale(result.rationale);
      addTrack("drums", result.name || "Luma drum pattern", COLORS.violet);
    }
  };''',
'{activeTool === "AI" && <AiPanel onAction={handleToolAction} />}': '{activeTool === "AI" && <AiPanel onAction={handleToolAction} isGenerating={aiPattern.isPending} rationale={aiRationale} />}',
'function AiPanel({ onAction }: { onAction: (action: string) => void }) {': 'function AiPanel({ onAction, isGenerating, rationale }: { onAction: (action: string) => void; isGenerating: boolean; rationale: string | null }) {',
'<Text style={styles.aiArrow}>↗</Text></View><View style={styles.suggestionRow}>': '<Text style={styles.aiArrow}>{isGenerating ? "…" : "↗"}</Text></View><View style={styles.suggestionRow}>',
'<View style={styles.aiNote}><Text style={styles.aiNoteTitle}>NON-DESTRUCTIVE BY DESIGN</Text>': '{rationale && <View style={styles.aiResult}><Text style={styles.aiResultTitle}>LUMA SUGGESTS</Text><Text style={styles.aiResultCopy}>{rationale}</Text></View>}<View style={styles.aiNote}><Text style={styles.aiNoteTitle}>NON-DESTRUCTIVE BY DESIGN</Text',
'  aiNote: { marginTop: 15,': '  aiResult: { marginTop: 14, padding: 12, backgroundColor: "#20103B", borderRadius: 12, borderWidth: 1, borderColor: COLORS.violet },\n  aiResultTitle: { color: COLORS.violet, fontSize: 8, fontWeight: "800", letterSpacing: 1 },\n  aiResultCopy: { color: COLORS.text, fontSize: 10, lineHeight: 15, marginTop: 5 },\n  aiNote: { marginTop: 15,'
}
for old, new in repls.items():
    if old not in s:
        print('MISSING', old[:80].replace('\n',' / '))
    s = s.replace(old, new, 1)
path.write_text(s)
