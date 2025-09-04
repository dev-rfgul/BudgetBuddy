#!/usr/bin/env bash
# Small helper: convert the SVG assets to PNGs using rsvg-convert or imagemagick
# Usage: cd client/public/icons && ./generate-pngs.sh
set -e
if command -v rsvg-convert >/dev/null 2>&1; then
  CONVERTER=rsvg-convert
elif command -v convert >/dev/null 2>&1; then
  CONVERTER=convert
else
  echo "Install rsvg-convert (librsvg) or ImageMagick (convert) to generate PNGs."
  exit 1
fi

sizes=(72 96 128 144 152 192 384 512)
for sz in "${sizes[@]}"; do
  src="icon-${sz}x${sz}.svg"
  out="icon-${sz}x${sz}.png"
  if [ -f "$src" ]; then
    echo "Generating $out from $src"
    if [ "$CONVERTER" = "rsvg-convert" ]; then
      rsvg-convert -w $sz -h $sz -o "$out" "$src"
    else
      convert -background none -resize ${sz}x${sz} "$src" "$out"
    fi
  else
    echo "Skipping $src (not found)"
  fi
done

echo "Done. Commit PNG files to client/public/icons to complete PWA icons."
