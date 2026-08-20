# Luma Audio Mockup Board Blueprint

## Purpose

This board defines the visual system for Luma Audio before the next implementation pass. It is a product-design reference, not a claim that every screen is currently functional.

## Navigation Model

The primary navigation uses four destinations: Home, Studio, Library, and Settings. Home manages projects; Studio is the core creation surface; Library contains loops and samples; Settings contains audio setup and project preferences. Focused editors open as full-screen mobile surfaces or bottom sheets from Studio.

## Screen Inventory

| Screen | Role | Primary action |
|---|---|---|
| Home / Projects | Resume or organize sessions | Open project or create new project |
| New Project | Choose a starting point | Record, Beat, Loop, or AI |
| Unified Studio | Arrange all project material | Record, edit, play, and add tracks |
| Recording | Capture a real take | Start, stop, review, and keep take |
| Beat Maker | Create an audible rhythm | Tap pads and edit 16-step pattern |
| MIDI Editor | Edit pitched notes | Draw, move, quantize, and change instrument |
| Loops & Samples | Find musical source material | Preview and add to timeline |
| Mixer | Balance the project | Set level, pan, mute/solo, and effects |
| AI Co-Producer | Suggest editable changes | Review and apply a non-destructive suggestion |
| Export | Render finished work | Choose WAV, MP3, or stems |
| Settings / Audio Setup | Configure device behavior | Microphone, latency, storage, and preferences |

## Visual Rules

The visual system uses studio navy `#050816`, raised surfaces `#0B1223` and `#111A31`, electric violet `#A855F7` for primary actions, vivid cyan `#22D3EE` for signal and active states, white `#F8FAFC` for primary text, and blue-gray `#8B98B5` for supporting text. Waveforms, beat grids, meters, and timeline divisions are recurring motifs rather than decorative one-offs.

Every screen keeps a clear primary action, touch targets large enough for one-handed use, and progressive disclosure for advanced controls. The Studio timeline is the anchor: every editor must return changes to that project timeline instead of creating disconnected workflows.

## Functional Design Boundary

The mockup board may show the intended complete product, but implementation must proceed in vertical slices. The first slice is real recording, waveform clip display, playback, clip editing, audible beat sequencing, and shared arrangement. MIDI, loops, mixing, AI, and export must be implemented only when their underlying data and audio behavior are real and testable.
