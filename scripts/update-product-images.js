import fs from 'fs';
import path from 'path';
import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, or, and, like } from 'drizzle-orm';

// Image mappings from the attached files
const imageMapping = {
  'Azzaro – Wanted By Night': 'Azzaro – Wanted By Night_1753549689340.webp',
  'Boss – Bottled Night': 'Boss – Bottled Night_1753549689341.webp',
  'Boss – Just Different': 'Boss – Just Different_1753549689341.webp',
  'Bottega Veneta – IX Violetta': 'Bottega Veneta – IX Violetta_1753549689342.webp',
  'Bottega Veneta – V Lauro': 'Bottega Veneta – V Lauro_1753549689342.webp',
  'Bottega Veneta – VII Lilla': 'Bottega Veneta – VII Lilla_1753549689342.webp',
  'Bottega Veneta – XV Salvia Blu': 'Bottega Veneta – XV Salvia Blu_1753549689343.webp',
  'Burberry – Goddess': 'Burberry – Goddess_1753549689343.webp',
  'Burberry – Her London Dream': 'Burberry – Her London Dream_1753549689344.webp',
  'Amouage - Honor Man': 'Amouage - Honor Man_1753549689344.webp',
  'Amouage - Interlude Woman': 'Amouage - Interlude Woman_1753549689344.webp',
  'Armani - Acqua Di Gio': 'Armani - Acqua Di Gio_1753549689344.webp'
};

// Function to normalize product names for matching
function normalizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/[–-]/g, ' ')  // Replace dashes with spaces
    .replace(/\s+/g, ' ')   // Replace multiple spaces with single space
    .trim();
}

// Function to find matching products in database
async function findMatchingProducts() {
  const allProducts = await db.select().from(products);
  const matches = [];
  const unmatchedImages = [];
  
  console.log(`Found ${allProducts.length} products in database`);
  console.log(`Have ${Object.keys(imageMapping).length} images to match`);
  
  // Try to match each image to products
  for (const [imageName, imageFile] of Object.entries(imageMapping)) {
    const normalizedImageName = normalizeProductName(imageName);
    let foundMatch = false;
    
    // Look for products that contain the brand and product name
    const imageParts = normalizedImageName.split(' ');
    
    for (const product of allProducts) {
      const fullProductName = `${product.brand || ''} ${product.name || ''}`;
      const normalizedProductName = normalizeProductName(fullProductName);
      
      // Check if the image name matches the product name
      if (normalizedProductName.includes(normalizedImageName) || 
          normalizedImageName.includes(normalizedProductName)) {
        matches.push({
          productId: product.id,
          productName: fullProductName,
          imageName: imageName,
          imageFile: imageFile
        });
        foundMatch = true;
        console.log(`✓ Matched: "${imageName}" → "${fullProductName}"`);
        break;
      }
      
      // Try more flexible matching - check if major keywords match
      const imageKeywords = imageParts.filter(part => part.length > 2);
      const productKeywords = normalizedProductName.split(' ').filter(part => part.length > 2);
      
      const commonKeywords = imageKeywords.filter(keyword => 
        productKeywords.some(pKeyword => 
          pKeyword.includes(keyword) || keyword.includes(pKeyword)
        )
      );
      
      if (commonKeywords.length >= 2 && !foundMatch) {
        matches.push({
          productId: product.id,
          productName: fullProductName,
          imageName: imageName,
          imageFile: imageFile
        });
        foundMatch = true;
        console.log(`✓ Fuzzy matched: "${imageName}" → "${fullProductName}" (${commonKeywords.join(', ')})`);
        break;
      }
    }
    
    if (!foundMatch) {
      unmatchedImages.push(imageName);
      console.log(`✗ No match found for: "${imageName}"`);
    }
  }
  
  return { matches, unmatchedImages };
}

// Function to update product images
async function updateProductImages() {
  console.log('Starting product image update...');
  
  const { matches, unmatchedImages } = await findMatchingProducts();
  
  console.log(`\n📊 Summary:`);
  console.log(`  Matches found: ${matches.length}`);
  console.log(`  Unmatched images: ${unmatchedImages.length}`);
  
  if (unmatchedImages.length > 0) {
    console.log(`\n❌ Unmatched images:`);
    unmatchedImages.forEach(img => console.log(`  - ${img}`));
  }
  
  // Update matched products
  let updatedCount = 0;
  for (const match of matches) {
    try {
      const imageUrl = `/assets/${match.imageFile}`;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, match.productId));
      
      updatedCount++;
      console.log(`✅ Updated "${match.productName}" with image: ${imageUrl}`);
    } catch (error) {
      console.error(`❌ Failed to update "${match.productName}":`, error.message);
    }
  }
  
  console.log(`\n🎉 Successfully updated ${updatedCount} products with images!`);
  
  // Provide manual matching suggestions for unmatched images
  if (unmatchedImages.length > 0) {
    console.log(`\n💡 Manual matching may be needed for:`);
    for (const unmatchedImage of unmatchedImages) {
      console.log(`  - ${unmatchedImage}`);
      
      // Suggest similar products
      const allProducts = await db.select().from(products);
      const imageParts = normalizeProductName(unmatchedImage).split(' ');
      const brand = imageParts[0];
      
      const similarProducts = allProducts.filter(p => 
        normalizeProductName(p.brand || '').includes(brand) ||
        normalizeProductName(p.name || '').includes(brand)
      ).slice(0, 3);
      
      if (similarProducts.length > 0) {
        console.log(`    Possible matches:`);
        similarProducts.forEach(p => {
          console.log(`      → ${p.brand} - ${p.name}`);
        });
      }
    }
  }
}

export { updateProductImages };

// Run the update if called directly
updateProductImages()
  .then(() => {
    console.log('\n✅ Product image update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Product image update failed:', error);
    process.exit(1);
  });