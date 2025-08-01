#!/usr/bin/env node
/**
 * Scans the codebase for hardcoded English text and generates translation keys
 */

import fs from 'fs';
import path from 'path';

// Text patterns to scan for
const patterns = [
  // String literals in JSX
  />\s*([A-Z][^<>{]*[a-zA-Z])\s*</g,
  // String literals in quotes
  /"([A-Z][^"]*[a-zA-Z])"/g,
  /'([A-Z][^']*[a-zA-Z])'/g,
  // Placeholder attributes
  /placeholder="([^"]+)"/g,
  /placeholder='([^']+)'/g,
  // Title attributes
  /title="([^"]+)"/g,
  /title='([^']+)'/g,
  // Alt attributes
  /alt="([^"]+)"/g,
  /alt='([^']+)'/g,
  // aria-label attributes
  /aria-label="([^"]+)"/g,
  /aria-label='([^']+)'/g,
];

// Files to scan
const filesToScan = [
  'client/src',
];

// Files to ignore
const ignorePatterns = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.vite',
  'locales',
  'assets',
  '.webp',
  '.png',
  '.jpg',
  '.svg',
  '.mp4'
];

function shouldIgnoreFile(filePath) {
  return ignorePatterns.some(pattern => filePath.includes(pattern));
}

function generateTranslationKey(text, filePath) {
  // Create a key based on the text content
  const cleanText = text.trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
  
  // Get filename without extension
  const filename = path.basename(filePath, path.extname(filePath));
  
  // Create key from first few words
  const words = cleanText.split(' ').slice(0, 3).join('');
  return `${filename}.${words}`;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const translations = new Map();
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1].trim();
      
      // Skip if text is too short, all caps, or looks like code
      if (text.length < 3 || 
          text === text.toUpperCase() || 
          /^[A-Z_]+$/.test(text) ||
          /\$\{/.test(text) ||
          /^[0-9]+$/.test(text) ||
          text.includes('px') ||
          text.includes('rem') ||
          text.includes('var(') ||
          text.includes('calc(')) {
        continue;
      }
      
      const key = generateTranslationKey(text, filePath);
      translations.set(key, text);
    }
  });
  
  return translations;
}

function scanDirectory(dirPath) {
  const allTranslations = new Map();
  
  function scanRecursive(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (shouldIgnoreFile(fullPath)) {
        return;
      }
      
      if (stat.isDirectory()) {
        scanRecursive(fullPath);
      } else if (stat.isFile() && /\.(tsx?|jsx?)$/.test(fullPath)) {
        const translations = scanFile(fullPath);
        translations.forEach((text, key) => {
          allTranslations.set(key, text);
        });
        console.log(`Scanned: ${fullPath} - Found ${translations.size} translations`);
      }
    });
  }
  
  scanRecursive(dirPath);
  return allTranslations;
}

// Main execution
console.log('Scanning for hardcoded English text...');

const allTranslations = new Map();

filesToScan.forEach(dir => {
  if (fs.existsSync(dir)) {
    const dirTranslations = scanDirectory(dir);
    dirTranslations.forEach((text, key) => {
      allTranslations.set(key, text);
    });
  }
});

// Convert to array and sort
const translationsArray = Array.from(allTranslations.entries())
  .map(([key, text]) => ({ key, englishText: text }))
  .sort((a, b) => a.key.localeCompare(b.key));

console.log(`\nFound ${translationsArray.length} unique translation keys:`);
translationsArray.forEach(({ key, englishText }) => {
  console.log(`${key}: "${englishText}"`);
});

// Save to JSON file for review
fs.writeFileSync(
  'translations-scan-result.json', 
  JSON.stringify(translationsArray, null, 2)
);

console.log(`\nResults saved to translations-scan-result.json`);