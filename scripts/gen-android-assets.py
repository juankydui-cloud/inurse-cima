#!/usr/bin/env python3
"""Genera los iconos y splash screens de Android a partir de public/icon-512*.png.

Uso puntual (no forma parte del build en producción): se ejecuta una vez tras
`npx cap add android` para sustituir los placeholders por defecto de Capacitor
por los iconos reales de iNurse. Vuelve a ejecutarse solo si cambia el icono.
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, "android", "app", "src", "main", "res")
BG_COLOR = "#0D1320"

ICON_SQUARE = Image.open(os.path.join(ROOT, "public", "icon-512.png")).convert("RGBA")
ICON_MASKABLE = Image.open(os.path.join(ROOT, "public", "icon-512-maskable.png")).convert("RGBA")

LAUNCHER_SIZES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
FOREGROUND_SIZES = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}
SPLASH_PORT = {"mdpi": (320, 480), "hdpi": (480, 800), "xhdpi": (720, 1280), "xxhdpi": (960, 1600), "xxxhdpi": (1280, 1920)}
SPLASH_LAND = {"mdpi": (480, 320), "hdpi": (800, 480), "xhdpi": (1280, 720), "xxhdpi": (1600, 960), "xxxhdpi": (1920, 1280)}


def round_mask(img):
    size = img.size
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size[0], size[1]), fill=255)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def save(img, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)


for density, size in LAUNCHER_SIZES.items():
    square = ICON_SQUARE.resize((size, size), Image.LANCZOS)
    save(square, os.path.join(RES, f"mipmap-{density}", "ic_launcher.png"))
    save(round_mask(square), os.path.join(RES, f"mipmap-{density}", "ic_launcher_round.png"))

for density, size in FOREGROUND_SIZES.items():
    fg = ICON_MASKABLE.resize((size, size), Image.LANCZOS)
    save(fg, os.path.join(RES, f"mipmap-{density}", "ic_launcher_foreground.png"))

bg_hex = BG_COLOR.lstrip("#")
bg_rgb = tuple(int(bg_hex[i:i + 2], 16) for i in (0, 2, 4))

# Splash: icono centrado (40% del lado corto) sobre el color de fondo de la app.
icon_flat = Image.alpha_composite(Image.new("RGBA", ICON_SQUARE.size, bg_rgb + (255,)), ICON_SQUARE)


def splash(w, h):
    canvas = Image.new("RGBA", (w, h), bg_rgb + (255,))
    icon_side = int(min(w, h) * 0.38)
    icon = icon_flat.resize((icon_side, icon_side), Image.LANCZOS)
    canvas.paste(icon, ((w - icon_side) // 2, (h - icon_side) // 2), icon)
    return canvas.convert("RGB")


for density, (w, h) in SPLASH_PORT.items():
    save(splash(w, h), os.path.join(RES, f"drawable-port-{density}", "splash.png"))
for density, (w, h) in SPLASH_LAND.items():
    save(splash(w, h), os.path.join(RES, f"drawable-land-{density}", "splash.png"))
save(splash(480, 320), os.path.join(RES, "drawable", "splash.png"))

# Color de fondo del icono adaptativo y del splash por defecto, acorde a la marca.
with open(os.path.join(RES, "values", "ic_launcher_background.xml"), "w") as f:
    f.write(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        "<resources>\n"
        f'    <color name="ic_launcher_background">{BG_COLOR}</color>\n'
        "</resources>\n"
    )

print("Iconos y splash de Android generados a partir de public/icon-512*.png.")
