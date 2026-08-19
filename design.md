# Luma Audio Mobile Interface Design

## Product direction

Luma Audio is a portrait-first mobile music studio for beginners, singers, independent artists, beat-makers, producers, and content creators. The first release focuses on recording, beat and MIDI creation, loops and samples, mixing/mastering foundations, and AI-assisted production. The interface follows a progressive-disclosure model: the timeline and primary actions are always visible, while deeper editing surfaces open in a bottom drawer or focused panel.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| Create | Start a project with Record, Beat, Loops, or AI. Shows recent projects and a compact “Continue creating” section. |
| Unified Studio | The core workspace. Contains project header, song timeline, track lanes, persistent transport controls, tool switcher, and contextual bottom drawer. |
| Record drawer | Microphone/input selection, input level meter, monitoring toggle, count-in, metronome, take control, and record/stop actions. |
| Beat drawer | Drum pads, pattern step grid, kit selector, swing, velocity, pattern length, and “Add to timeline.” |
| MIDI drawer | Piano-roll grid, instrument selector, octave controls, quantize, note velocity, and recording from the on-screen keyboard. |
| Loop browser drawer | Search, category chips, tempo/key filters, preview, favorites, and drag/add-to-timeline actions. |
| AI assistant drawer | Prompt field, suggested actions, generated-part previews, non-destructive apply, and undo. |
| Mix drawer | Track faders, mute/solo, pan, sends, insert effects, master limiter, and progressive advanced controls. |
| Project details sheet | Rename project, tempo, key, time signature, save/export state, and project preferences. |

## Unified Studio layout

The **top bar** contains the project title, save status, tempo, key, undo/redo, and project menu. The **timeline** occupies the central canvas and uses horizontally scrollable time with vertically stacked lanes for audio, drums, MIDI, loops, and automation. Clips are selected with a tap, edited with trim handles, and opened into a contextual action sheet with duplicate, split, quantize, fade, and delete.

The **tool switcher** sits immediately above the transport and contains Record, Beat, MIDI, Loops, Mix, and AI. It changes the bottom drawer without changing the project or timeline. The **transport bar** remains persistent with play/stop, record, count-in, metronome, loop range, and current position. The **bottom drawer** is collapsed by default to preserve timeline visibility and expands to a focused production surface.

## Key user flows

### Record a vocal or instrument

1. User opens Create and taps **Record**.
2. Luma Audio opens the Unified Studio with the Record drawer expanded.
3. User chooses microphone/input, checks the level meter, and optionally enables count-in and monitoring.
4. User taps the large record control; a new audio lane is created automatically.
5. User stops recording and receives a new take on the timeline with undo, rename, trim, and comp options.
6. User taps Play to hear the take in context with existing tracks.

### Make a beat

1. User opens Create and taps **Beat**, or selects Beat inside an existing project.
2. The Beat drawer opens with a playable drum-pad surface and pattern grid.
3. User taps pads or steps in a pattern, adjusts swing and velocity, and previews the loop against the timeline.
4. User taps **Add to timeline** to create a drum/MIDI lane.
5. User can switch directly to MIDI, Loops, Mix, or AI without losing the pattern.

### Add MIDI and loops

1. User selects MIDI or Loops from the tool switcher.
2. The bottom drawer opens with the relevant creation browser while the timeline remains visible.
3. User inserts notes, records the on-screen keyboard, or previews and adds a loop.
4. Key and tempo matching are applied as editable project suggestions rather than hidden destructive changes.

### Use AI production assistance

1. User opens AI and sees plain-language actions such as “Build a chorus drum pattern,” “Find a bassline for this chord progression,” “Clean this vocal,” and “Balance the mix.”
2. User selects an action or enters a prompt.
3. Luma Audio presents a preview with a clear explanation of what will change.
4. User applies the result as a new editable track, effect chain, or suggested adjustment.
5. Every AI action is reversible through the main undo stack.

## Color choices

The brand palette uses deep studio navy `#050816`, electric violet `#A855F7`, vivid cyan `#22D3EE`, and white highlight `#F8FAFC`. The studio background is nearly black navy; cards use a slightly raised navy surface; violet is reserved for creative/recording focus; cyan indicates playback, monitoring, and signal flow; white is used for primary labels and controls. Red is reserved only for active recording and errors so recording state remains unmistakable.

## Interaction principles

Primary actions are reachable with one hand in portrait orientation. The record button is the largest transport control and stays in the lower thumb zone. Tool switching never destroys context. Press states use subtle scale and opacity feedback, while haptics are reserved for primary actions, recording start/stop, and successful AI application. Advanced controls appear only after the user opens a drawer or selects an item, preventing the first screen from becoming a miniature desktop DAW.
