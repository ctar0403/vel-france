import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 15: Final missing products with available images
const batch15ImageMappings = [
  // Yves Saint Laurent (7 products)
  { searchBrand: 'Yves Saint Laurent', searchName: 'Black Opium', exactMatch: true, imageFile: 'Yves Saint Laurent – Black Opium_1753553187325.png' },
  { searchBrand: 'Yves Saint Laurent', searchName: 'Black Opium Extreme', imageFile: 'Yves Saint Laurent – Black Opium Extreme_1753553187324.png' },
  { searchBrand: 'Yves Saint Laurent', searchName: 'Black Opium Intense', imageFile: 'Yves Saint Laurent – Black Opium Intense_1753553187324.png' },
  { searchBrand: 'Yves Saint Laurent', searchName: 'La Nuit de l\'Homme', imageFile: 'Yves Saint Laurent – La Nuit de l\'Homme_1753553187325.png' },
  { searchBrand: 'Yves Saint Laurent', searchName: 'Libre', exactMatch: true, imageFile: 'Yves Saint Laurent – Libre_1753553187326.png' },
  { searchBrand: 'Yves Saint Laurent', searchName: 'Libre Intense', imageFile: 'Yves Saint Laurent – Libre Intense_1753553187326.png' },
  { searchBrand: 'Yves Saint Laurent', searchName: 'Y', exactMatch: true, imageFile: 'Yves Saint Laurent – Y_1753553187326.png' },
  
  // Zadig & Voltaire (1 product)
  { searchBrand: 'Zadig & Voltaire', searchName: 'This is Her! Undressed', imageFile: 'Zadig & Voltaire – This is Her! Undressed_1753553187327.png' }
];

async function updateBatch15Images() {
  console.log(`Starting batch 15 final missing products for ${batch15ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch15ImageMappings) {
    let foundProducts;
    
    // Handle exact match requirements
    if (mapping.exactMatch) {
      // For exact matches, be more precise
      if (mapping.searchName === 'Black Opium') {
        // Find "Black Opium" but not "Black Opium Extreme" or "Black Opium Intense"
        foundProducts = await db
          .select()
          .from(products)
          .where(
            and(
              like(products.brand, `%${mapping.searchBrand}%`),
              eq(products.name, 'Black Opium')
            )
          );
      } else if (mapping.searchName === 'Libre') {
        // Find "Libre" but not "Libre Intense"
        foundProducts = await db
          .select()
          .from(products)
          .where(
            and(
              like(products.brand, `%${mapping.searchBrand}%`),
              eq(products.name, 'Libre')
            )
          );
      } else if (mapping.searchName === 'Y') {
        // Find exact "Y" match
        foundProducts = await db
          .select()
          .from(products)
          .where(
            and(
              like(products.brand, `%${mapping.searchBrand}%`),
              eq(products.name, 'Y')
            )
          );
      }
    } else {
      // Regular search
      foundProducts = await db
        .select()
        .from(products)
        .where(
          and(
            like(products.brand, `%${mapping.searchBrand}%`),
            like(products.name, `%${mapping.searchName}%`)
          )
        );
    }
    
    if (foundProducts && foundProducts.length >= 1) {
      const product = foundProducts[0];
      
      // Skip if already has an image
      if (product.imageUrl) {
        console.log(`⏭️ Skipped "${product.brand} - ${product.name}" (already has image)`);
        continue;
      }
      
      const imageUrl = `/assets/${mapping.imageFile}`;
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, product.id));
      
      console.log(`✅ Updated "${product.brand} - ${product.name}" with ${mapping.imageFile}`);
      updatedCount++;
    } else {
      console.log(`❌ No match for: ${mapping.searchBrand} - ${mapping.searchName}`);
      notFoundList.push(`${mapping.searchBrand} - ${mapping.searchName}`);
      notFoundCount++;
    }
  }
  
  console.log(`\n📊 Batch 15 Results:`);
  console.log(`  Successfully updated: ${updatedCount} products`);
  console.log(`  Not found: ${notFoundCount} products`);
  
  if (notFoundList.length > 0) {
    console.log(`\n❌ Products not found in database:`);
    notFoundList.forEach(item => console.log(`  - ${item}`));
  }
  
  // Check current total
  const currentCount = await db
    .select()
    .from(products)
    .where(products.imageUrl !== null);
  
  console.log(`\n🎯 Current total: ${currentCount.length} products with images`);
  
  // Show remaining products without images
  const remainingProducts = await db
    .select()
    .from(products)
    .where(eq(products.imageUrl, null));
  
  console.log(`\n📋 Remaining products without images (${remainingProducts.length}):`);
  remainingProducts.forEach(product => {
    console.log(`  - ${product.brand} - ${product.name}`);
  });
}

updateBatch15Images()
  .then(() => {
    console.log('\n🎉 Batch 15 final missing products completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 15 update failed:', error);
    process.exit(1);
  });