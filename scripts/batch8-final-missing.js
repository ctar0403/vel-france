import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 8: Final 8 missing images
const batch8ImageMappings = [
  // Jean Paul Gaultier missing products (7 products)
  { searchBrand: 'Jean Paul Gaultier', searchName: 'La Belle', imageFile: 'Jean Paul Gaultier – La Belle_1753551627392.png' },
  { searchBrand: 'Jean Paul Gaultier', searchName: 'Le Beau EDP', imageFile: 'Jean Paul Gaultier – Le Beau EDP_1753551627393.png' },
  { searchBrand: 'Jean Paul Gaultier', searchName: 'Le Beau EDT', imageFile: 'Jean Paul Gaultier – Le Beau EDT_1753551627393.png' },
  { searchBrand: 'Jean Paul Gaultier', searchName: 'Le Male', imageFile: 'Jean Paul Gaultier – Le Male_1753551627396.png' },
  { searchBrand: 'Jean Paul Gaultier', searchName: 'Le Male Elixir', imageFile: 'Jean Paul Gaultier – Le Male Elixir_1753551627394.png' },
  { searchBrand: 'Jean Paul Gaultier', searchName: 'Le Male Le Parfum', imageFile: 'Jean Paul Gaultier – Le Male Le Parfum_1753551627395.png' },
  { searchBrand: 'Jean Paul Gaultier', searchName: 'Scandal Gold', imageFile: 'Jean Paul Gaultier – Scandal Gold_1753551627396.png' },
  
  // Le Labo missing product (1 product)
  { searchBrand: 'Le Labo', searchName: 'Santal 33', imageFile: 'Le Labo – Santal 33_1753551627392.png' }
];

async function updateBatch8Images() {
  console.log(`Starting batch 8 final missing images update for ${batch8ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch8ImageMappings) {
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
      
      // For Le Male, find the one that matches exactly 'Le Male' (not Elixir or Le Parfum)
      if (mapping.searchName === 'Le Male') {
        const exactMatch = foundProducts.find(p => p.name === 'Le Male');
        if (exactMatch) {
          const imageUrl = `/assets/${mapping.imageFile}`;
          await db
            .update(products)
            .set({ imageUrl: imageUrl })
            .where(eq(products.id, exactMatch.id));
          console.log(`✅ Updated "${exactMatch.brand} - ${exactMatch.name}" with ${mapping.imageFile}`);
          updatedCount++;
          continue;
        }
      }
      
      // Take the first match for other multiple results
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
  
  console.log(`\n📊 Batch 8 Results:`);
  console.log(`  Successfully updated: ${updatedCount} products`);
  console.log(`  Not found: ${notFoundCount} products`);
  
  if (notFoundList.length > 0) {
    console.log(`\n❌ Products not found in database:`);
    notFoundList.forEach(item => console.log(`  - ${item}`));
  }
  
  // Check final total
  const finalCount = await db
    .select()
    .from(products)
    .where(products.imageUrl !== null);
  
  console.log(`\n🎯 Final total: ${finalCount.length} products with images`);
}

// Run batch 8 update
updateBatch8Images()
  .then(() => {
    console.log('\n🎉 Batch 8 final missing images update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 8 update failed:', error);
    process.exit(1);
  });