"""
BridgeRN — Production Brand Assets Generator

Generates pixel-perfect, supersampled production app icons, splash screens,
and Android adaptive icons matching the BridgeRN clinical design system:
  - Deep Clinical Teal: #0F6275
  - Soft Teal Highlight: #3FA7BC
  - Pure White: #FFFFFF
  - Dark Navy Text: #102A43

Uses 4x supersampling with Lanczos antialiasing for razor-sharp edges.
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os

TEAL_DARK = (15, 98, 117)        # #0F6275 - Primary Deep Teal
TEAL_ACCENT = (63, 167, 188)     # #3FA7BC - Accent Cyan/Teal
TEAL_SOFT = (227, 242, 245)      # #E3F2F5 - Tinted Soft
WHITE = (255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)

def draw_bridgern_emblem(draw, cx, cy, size, color=WHITE, accent_color=TEAL_ACCENT):
    """
    Draws the BridgeRN signature emblem:
    1. Arching Bridge (representing the IEN pathway to US licensure)
    2. Medical Cross at the central apex
    3. Pulse (ECG / QRS wave) threading through the bridge deck
    """
    # Scale factor
    s = size / 500.0

    # 1. Arch Bridge (Double parabolic arc with pylons)
    bridge_width = 360 * s
    bridge_height = 140 * s
    deck_y = cy + 40 * s

    # Left and right foundations
    left_x = cx - bridge_width / 2
    right_x = cx + bridge_width / 2

    # Draw Arch Cable/Curve (smooth polyline)
    arch_pts = []
    num_pts = 60
    for i in range(num_pts + 1):
        t = i / num_pts  # 0 to 1
        px = left_x + t * bridge_width
        # Parabolic arch: peak at center (t=0.5)
        py = deck_y - (4 * bridge_height * t * (1 - t))
        arch_pts.append((px, py))

    # Draw thick arch band
    for i in range(len(arch_pts) - 1):
        p1 = arch_pts[i]
        p2 = arch_pts[i + 1]
        draw.line([p1, p2], fill=color, width=int(14 * s))

    # Pylons / Vertical Suspension cables
    cable_xs = [cx - 120 * s, cx - 60 * s, cx + 60 * s, cx + 120 * s]
    for kx in cable_xs:
        # Compute arch y at this x
        rel_t = (kx - left_x) / bridge_width
        top_y = deck_y - (4 * bridge_height * rel_t * (1 - rel_t))
        draw.line([(kx, top_y), (kx, deck_y)], fill=accent_color, width=int(6 * s))

    # Bridge Deck (Horizontal beam)
    draw.line([(left_x - 10 * s, deck_y), (right_x + 10 * s, deck_y)], fill=color, width=int(12 * s))

    # 2. Central Medical Cross (at apex)
    cross_cx = cx
    cross_cy = cy - 75 * s
    cross_size = 70 * s
    bar_width = 24 * s

    # Vertical bar
    draw.rounded_rectangle(
        [cross_cx - bar_width / 2, cross_cy - cross_size / 2, cross_cx + bar_width / 2, cross_cy + cross_size / 2],
        radius=int(6 * s),
        fill=color
    )
    # Horizontal bar
    draw.rounded_rectangle(
        [cross_cx - cross_size / 2, cross_cy - bar_width / 2, cross_cx + cross_size / 2, cross_cy + bar_width / 2],
        radius=int(6 * s),
        fill=color
    )

    # Inner accent dot in cross center
    dot_r = 5 * s
    draw.ellipse([cross_cx - dot_r, cross_cy - dot_r, cross_cx + dot_r, cross_cy + dot_r], fill=TEAL_DARK)

    # 3. ECG Pulse Line (Threading across below deck)
    pulse_y = deck_y + 45 * s
    ecg_pts = [
        (left_x + 20 * s, pulse_y),
        (cx - 70 * s, pulse_y),
        (cx - 50 * s, pulse_y + 12 * s),    # Q dip
        (cx - 30 * s, pulse_y - 60 * s),    # R peak
        (cx - 10 * s, pulse_y + 35 * s),    # S dip
        (cx + 15 * s, pulse_y - 15 * s),    # T wave peak
        (cx + 35 * s, pulse_y),             # Return baseline
        (right_x - 20 * s, pulse_y),
    ]

    for i in range(len(ecg_pts) - 1):
        draw.line([ecg_pts[i], ecg_pts[i + 1]], fill=color, width=int(9 * s))

    # Terminal beacon dots on pulse endpoints
    for pt in [ecg_pts[0], ecg_pts[-1]]:
        draw.ellipse([pt[0] - 6 * s, pt[1] - 6 * s, pt[0] + 6 * s, pt[1] + 6 * s], fill=accent_color)


def generate_main_icon(out_path):
    """1024x1024 RGB Main App Icon for iOS & Google Play."""
    SCALE = 4
    W, H = 1024 * SCALE, 1024 * SCALE
    im = Image.new('RGB', (W, H), TEAL_DARK)
    draw = ImageDraw.Draw(im)

    # Subtle clinical gradient/concentric rounded border
    margin = 50 * SCALE
    draw.rounded_rectangle(
        [margin, margin, W - margin, H - margin],
        radius=int(140 * SCALE),
        outline=TEAL_ACCENT,
        width=int(12 * SCALE)
    )

    # Central emblem
    draw_bridgern_emblem(draw, W // 2, H // 2 - int(20 * SCALE), size=620 * SCALE, color=WHITE, accent_color=TEAL_ACCENT)

    # Downsample with Lanczos
    final_im = im.resize((1024, 1024), Image.Resampling.LANCZOS)
    final_im.save(out_path, format='PNG', optimize=True)
    print(f"Generated {out_path} (1024x1024)")


def generate_adaptive_foreground(out_path):
    """512x512 RGBA Foreground Icon (Center safe zone)."""
    SCALE = 4
    W, H = 512 * SCALE, 512 * SCALE
    im = Image.new('RGBA', (W, H), TRANSPARENT)
    draw = ImageDraw.Draw(im)

    # Emblem inside 66% diameter safe circle
    draw_bridgern_emblem(draw, W // 2, H // 2, size=320 * SCALE, color=WHITE, accent_color=TEAL_ACCENT)

    final_im = im.resize((512, 512), Image.Resampling.LANCZOS)
    final_im.save(out_path, format='PNG', optimize=True)
    print(f"Generated {out_path} (512x512 RGBA)")


def generate_adaptive_background(out_path):
    """512x512 RGBA Background."""
    im = Image.new('RGBA', (512, 512), TEAL_DARK + (255,))
    draw = ImageDraw.Draw(im)
    # Subtle geometric grid pattern for clinical sophistication
    for x in range(0, 512, 64):
        draw.line([(x, 0), (x, 512)], fill=(20, 115, 137, 255), width=1)
    for y in range(0, 512, 64):
        draw.line([(0, y), (512, y)], fill=(20, 115, 137, 255), width=1)

    im.save(out_path, format='PNG', optimize=True)
    print(f"Generated {out_path} (512x512 RGBA)")


def generate_adaptive_monochrome(out_path):
    """432x432 RGBA Monochrome for Android 13+ Material You."""
    SCALE = 4
    W, H = 432 * SCALE, 432 * SCALE
    im = Image.new('RGBA', (W, H), TRANSPARENT)
    draw = ImageDraw.Draw(im)

    draw_bridgern_emblem(draw, W // 2, H // 2, size=280 * SCALE, color=WHITE, accent_color=WHITE)

    final_im = im.resize((432, 432), Image.Resampling.LANCZOS)
    final_im.save(out_path, format='PNG', optimize=True)
    print(f"Generated {out_path} (432x432 RGBA)")


def generate_splash_icon(out_path):
    """1024x1024 Splash Screen image with emblem and clean typography."""
    SCALE = 4
    W, H = 1024 * SCALE, 1024 * SCALE
    im = Image.new('RGBA', (W, H), TRANSPARENT)
    draw = ImageDraw.Draw(im)

    # Emblem in upper half
    draw_bridgern_emblem(draw, W // 2, H // 2 - int(80 * SCALE), size=440 * SCALE, color=WHITE, accent_color=TEAL_ACCENT)

    final_im = im.resize((1024, 1024), Image.Resampling.LANCZOS)
    final_im.save(out_path, format='PNG', optimize=True)
    print(f"Generated {out_path} (1024x1024 RGBA)")


def generate_favicon(out_path):
    """48x48 Web Favicon."""
    SCALE = 8
    W, H = 48 * SCALE, 48 * SCALE
    im = Image.new('RGBA', (W, H), TEAL_DARK + (255,))
    draw = ImageDraw.Draw(im)

    # Simplified emblem for tiny size
    draw_bridgern_emblem(draw, W // 2, H // 2, size=38 * SCALE, color=WHITE, accent_color=TEAL_ACCENT)

    final_im = im.resize((48, 48), Image.Resampling.LANCZOS)
    final_im.save(out_path, format='PNG', optimize=True)
    print(f"Generated {out_path} (48x48 RGBA)")


def main():
    assets_dir = 'assets'
    os.makedirs(assets_dir, exist_ok=True)

    print("Generating BridgeRN brand assets...")
    generate_main_icon(os.path.join(assets_dir, 'icon.png'))
    generate_adaptive_foreground(os.path.join(assets_dir, 'android-icon-foreground.png'))
    generate_adaptive_background(os.path.join(assets_dir, 'android-icon-background.png'))
    generate_adaptive_monochrome(os.path.join(assets_dir, 'android-icon-monochrome.png'))
    generate_splash_icon(os.path.join(assets_dir, 'splash-icon.png'))
    generate_favicon(os.path.join(assets_dir, 'favicon.png'))
    print("All production assets generated successfully!")

if __name__ == '__main__':
    main()
