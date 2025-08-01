import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 7: Missing images found
const batch7ImageMappings = [
  // Mancera missing product
  { searchBrand: 'Mancera', searchName: 'Coco Vanille', imageFile: 'Mancera – Coco Vanille_1753551815824.webp' },
  
  // Maison Francis Kurkdjian missing products
  { searchBrand: 'Maison Francis Kurkdjian', searchName: 'Grand Soir', imageFile: 'Maison Francis Kurkdjian – Grand Soir_1753551815820.webp' },
  { searchBrand: 'Maison Francis Kurkdjian', searchName: 'Oud Satin Mood', imageFile: 'Maison Francis Kurkdjian – Oud Satin Mood_1753551815820.webp' },
  
  // Maison Margiela products (5 products)
  { searchBrand: 'Maison Margiela', searchName: 'Beach Walk', imageFile: 'Maison Margiela – Beach Walk_1753551815821.webp' },
  { searchBrand: 'Maison Margiela', searchName: 'Coffee Break', imageFile: 'Maison Margiela – Coffee Break_1753551815821.webp' },
  { searchBrand: 'Maison Margiela', searchName: 'Jazz Club', imageFile: 'Maison Margiela – Jazz Club_1753551815822.webp' },
  { searchBrand: 'Maison Margiela', searchName: 'Under The Lemon Trees', imageFile: 'Maison Margiela – Under The Lemon Trees_1753551815822.webp' },
  { searchBrand: 'Maison Margiela', searchName: 'When the Rain Stops', imageFile: 'Maison Margiela – When the Rain Stops_1753551815823.webp' }
];

async function updateBatch7Images() {
  console.log(`Starting batch 7 missing images update for ${batch7ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch7ImageMappings) {
    // Find products that match the brand and name
    const foundProducts = await db
      .select()
      .from(products)
      .where(
        and(
          like(products.brand, `%${mapping.searchBrand}%`),
          like(products.name, `%${mapping.searchName}%`)
        )
      );
    
    if (foundProducts.length === 1) {
      const product = foundProducts[0];
      const imageUrl = `/assets/${mapping.imageFile}`;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, product.id));
      
      console.log(`✅ Updated "${product.brand} - ${product.name}" with ${mapping.imageFile}`);
      updatedCount++;
    } else if (foundProducts.length === 0) {
      console.log(`❌ No match for: ${mapping.searchBrand} - ${mapping.searchName}`);
      notFoundList.push(`${mapping.searchBrand} - ${mapping.searchName}`);
      notFoundCount++;
    } else {
      console.log(`⚠️  Multiple matches for: ${mapping.searchBrand} - ${mapping.searchName}`);
      foundProducts.forEach(p => console.log(`    → ${p.brand} - ${p.name}`));
      
      // Take the first match for multiple results
      const productToUpdate = foundProducts[0];
      const imageUrl = `/assets/${mapping.imageFile}`;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, productToUpdate.id));
      
      console.log(`✅ Updated "${productToUpdate.brand} - ${productToUpdate.name}" with ${mapping.imageFile}`);
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Batch 7 Results:`);
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
}

// Run batch 7 update
updateBatch7Images()
  .then(() => {
    console.log('\n🎉 Batch 7 missing images update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 7 update failed:', error);
    process.exit(1);
  });