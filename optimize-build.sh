#!/bin/bash
# High-performance build optimization script for Vel France

echo "🚀 Starting performance optimization build..."

# Set environment variables for maximum optimization
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export VITE_LEGACY=false

# Clear previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Build with production optimizations
echo "📦 Building with production optimizations..."
npm run build

# Apply additional optimizations if tools are available
echo "⚡ Applying post-build optimizations..."

# Create compressed versions for better delivery
if command -v gzip &> /dev/null; then
    echo "📦 Applying Gzip compression..."
    find dist/ -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -9 -k {} \;
    echo "✅ Gzip compression completed"
fi

if command -v brotli &> /dev/null; then
    echo "📦 Applying Brotli compression..."
    find dist/ -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec brotli -q 11 -k {} \;
    echo "✅ Brotli compression completed"
fi

# Optimize images if available
if command -v cwebp &> /dev/null; then
    echo "🖼️  Converting remaining images to WebP..."
    find dist/ -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | while read img; do
        cwebp -q 85 "$img" -o "${img%.*}.webp"
    done
    echo "✅ Image optimization completed"
fi

echo "🎉 Performance optimization build complete!"
echo "📊 Build analysis:"
du -sh dist/
echo ""
echo "📈 Largest files in build:"
find dist/ -type f -exec du -h {} + | sort -hr | head -15

# Check for performance bottlenecks
echo ""
echo "🔍 Performance analysis:"
echo "JavaScript bundles:"
find dist/ -name "*.js" -exec ls -lh {} \; | sort -k5 -hr | head -5
echo ""
echo "CSS bundles:"
find dist/ -name "*.css" -exec ls -lh {} \; | sort -k5 -hr | head -5

echo ""
echo "🚀 Build optimized for maximum performance!"
echo "💡 Deploy this 'dist' folder for best PageSpeed Insights scores"