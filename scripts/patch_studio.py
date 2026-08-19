from pathlib import Path

path = Path('/home/ubuntu/luma-audio/app/(tabs)/index.tsx')
s = path.read_text()
repls = {
'''type Track = {
  id: string;
  name: string;
  type: "audio" | "drums" | "midi" | "loop";
  color: string;
  clips: number[];
};''': '''type Clip = { id: string; left: number; width: number };

type Track = {
  id: string;
  name: string;
  type: "audio" | "drums" | "midi" | "loop";
  color: string;
  clips: Clip[];
};

type SavedStudio = { tracks: Track[]; bpm: number; isLooping: boolean };''',
'clips: [20, 48, 76]': 'clips: [{ id: "vox-1", left: 20, width: 7 }, { id: "vox-2", left: 48, width: 7 }, { id: "vox-3", left: 76, width: 7 }]',
'clips: [8, 28, 48, 68, 88]': 'clips: [{ id: "drums-1", left: 8, width: 7 }, { id: "drums-2", left: 28, width: 7 }, { id: "drums-3", left: 48, width: 7 }, { id: "drums-4", left: 68, width: 7 }, { id: "drums-5", left: 88, width: 7 }]',
'clips: [30, 60]': 'clips: [{ id: "bass-1", left: 30, width: 10 }, { id: "bass-2", left: 60, width: 10 }]',
'  const [recordedUri, setRecordedUri] = useState<string | null>(null);\n  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);': '  const [recordedUri, setRecordedUri] = useState<string | null>(null);\n  const [selectedClip, setSelectedClip] = useState<{ trackId: string; clipId: string } | null>(null);\n  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);\n  const playbackRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);',
'''  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
  }, []);''': '''  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    void AsyncStorage.getItem("luma-audio:studio").then((raw) => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw) as SavedStudio;
        setTracks(saved.tracks);
        setBpm(saved.bpm);
        setIsLooping(saved.isLooping);
      } catch {}
    });
    return () => playbackRef.current?.remove();
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem("luma-audio:studio", JSON.stringify({ tracks, bpm, isLooping } satisfies SavedStudio));
  }, [tracks, bpm, isLooping]);''',
'''      ...current,
      { id: `${type}-${Date.now()}`, name, type, color, clips: [18, 48, 78] },''': '''      ...current,
      { id: `${type}-${Date.now()}`, name, type, color, clips: [18, 48, 78].map((left, index) => ({ id: `${type}-${Date.now()}-${index}`, left, width: 7 })) },''',
'''  };

  const handleRecord = async () => {''': '''  };

  const deleteSelectedClip = () => {
    if (!selectedClip) return;
    setTracks((current) => current.map((track) => track.id === selectedClip.trackId ? { ...track, clips: track.clips.filter((clip) => clip.id !== selectedClip.clipId) } : track));
    setSelectedClip(null);
  };

  const duplicateSelectedClip = () => {
    if (!selectedClip) return;
    setTracks((current) => current.map((track) => {
      if (track.id !== selectedClip.trackId) return track;
      const clip = track.clips.find((item) => item.id === selectedClip.clipId);
      return clip ? { ...track, clips: [...track.clips, { ...clip, id: `${clip.id}-copy`, left: Math.min(92, clip.left + clip.width + 2) }] } : track;
    }));
  };

  const playRecordedTake = () => {
    if (!recordedUri) return;
    playbackRef.current?.remove();
    const player = createAudioPlayer({ uri: recordedUri });
    playbackRef.current = player;
    player.play();
  };

  const handleRecord = async () => {''',
'''{track.clips.map((left, index) => <View key={`${track.id}-${index}`} style={[styles.clip, { left: `${left}%`, backgroundColor: track.color }]}><View style={styles.clipWave} /><View style={styles.clipWave} /><View style={styles.clipWave} /></View>)}''': '''{track.clips.map((clip) => <Pressable key={clip.id} onPress={() => setSelectedClip({ trackId: track.id, clipId: clip.id })} style={[styles.clip, selectedClip?.clipId === clip.id && styles.clipSelected, { left: `${clip.left}%`, width: `${clip.width}%`, backgroundColor: track.color }]}><View style={styles.clipWave} /><View style={styles.clipWave} /><View style={styles.clipWave} /></Pressable>)}''',
'''<Pressable style={styles.addTrack} onPress={() => addTrack("audio", "Empty audio lane", COLORS.muted)}><Text style={styles.addTrackPlus}>＋</Text><Text style={styles.addTrackText}>Add a track</Text></Pressable>''': '''<Pressable style={styles.addTrack} onPress={() => addTrack("audio", "Empty audio lane", COLORS.muted)}><Text style={styles.addTrackPlus}>＋</Text><Text style={styles.addTrackText}>Add a track</Text></Pressable>{selectedClip && <View style={styles.clipActions}><Text style={styles.clipActionLabel}>CLIP SELECTED</Text><Pressable onPress={duplicateSelectedClip}><Text style={styles.clipActionText}>Duplicate</Text></Pressable><Pressable onPress={deleteSelectedClip}><Text style={[styles.clipActionText, { color: COLORS.red }]}>Delete</Text></Pressable></View>}''',
'''{recordedUri && <Text style={styles.savedNote}>Take added to timeline · ready to edit</Text>}''': '''{recordedUri && <View style={styles.savedRow}><Text style={styles.savedNote}>Take added to timeline · ready to edit</Text><Pressable onPress={playRecordedTake}><Text style={styles.playTake}>Play take</Text></Pressable></View>}''',
'  clip: { position: "absolute", top: 5, height: 24, width: 38, borderRadius: 6, opacity: 0.78,': '  clip: { position: "absolute", top: 5, height: 24, borderRadius: 6, opacity: 0.78,',
'  clipWave: { flex: 1, height: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.55)" },': '  clipSelected: { borderWidth: 2, borderColor: COLORS.text, opacity: 1 },\n  clipWave: { flex: 1, height: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.55)" },\n  clipActions: { flexDirection: "row", alignItems: "center", gap: 14, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 10, paddingTop: 10 },\n  clipActionLabel: { color: COLORS.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.8, marginRight: "auto" },\n  clipActionText: { color: COLORS.cyan, fontSize: 10, fontWeight: "800" },\n  savedRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 12 },\n  playTake: { color: COLORS.cyan, fontSize: 10, fontWeight: "800" },'
}
for old, new in repls.items():
    if old not in s:
        print('MISSING', old[:80].replace('\n',' / '))
    s = s.replace(old, new, 1)
path.write_text(s)
