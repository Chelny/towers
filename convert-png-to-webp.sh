#!/bin/bash

# Directory containing images
IMG_DIR="public/images/readme"

# Find all PNG files and convert them to WebP
find "$IMG_DIR" -type f -iname "*.png" | while read -r img; do
  # Output file path with .webp extension
  out="${img%.*}.webp"

  # Convert to WebP, quality 80
  cwebp "$img" -q 80 -o "$out"

  echo "Converted: $img -> $out"
done
