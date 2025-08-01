import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 6: Premium luxury brands - Mancera, Louis Vuitton, Maison Francis Kurkdjian
const batch6ImageMappings = [
  // Mancera products (3 products)
  { searchBrand: 'Mancera', searchName: 'Red Tobacco', imageFile: 'Mancera – Red Tobacco_1753551815812.webp' },
  { searchBrand: 'Mancera', searchName: 'Tonka Cola', imageFile: 'Mancera – Tonka Cola_1753551815813.webp' },
  { searchBrand: 'Mancera', searchName: 'Vanille Exclusive', imageFile: 'Mancera – Vanille Exclusive_1753551815814.webp' },
  
  // Louis Vuitton products (6 products)
  { searchBrand: 'Louis Vuitton', searchName: 'Apogee', imageFile: 'Louis Vuitton – Apogee_1753551815814.webp' },
  { searchBrand: 'Louis Vuitton', searchName: 'Attrape-Reves', imageFile: 'Louis Vuitton – Attrape-Reves_1753551815815.webp' },
  { searchBrand: 'Louis Vuitton', searchName: 'Cactus Garden', imageFile: 'Louis Vuitton – Cactus Garden_1753551815815.webp' },
  { searchBrand: 'Louis Vuitton', searchName: 'Matiere Noire', imageFile: 'Louis Vuitton – Matiere Noire_1753551815816.webp' },
  { searchBrand: 'Louis Vuitton', searchName: 'Ombre Nomade', imageFile: 'Louis Vuitton – Ombre Nomade_1753551815817.webp' },
  { searchBrand: 'Louis Vuitton', searchName: 'Orage', imageFile: 'Louis Vuitton – Orage_1753551815818.webp' },
  
  // Maison Francis Kurkdjian products (3 products)
  { searchBrand: 'Maison Francis Kurkdjian', searchName: '724', imageFile: 'Maison Francis Kurkdjian – 724_1753551815818.webp' },
  { searchBrand: 'Maison Francis Kurkdjian', searchName: 'Baccarat Rouge 540 Eau De Parfum', imageFile: 'Maison Francis Kurkdjian – Baccarat Rouge 540 Eau De Parfum_1753551815819.webp' },
  { searchBrand: 'Maison Francis Kurkdjian', searchName: 'Baccarat Rouge 540 Extrait De Parfum', imageFile: 'Maison Francis Kurkdjian – Baccarat Rouge 540 Extrait De Parfum_1753551815819.webp' }
];

async function updateBatch6Images() {
  console.log(`Starting batch 6 luxury brands image update for ${batch6ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch6ImageMappings) {
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
  
  console.log(`\n📊 Batch 6 Results:`);
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

// Run batch 6 update
updateBatch6Images()
  .then(() => {
    console.log('\n🎉 Batch 6 luxury brands image update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 6 update failed:', error);
    process.exit(1);
  });