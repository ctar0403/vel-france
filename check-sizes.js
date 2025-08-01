import sharp from 'sharp';
import fs from 'fs';

async function checkImageSizes() {
  const testImages = [
    'attached_assets/Desktop-1_1754051373226.webp',
    'attached_assets/Desktop-2_1754051373227.webp',
    'attached_assets/Mobile-1_1754051370153.webp',
    'attached_assets/Mobile-2_1754051370154.webp'
  ];

  console.log('Current WebP image sizes:');
  
  for (const imagePath of testImages) {
    if (fs.existsSync(imagePath)) {
      try {
        const metadata = await sharp(imagePath).metadata();
        console.log(`${imagePath}: ${metadata.width}x${metadata.height}`);
      } catch (error) {
        console.log(`${imagePath}: Error reading - ${error.message}`);
      }
    } else {
      console.log(`${imagePath}: File not found`);
    }
  }
}

checkImageSizes().catch(console.error);