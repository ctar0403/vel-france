#!/usr/bin/env node

/**
 * Post-build CSS optimization script
 * Converts blocking CSS links to non-blocking preload strategy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist/public');

function optimizeCSSLoading() {
  try {
    // Find the HTML file in dist
    const htmlPath = path.join(distPath, 'index.html');
    
    if (!fs.existsSync(htmlPath)) {
      console.log('No HTML file found in dist, skipping CSS optimization');
      return;
    }

    let html = fs.readFileSync(htmlPath, 'utf8');
    let modified = false;

    // Find all CSS link tags and convert them to preload strategy
    const cssLinkRegex = /<link([^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+\.css)["'][^>]*)>/g;
    
    html = html.replace(cssLinkRegex, (match, attributes, href) => {
      modified = true;
      return `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'">` +
             `<noscript><link rel="stylesheet" href="${href}"></noscript>`;
    });

    if (modified) {
      fs.writeFileSync(htmlPath, html, 'utf8');
      console.log('✅ CSS preloading optimization applied successfully');
      console.log('   - Converted blocking CSS links to non-blocking preload strategy');
      console.log('   - Added noscript fallback for accessibility');
    } else {
      console.log('ℹ️ No CSS links found to optimize');
    }

  } catch (error) {
    console.error('❌ Error optimizing CSS loading:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeCSSLoading();
}

export { optimizeCSSLoading };