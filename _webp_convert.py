import os
import glob
from PIL import Image

base = r"a:\Downloadsaves\ujweb.biztor.hu\ujweb.biztor.hu\img"
converted = 0
saved_bytes = 0

for ext in ["*.jpg", "*.jpeg", "*.png"]:
    for src_path in glob.glob(os.path.join(base, "**", ext), recursive=True):
        dst_path = os.path.splitext(src_path)[0] + ".webp"
        if os.path.exists(dst_path):
            continue
        try:
            orig_size = os.path.getsize(src_path)
            with Image.open(src_path) as img:
                # RGBA PNG esetén tartjuk az alfa csatornát
                if img.mode in ("RGBA", "LA"):
                    img.save(dst_path, "webp", quality=82, method=6)
                else:
                    rgb = img.convert("RGB")
                    rgb.save(dst_path, "webp", quality=82, method=6)
            new_size = os.path.getsize(dst_path)
            saved = orig_size - new_size
            saved_bytes += saved
            converted += 1
            print(f"  {os.path.basename(src_path)}: {orig_size//1024}KB -> {new_size//1024}KB (megtakarítás: {saved//1024}KB)")
        except Exception as e:
            print(f"  HIBA {src_path}: {e}")

print(f"\nÁtalakítva: {converted} kép | Megtakarítás: {saved_bytes//1024} KB")
