import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for different image types
const sizeConfig = {
  // Hero/banner images
  hero: { desktop: 1920, mobile: 768 },
  banner: { desktop: 1920, mobile: 768 },
  desktop: { width: 1920 },
  mobile: { width: 768 },
  
  // Product and general images
  product: { width: 500 },
  thumb: { width: 300 },
  icon: { width: 100 },
  logo: { width: 400 },
  
  // Default fallback
  default: { width: 800 }
};

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

// Get size configuration based on filename or folder
function getSizeConfig(filePath, filename) {
  const lowerFilename = filename.toLowerCase();
  const lowerPath = filePath.toLowerCase();
  
  // Check filename patterns
  if (lowerFilename.includes('hero') || lowerFilename.includes('banner')) {
    if (lowerFilename.includes('mobile')) {
      return { width: sizeConfig.hero.mobile };
    }
    return { width: sizeConfig.hero.desktop };
  }
  
  if (lowerFilename.includes('desktop')) {
    return { width: sizeConfig.desktop.width };
  }
  
  if (lowerFilename.includes('mobile')) {
    return { width: sizeConfig.mobile.width };
  }
  
  if (lowerFilename.includes('product')) {
    return { width: sizeConfig.product.width };
  }
  
  if (lowerFilename.includes('thumb') || lowerFilename.includes('thumbnail')) {
    return { width: sizeConfig.thumb.width };
  }
  
  if (lowerFilename.includes('icon')) {
    return { width: sizeConfig.icon.width };
  }
  
  if (lowerFilename.includes('logo')) {
    return { width: sizeConfig.logo.width };
  }
  
  // Check folder patterns
  if (lowerPath.includes('hero') || lowerPath.includes('banner')) {
    return { width: sizeConfig.hero.desktop };
  }
  
  if (lowerPath.includes('product')) {
    return { width: sizeConfig.product.width };
  }
  
  if (lowerPath.includes('thumb')) {
    return { width: sizeConfig.thumb.width };
  }
  
  if (lowerPath.includes('icon')) {
    return { width: sizeConfig.icon.width };
  }
  
  // Default configuration
  return { width: sizeConfig.default.width };
}

// Convert single image to WebP
async function convertToWebP(inputPath, outputPath, sizeOptions) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    console.log(`Converting: ${inputPath}`);
    console.log(`Original size: ${metadata.width}x${metadata.height}`);
    
    let sharpInstance = image;
    
    // Resize if needed (only if current width is larger than target)
    if (metadata.width > sizeOptions.width) {
      sharpInstance = sharpInstance.resize(sizeOptions.width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
      console.log(`Resized to: ${sizeOptions.width}px width`);
    }
    
    // Convert to WebP with optimization
    await sharpInstance
      .webp({
        quality: 85,
        effort: 6,
        progressive: true
      })
      .toFile(outputPath);
    
    console.log(`✓ Converted to: ${outputPath}\n`);
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

// Main conversion function
async function convertAllImages() {
  console.log('🚀 Starting WebP conversion process...\n');
  
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
    
    // Get size configuration for this image
    const sizeOptions = getSizeConfig(imagePath, filename);
    
    // Convert the image
    const success = await convertToWebP(imagePath, outputPath, sizeOptions);
    
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
    console.log('All image references in React components have been updated.');
    console.log('Original PNG/JPG files have been deleted.');
  }
}

// Run the conversion
if (import.meta.url === `file://${process.argv[1]}`) {
  convertAllImages().catch(console.error);
}

export { convertAllImages, getSizeConfig, convertToWebP };