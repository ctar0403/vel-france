#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const CODE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next'];

class ImageConverter {
  constructor() {
    this.convertedImages = [];
    this.updatedFiles = [];
    this.errors = [];
  }

  // Recursively find all files in directory
  findFiles(dir, extensions, excludeDirs = []) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!excludeDirs.includes(item)) {
            files.push(...this.findFiles(fullPath, extensions, excludeDirs));
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
    
    return files;
  }

  // Convert image to WebP
  async convertToWebP(imagePath) {
    try {
      const parsedPath = path.parse(imagePath);
      const webpPath = path.join(parsedPath.dir, parsedPath.name + '.webp');
      
      // Skip if WebP already exists
      if (fs.existsSync(webpPath)) {
        console.log(`⚠️  WebP already exists: ${webpPath}`);
        return webpPath;
      }
      
      console.log(`🔄 Converting: ${imagePath}`);
      
      await sharp(imagePath)
        .webp({ quality: 90 }) // High quality conversion
        .toFile(webpPath);
      
      console.log(`✅ Converted: ${webpPath}`);
      this.convertedImages.push({ original: imagePath, webp: webpPath });
      
      return webpPath;
    } catch (error) {
      console.error(`❌ Error converting ${imagePath}:`, error.message);
      this.errors.push({ file: imagePath, error: error.message });
      return null;
    }
  }

  // Update file references
  updateFileReferences(filePath, imageMap) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      for (const { original, webp } of imageMap) {
        const originalName = path.basename(original);
        const webpName = path.basename(webp);
        
        // Create various patterns to match different import/reference styles
        const patterns = [
          // Direct file references
          new RegExp(`(['"\`])([^'"\`]*${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\1`, 'g'),
          // Import statements
          new RegExp(`(from\\s+['"\`])([^'"\`]*${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(['"\`])`, 'g'),
          // Require statements
          new RegExp(`(require\\s*\\(['"\`])([^'"\`]*${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(['"\`]\\))`, 'g'),
          // Asset imports (Vite/webpack style)
          new RegExp(`(@assets/)([^'"\`\\s]*${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g'),
        ];
        
        patterns.forEach(pattern => {
          const newContent = content.replace(pattern, (match, ...groups) => {
            const replacement = match.replace(originalName, webpName);
            if (replacement !== match) {
              updated = true;
              console.log(`  📝 ${path.basename(filePath)}: ${originalName} → ${webpName}`);
            }
            return replacement;
          });
          content = newContent;
        });
      }
      
      if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.updatedFiles.push(filePath);
        console.log(`✅ Updated references in: ${filePath}`);
      }
      
    } catch (error) {
      console.error(`❌ Error updating ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  // Main conversion process
  async run() {
    console.log('🚀 Starting image conversion to WebP...\n');
    
    // Find all image files
    console.log('📂 Scanning for images...');
    const imageFiles = this.findFiles('.', IMAGE_EXTENSIONS, EXCLUDE_DIRS);
    console.log(`Found ${imageFiles.length} image files\n`);
    
    if (imageFiles.length === 0) {
      console.log('No images found to convert.');
      return;
    }
    
    // Convert images to WebP
    console.log('🖼️  Converting images...');
    for (const imagePath of imageFiles) {
      await this.convertToWebP(imagePath);
    }
    
    if (this.convertedImages.length === 0) {
      console.log('\n⚠️  No new images were converted.');
      return;
    }
    
    console.log(`\n✅ Converted ${this.convertedImages.length} images\n`);
    
    // Find all code files
    console.log('📝 Scanning for code files...');
    const codeFiles = this.findFiles('.', CODE_EXTENSIONS, EXCLUDE_DIRS);
    console.log(`Found ${codeFiles.length} code files\n`);
    
    // Update file references
    console.log('🔄 Updating file references...');
    for (const codeFile of codeFiles) {
      this.updateFileReferences(codeFile, this.convertedImages);
    }
    
    // Print summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 CONVERSION SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`✅ Images converted: ${this.convertedImages.length}`);
    console.log(`📝 Files updated: ${this.updatedFiles.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.convertedImages.length > 0) {
      console.log('\n🖼️  Converted Images:');
      this.convertedImages.forEach(({ original, webp }) => {
        console.log(`  ${path.basename(original)} → ${path.basename(webp)}`);
      });
    }
    
    if (this.updatedFiles.length > 0) {
      console.log('\n📝 Updated Files:');
      this.updatedFiles.forEach(file => {
        console.log(`  ${file}`);
      });
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
      });
    }
    
    console.log('\n🎉 Conversion complete!');
    console.log('💡 You can now manually delete the original .png and .jpg files if desired.');
  }
}

// Run the converter
if (require.main === module) {
  const converter = new ImageConverter();
  converter.run().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ImageConverter;