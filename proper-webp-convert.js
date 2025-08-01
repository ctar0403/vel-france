import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folders to scan
const foldersToScan = [
  './public',
  './assets',
  './attached_assets',
  './client/src/assets',
  './frontend/assets'
];

// Image extensions to convert
const imageExtensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];

// Convert single image to WebP WITHOUT resizing
async function convertToWebPOriginalSize(inputPath, outputPath) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Converting: ${inputPath}`);
    console.log(`Original size: ${metadata.width}x${metadata.height}`);
    
    // Convert to WebP with NO resizing - preserve original dimensions
    await image
      .webp({
        quality: 90, // High quality to preserve detail
        effort: 6,
        progressive: true
      })
      .toFile(outputPath);
    
    console.log(`✓ Converted to WebP (${metadata.width}x${metadata.height}): ${outputPath}\n`);
    return true;
  } catch (error) {
    console.error(`✗ Error converting ${inputPath}:`, error.message);
    return false;
  }
}

// Recursively find all image files
function findImageFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findImageFiles(filePath, fileList);
    } else {
      const ext = path.extname(file);
      if (imageExtensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Update file references in React components
async function updateReactComponents() {
  const componentsDir = './client/src';
  if (!fs.existsSync(componentsDir)) {
    console.log('Components directory not found, skipping React updates');
    return;
  }
  
  const updateFile = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      // Update import statements and file references
      imageExtensions.forEach(ext => {
        const regex = new RegExp(`(['"\`][^'"\`]*?)\\${ext}(['"\`])`, 'g');
        const newContent = content.replace(regex, '$1.webp$2');
        if (newContent !== content) {
          content = newContent;
          updated = true;
        }
      });
      
      if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Updated references in: ${filePath}`);
      }
    } catch (error) {
      console.error(`✗ Error updating ${filePath}:`, error.message);
    }
  };
  
  // Find all JS, TS, JSX, TSX files
  const findReactFiles = (dir, fileList = []) => {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findReactFiles(filePath, fileList);
      } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  };
  
  const reactFiles = findReactFiles(componentsDir);
  reactFiles.forEach(updateFile);
}

// Main conversion function - NO RESIZING
async function convertAllImagesOriginalSize() {
  console.log('🚀 Starting WebP conversion (ORIGINAL SIZES PRESERVED)...\n');
  
  let totalFiles = 0;
  let convertedFiles = 0;
  
  // Find all image files
  let allImageFiles = [];
  foldersToScan.forEach(folder => {
    const files = findImageFiles(folder);
    allImageFiles = allImageFiles.concat(files);
  });
  
  if (allImageFiles.length === 0) {
    console.log('No image files found to convert.');
    return;
  }
  
  console.log(`Found ${allImageFiles.length} image files to convert.\n`);
  
  // Convert each image
  for (const imagePath of allImageFiles) {
    totalFiles++;
    
    const ext = path.extname(imagePath);
    const nameWithoutExt = imagePath.slice(0, -ext.length);
    const outputPath = nameWithoutExt + '.webp';
    const filename = path.basename(imagePath);
    
    // Convert the image WITHOUT resizing
    const success = await convertToWebPOriginalSize(imagePath, outputPath);
    
    if (success) {
      convertedFiles++;
      
      // Delete original file
      try {
        fs.unlinkSync(imagePath);
        console.log(`🗑️  Deleted original: ${imagePath}\n`);
      } catch (error) {
        console.error(`⚠️  Could not delete original ${imagePath}:`, error.message);
      }
    }
  }
  
  console.log('\n📝 Updating React component references...\n');
  await updateReactComponents();
  
  console.log('\n✅ Conversion Summary:');
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Successfully converted: ${convertedFiles}`);
  console.log(`Failed conversions: ${totalFiles - convertedFiles}`);
  
  if (convertedFiles > 0) {
    console.log('\n🎉 WebP conversion completed successfully!');
    console.log('All images converted with ORIGINAL DIMENSIONS preserved.');
    console.log('All image references in React components have been updated.');
    console.log('Original PNG/JPG files have been deleted.');
  }
}

// Run the conversion
if (import.meta.url === `file://${process.argv[1]}`) {
  convertAllImagesOriginalSize().catch(console.error);
}

export { convertAllImagesOriginalSize };