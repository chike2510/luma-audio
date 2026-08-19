from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / "assets" / "images"
source = root / "icon.png"
for name in [
    "icon.png",
    "splash-icon.png",
    "favicon.png",
    "android-icon-foreground.png",
    "android-icon-monochrome.png",
    "android-icon-background.png",
]:
    target = root / name
    image = Image.open(source).convert("RGBA")
    image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    image.save(target, format="PNG", optimize=True, compress_level=9)
