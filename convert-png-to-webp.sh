#!/bin/bash

# Directory containing images
IMG_DIR="public/images/readme"

# Find all PNG files except logo.png and convert them
find "$IMG_DIR" -type f -iname "*.png" ! -name "logo.png" | while read -r img; do
  # Output file path with .webp extension
  out="${img%.*}.webp"

  # Convert to webp with width 1440px, keep aspect ratio, quality 80
  cwebp "$img" -resize 1440 0 -q 80 -o "$out"

  echo "Converted: $img -> $out"
done
