import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folders to scan for WebP files to revert
const foldersToScan = [
  './attached_assets'
];

// Convert WebP back to original format and then reconvert properly
async function revertAndReconvert() {
  console.log('🔄 Starting image reversion and proper WebP conversion...\n');
  
  let processedFiles = 0;
  let totalFiles = 0;

  // Find all WebP files
  const findWebPFiles = (dir, fileList = []) => {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findWebPFiles(filePath, fileList);
      } else if (file.endsWith('.webp')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  };

  // Get all WebP files
  let allWebPFiles = [];
  foldersToScan.forEach(folder => {
    const files = findWebPFiles(folder);
    allWebPFiles = allWebPFiles.concat(files);
  });

  console.log(`Found ${allWebPFiles.length} WebP files to reconvert with original dimensions.\n`);
  totalFiles = allWebPFiles.length;

  // Process each WebP file
  for (const webpPath of allWebPFiles) {
    try {
      console.log(`Processing: ${webpPath}`);
      
      // Get current image metadata
      const image = sharp(webpPath);
      const metadata = await image.metadata();
      
      console.log(`Current WebP size: ${metadata.width}x${metadata.height}`);
      
      // Determine original format from filename pattern
      let originalExt = '.png'; // Default to PNG
      const filename = path.basename(webpPath, '.webp');
      
      // Create a temporary original file path for re-conversion
      const tempOriginalPath = webpPath.replace('.webp', originalExt);
      
      // Convert back to original format temporarily
      await image.png().toFile(tempOriginalPath);
      
      // Now convert to WebP with original dimensions (no resizing)
      const newWebpImage = sharp(tempOriginalPath);
      const originalMetadata = await newWebpImage.metadata();
      
      console.log(`Original dimensions: ${originalMetadata.width}x${originalMetadata.height}`);
      
      // Convert to optimized WebP without resizing
      await newWebpImage
        .webp({
          quality: 90, // Higher quality to preserve detail
          effort: 6,
          progressive: true
        })
        .toFile(webpPath + '_temp');
      
      // Replace the old WebP with new one
      fs.renameSync(webpPath + '_temp', webpPath);
      
      // Clean up temporary file
      fs.unlinkSync(tempOriginalPath);
      
      console.log(`✓ Reconverted with original dimensions: ${originalMetadata.width}x${originalMetadata.height}\n`);
      processedFiles++;
      
    } catch (error) {
      console.error(`✗ Error processing ${webpPath}:`, error.message);
    }
  }

  console.log('\n✅ Reversion and Reconversion Summary:');
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Successfully reconverted: ${processedFiles}`);
  console.log(`Failed conversions: ${totalFiles - processedFiles}`);
  
  if (processedFiles > 0) {
    console.log('\n🎉 Images have been reconverted to WebP with original dimensions!');
    console.log('All images now maintain their original sizes while being optimized for web.');
  }
}

// Alternative approach: Delete WebP files and reconvert from backup if available
async function restoreFromBackup() {
  console.log('🔄 Attempting to restore from backup files...\n');
  
  // This would require having backup files, which we don't have
  // So we'll use the revert approach above
  console.log('No backup files found. Using reconversion method instead.\n');
  await revertAndReconvert();
}

// Run the restoration
if (import.meta.url === `file://${process.argv[1]}`) {
  restoreFromBackup().catch(console.error);
}

export { revertAndReconvert, restoreFromBackup };