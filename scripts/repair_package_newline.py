from pathlib import Path

path = Path('/home/ubuntu/luma-audio/package.json')
s = path.read_text()
s = s.replace(r'\n', '\n')
path.write_text(s)
