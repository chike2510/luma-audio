from pathlib import Path
path = Path('/home/ubuntu/luma-audio/server/routers.ts')
s = path.read_text()
s = s.replace('\\n', '\n')
path.write_text(s)
