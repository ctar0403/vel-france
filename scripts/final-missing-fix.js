import fs from 'fs';
import path from 'path';
import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Final fix for the 6 remaining missing images
const finalMissingProducts = [
  { brand: 'Kilian', name: 'Angels\' Share' },
  { brand: 'Dior', name: 'J\'adore' },
  { brand: 'Givenchy', name: 'L\'Interdit Eau de Parfum Rouge' },
  { brand: 'Yves Saint Laurent', name: 'La Nuit de l\'Homme' },
  { brand: 'Yves Saint Laurent', name: 'Libre' },
  { brand: 'Yves Saint Laurent', name: 'Libre Intense' }
];

async function fixFinalMissingImages() {
  console.log('🔧 Final fix for 6 missing product images...\n');
  
  const sourceDir = './attached_assets';
  const destDir = './client/public/assets';
  
  // Get all files from attached_assets
  const allFiles = fs.readdirSync(sourceDir);
  
  let fixedCount = 0;
  
  for (const product of finalMissingProducts) {
    console.log(`Searching for: ${product.brand} - ${product.name}`);
    
    // Find the product in database
    const foundProducts = await db
      .select()
      .from(products)
      .where(
        and(
          like(products.brand, `%${product.brand}%`),
          like(products.name, `%${product.name}%`)
        )
      );
    
    if (foundProducts.length === 0) {
      console.log(`❌ Product not found in database: ${product.brand} - ${product.name}`);
      continue;
    }
    
    const dbProduct = foundProducts[0];
    
    // Find matching image file with various name patterns
    const searchPatterns = [
      `${product.brand} – ${product.name}`,
      `${product.brand} - ${product.name}`,
      `${dbProduct.brand} – ${dbProduct.name}`,
      `${dbProduct.brand} - ${dbProduct.name}`
    ];
    
    let matchedFile = null;
    for (const pattern of searchPatterns) {
      const matchingFile = allFiles.find(file => 
        file.toLowerCase().includes(pattern.toLowerCase()) && file.endsWith('.png')
      );
      if (matchingFile) {
        matchedFile = matchingFile;
        break;
      }
    }
    
    // Also try partial matching for key words
    if (!matchedFile) {
      const keyWords = product.name.split(' ').filter(word => word.length > 2);
      for (const word of keyWords) {
        const partialMatch = allFiles.find(file => 
          file.toLowerCase().includes(product.brand.toLowerCase()) &&
          file.toLowerCase().includes(word.toLowerCase()) &&
          file.endsWith('.png')
        );
        if (partialMatch) {
          matchedFile = partialMatch;
          break;
        }
      }
    }
    
    if (matchedFile) {
      const sourcePath = path.join(sourceDir, matchedFile);
      const destPath = path.join(destDir, matchedFile);
      
      try {
        // Copy the file
        fs.copyFileSync(sourcePath, destPath);
        
        // Update database with the image URL
        const imageUrl = `/assets/${matchedFile}`;
        await db
          .update(products)
          .set({ imageUrl: imageUrl })
          .where(eq(products.id, dbProduct.id));
        
        console.log(`✅ Fixed: ${dbProduct.brand} - ${dbProduct.name} with ${matchedFile}`);
        fixedCount++;
      } catch (error) {
        console.log(`❌ Failed to copy ${matchedFile}: ${error.message}`);
      }
    } else {
      console.log(`❌ No matching file found for: ${product.brand} - ${product.name}`);
      
      // List files that might be related
      const relatedFiles = allFiles.filter(file => 
        file.toLowerCase().includes(product.brand.toLowerCase().split(' ')[0])
      );
      if (relatedFiles.length > 0) {
        console.log(`   Related files found: ${relatedFiles.slice(0, 3).join(', ')}`);
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log(`📊 Final Results:`);
  console.log(`  Successfully fixed: ${fixedCount} products`);
  
  // Verify final status
  const totalWithImages = await db
    .select()
    .from(products)
    .where(products.imageUrl !== null);
    
  console.log(`\n🎯 Total products with images: ${totalWithImages.length}/220`);
}

fixFinalMissingImages()
  .then(() => {
    console.log('\n🎉 Final missing image fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Final fix failed:', error);
    process.exit(1);
  });