import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// List of specific products that user reported as missing images
const problemProducts = [
  'Kilian - Angels\' Share',
  'Kilian - Bad Boys Are No Good But Good Boys Are No Fun', 
  'Kilian - Black Phantom',
  'Gucci - Bloom',
  'Lancome - Climat',
  'Gucci - Flora Gorgeous Gardenia',
  'Gucci - Flora Gorgeous Jasmine', 
  'Gucci - Flora Gorgeous Orchid',
  'Kilian - Good Girl Gone Bad',
  'Kilian - Good Girl Gone Bad Extreme',
  'Dior - J\'adore',
  'Dior - Joy',
  'Dior - Joy Intense',
  'Givenchy - L\'Interdit Eau de Parfum Rouge',
  'Hermes - Merveilles',
  'Dior - Miss Dior (EDP)',
  'Dior - Miss Dior Blooming Bouquet',
  'Paco Rabanne - Pure XS',
  'Kilian - Rolling In Love',
  'Kilian - Roses On Ice',
  'Givenchy - Society'
];

async function verifyAndFixImages() {
  console.log('🔍 Verifying image status for problem products...\n');
  
  let foundIssues = 0;
  let fixedIssues = 0;
  
  for (const productName of problemProducts) {
    const [brand, ...nameParts] = productName.split(' - ');
    const name = nameParts.join(' - ');
    
    console.log(`Checking: ${brand} - ${name}`);
    
    // Find product in database
    const foundProducts = await db
      .select()
      .from(products)
      .where(
        and(
          like(products.brand, `%${brand}%`),
          like(products.name, `%${name}%`)
        )
      );
    
    if (foundProducts.length === 0) {
      console.log(`❌ Product not found in database: ${brand} - ${name}`);
      foundIssues++;
      continue;
    }
    
    const product = foundProducts[0];
    
    if (!product.imageUrl) {
      console.log(`❌ No image URL: ${product.brand} - ${product.name}`);
      foundIssues++;
      
      // Try to find matching image file
      const possibleFiles = [
        `${brand} – ${name}`,
        `${brand} - ${name}`,
        `${product.brand} – ${product.name}`,
        `${product.brand} - ${product.name}`
      ];
      
      // Check attached_assets directory for matching files
      const attachedAssetsDir = './attached_assets';
      const files = fs.readdirSync(attachedAssetsDir);
      
      let matchedFile = null;
      for (const possibleName of possibleFiles) {
        const matchingFile = files.find(file => 
          file.startsWith(possibleName) && file.endsWith('.png')
        );
        if (matchingFile) {
          matchedFile = matchingFile;
          break;
        }
      }
      
      if (matchedFile) {
        // Copy file to assets directory
        const sourcePath = path.join(attachedAssetsDir, matchedFile);
        const destPath = path.join('./client/public/assets', matchedFile);
        
        try {
          fs.copyFileSync(sourcePath, destPath);
          
          // Update database
          await db
            .update(products)
            .set({ imageUrl: `/assets/${matchedFile}` })
            .where(eq(products.id, product.id));
          
          console.log(`✅ Fixed: ${product.brand} - ${product.name} with ${matchedFile}`);
          fixedIssues++;
        } catch (error) {
          console.log(`❌ Failed to copy ${matchedFile}: ${error.message}`);
        }
      } else {
        console.log(`❌ No matching image file found for: ${product.brand} - ${product.name}`);
      }
    } else {
      // Check if image file actually exists
      const imagePath = `./client/public${product.imageUrl}`;
      if (!fs.existsSync(imagePath)) {
        console.log(`❌ Image file missing: ${product.imageUrl} for ${product.brand} - ${product.name}`);
        foundIssues++;
        
        // Try to find and copy the correct file
        const attachedAssetsDir = './attached_assets';
        const files = fs.readdirSync(attachedAssetsDir);
        const imageFileName = path.basename(product.imageUrl);
        
        const matchingFile = files.find(file => file === imageFileName);
        if (matchingFile) {
          const sourcePath = path.join(attachedAssetsDir, matchingFile);
          const destPath = imagePath;
          
          try {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✅ Restored missing file: ${matchingFile}`);
            fixedIssues++;
          } catch (error) {
            console.log(`❌ Failed to restore ${matchingFile}: ${error.message}`);
          }
        }
      } else {
        console.log(`✅ OK: ${product.brand} - ${product.name} has valid image`);
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log(`\n📊 Verification Results:`);
  console.log(`  Issues found: ${foundIssues}`);
  console.log(`  Issues fixed: ${fixedIssues}`);
  
  // Final check
  const totalWithImages = await db
    .select()
    .from(products)
    .where(products.imageUrl !== null);
    
  console.log(`\n🎯 Total products with images: ${totalWithImages.length}/220`);
}

verifyAndFixImages()
  .then(() => {
    console.log('\n🎉 Image verification and fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Image verification failed:', error);
    process.exit(1);
  });