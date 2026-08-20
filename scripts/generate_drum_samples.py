import math
import wave
from pathlib import Path

out = Path('/home/ubuntu/luma-audio/assets/audio')
out.mkdir(parents=True, exist_ok=True)
rate = 44100

def write(name, duration, fn):
    frames = int(rate * duration)
    with wave.open(str(out / name), 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(rate)
        for i in range(frames):
            t = i / rate
            sample = max(-1.0, min(1.0, fn(t)))
            f.writeframesraw(int(sample * 32767).to_bytes(2, 'little', signed=True))

def kick(t):
    env = math.exp(-18 * t)
    freq = 130 * math.exp(-7 * t) + 42
    return math.sin(2 * math.pi * freq * t) * env

def snare(t):
    env = math.exp(-24 * t)
    noise = math.sin(2 * math.pi * 1731 * t) * 0.6 + math.sin(2 * math.pi * 2937 * t) * 0.4
    body = math.sin(2 * math.pi * 190 * t) * 0.35
    return (noise + body) * env

def hat(t):
    env = math.exp(-60 * t)
    noise = math.sin(2 * math.pi * 4817 * t) * 0.55 + math.sin(2 * math.pi * 7213 * t) * 0.45
    return noise * env

write('kick.wav', 0.35, kick)
write('snare.wav', 0.25, snare)
write('hat.wav', 0.12, hat)
