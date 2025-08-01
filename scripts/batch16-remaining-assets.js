import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 16: Process remaining available images from attached_assets
const batch16ImageMappings = [
  // Versace
  { searchBrand: 'Versace', searchName: 'Bright Crystal', exactMatch: true, imageFile: 'Versace – Bright Crystal_1753552822894.webp' },
  
  // Tom Ford products available in assets
  { searchBrand: 'Tom Ford', searchName: 'Oud Wood', imageFile: 'Tom Ford – Oud Wood_1753552822887.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Rose Prick', imageFile: 'Tom Ford – Rose Prick_1753552822888.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Santal Blush', imageFile: 'Tom Ford - Santal Blush_1753552822888.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Soleil Brulant', imageFile: 'Tom Ford – Soleil Brulant_1753552822888.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Tobacco Vanille', imageFile: 'Tom Ford – Tobacco Vanille_1753552822889.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Vanilla Sex', imageFile: 'Tom Ford – Vanilla S_x_1753552822889.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Vanille Fatale', imageFile: 'Tom Ford – Vanille Fatale_1753552822889.webp' }
];

async function updateBatch16Images() {
  console.log(`Starting batch 16 remaining assets for ${batch16ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch16ImageMappings) {
    let foundProducts;
    
    // Handle exact match requirements
    if (mapping.exactMatch) {
      foundProducts = await db
        .select()
        .from(products)
        .where(
          and(
            like(products.brand, `%${mapping.searchBrand}%`),
            eq(products.name, mapping.searchName)
          )
        );
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
  
  console.log(`\n📊 Batch 16 Results:`);
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
  
  console.log(`\n📋 Final remaining products without images (${remainingProducts.length}):`);
  remainingProducts.forEach(product => {
    console.log(`  - ${product.brand} - ${product.name}`);
  });
}

updateBatch16Images()
  .then(() => {
    console.log('\n🎉 Batch 16 remaining assets completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 16 update failed:', error);
    process.exit(1);
  });