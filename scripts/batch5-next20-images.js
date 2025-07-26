import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Next 20 images - batch 5
const batch5ImageMappings = [
  // Jean Paul Gaultier (2 products)
  { searchBrand: 'Jean Paul Gaultier', searchName: 'Scandal Pour Homme', imageFile: 'Jean Paul Gaultier – Scandal Pour Homme_1753551627384.png' },
  { searchBrand: 'Jean Paul Gaultier', searchName: 'Scandal', imageFile: 'Jean Paul Gaultier – Scandal_1753551627385.png' },
  
  // Kilian products (7 products)
  { searchBrand: 'Kilian', searchName: "Angels' Share", imageFile: 'Kilian – Angels\' Share_1753551627385.png' },
  { searchBrand: 'Kilian', searchName: 'Bad Boys Are No Good But Good Boys Are No Fun', imageFile: 'Kilian – Bad Boys Are No Good But Good Boys Are No Fun_1753551627386.png' },
  { searchBrand: 'Kilian', searchName: 'Black Phantom', imageFile: 'Kilian – Black Phantom_1753551627387.png' },
  { searchBrand: 'Kilian', searchName: 'Good Girl Gone Bad Extreme', imageFile: 'Kilian – Good Girl Gone Bad Extreme_1753551627388.png' },
  { searchBrand: 'Kilian', searchName: 'Good Girl Gone Bad', imageFile: 'Kilian – Good Girl Gone Bad_1753551627389.png' },
  { searchBrand: 'Kilian', searchName: 'Rolling In Love', imageFile: 'Kilian – Rolling In Love_1753551627389.png' },
  { searchBrand: 'Kilian', searchName: 'Roses On Ice', imageFile: 'Kilian – Roses On Ice_1753551627390.png' },
  
  // Lancome products (3 products)
  { searchBrand: 'Lancome', searchName: 'Climat', imageFile: 'Lancome – Climat_1753551627390.png' },
  { searchBrand: 'Lancome', searchName: 'Idole', imageFile: 'Lancome – Idole_1753551627391.png' },
  { searchBrand: 'Lancome', searchName: 'Magie Noire', imageFile: 'Lancome – Magie Noire_1753551627391.png' }
];

async function updateBatch5Images() {
  console.log(`Starting batch 5 image update for ${batch5ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch5ImageMappings) {
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
  
  console.log(`\n📊 Batch 5 Results:`);
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

// Run batch 5 update
updateBatch5Images()
  .then(() => {
    console.log('\n🎉 Batch 5 image update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 5 update failed:', error);
    process.exit(1);
  });