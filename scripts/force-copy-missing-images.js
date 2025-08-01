import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Force copy all missing image files - the ones that should exist but don't
const requiredImages = [
  'Kilian – Angels\' Share_1753551627385.png',
  'Kilian – Bad Boys Are No Good But Good Boys Are No Fun_1753551627386.webp',
  'Kilian – Black Phantom_1753551627387.webp',
  'Gucci – Bloom_1753551333696.webp',
  'Lancome – Climat_1753551627390.webp',
  'Gucci – Flora Gorgeous Gardenia_1753551333696.webp',
  'Gucci – Flora Gorgeous Jasmine_1753551333696.webp',
  'Gucci – Flora Gorgeous Orchid_1753551333697.webp',
  'Kilian – Good Girl Gone Bad_1753551627389.webp',
  'Kilian – Good Girl Gone Bad Extreme_1753551627388.webp',
  'Dior – J\'adore_1753551242328.png',
  'Dior – Joy_1753551242329.webp',
  'Dior – Joy Intense_1753551242328.webp',
  'Givenchy – L\'Interdit Eau de Parfum Rouge_1753551333695.png',
  'Hermes – Merveilles_1753551333697.webp',
  'Dior – Miss Dior (EDP)_1753551242329.webp',
  'Dior – Miss Dior Blooming Bouquet_1753551242330.webp',
  'Paco Rabanne – Pure XS For Her_1753552335217.webp',
  'Kilian – Rolling In Love_1753551627389.webp',
  'Kilian – Roses On Ice_1753551627390.webp',
  'Givenchy – Society_1753551333695.webp'
];

async function forceCopyImages() {
  console.log('🔧 Force copying missing image files...\n');
  
  const sourceDir = './attached_assets';
  const destDir = './client/public/assets';
  
  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  let copiedCount = 0;
  let alreadyExistCount = 0;
  let notFoundCount = 0;
  
  for (const imageName of requiredImages) {
    const sourcePath = path.join(sourceDir, imageName);
    const destPath = path.join(destDir, imageName);
    
    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`❌ Source not found: ${imageName}`);
      notFoundCount++;
      continue;
    }
    
    // Check if destination already exists and is valid
    if (fs.existsSync(destPath)) {
      const sourceStats = fs.statSync(sourcePath);
      const destStats = fs.statSync(destPath);
      
      if (sourceStats.size === destStats.size) {
        console.log(`✅ Already exists: ${imageName}`);
        alreadyExistCount++;
        continue;
      }
    }
    
    try {
      // Force copy the file
      fs.copyFileSync(sourcePath, destPath);
      console.log(`📋 Copied: ${imageName}`);
      copiedCount++;
    } catch (error) {
      console.log(`❌ Failed to copy ${imageName}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Copy Results:`);
  console.log(`  Successfully copied: ${copiedCount}`);
  console.log(`  Already existed: ${alreadyExistCount}`);
  console.log(`  Not found in source: ${notFoundCount}`);
  
  // Verify all files now exist
  console.log(`\n🔍 Final verification:`);
  let missingCount = 0;
  for (const imageName of requiredImages) {
    const destPath = path.join(destDir, imageName);
    if (!fs.existsSync(destPath)) {
      console.log(`❌ Still missing: ${imageName}`);
      missingCount++;
    }
  }
  
  if (missingCount === 0) {
    console.log(`✅ All ${requiredImages.length} image files are now present!`);
  } else {
    console.log(`❌ ${missingCount} files are still missing`);
  }
}

forceCopyImages()
  .then(() => {
    console.log('\n🎉 Force copy completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Force copy failed:', error);
    process.exit(1);
  });