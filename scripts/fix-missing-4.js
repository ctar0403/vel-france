import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and, isNull } from 'drizzle-orm';

// Fix the 4 remaining images by targeting specific products that should have images
const targetUpdates = [
  // Products that should definitely have images based on our available files
  { searchBrand: 'Paco Rabanne', searchName: '1 Million Parfum', imageFile: 'Paco Rabanne – 1 Million_1753552335226.webp' },
  { searchBrand: 'Moschino', searchName: 'Toy 2 Bubble Gum', imageFile: 'Moschino - Bubblegum_1753552083125.webp' },
  { searchBrand: 'Mugler', searchName: 'Angel', imageFile: 'Mugler - Angel_1753552083126.webp' },
  { searchBrand: 'Mugler', searchName: 'Nova', imageFile: 'Mugler - Nova_1753552083127.webp' }
];

async function fixMissing4Images() {
  console.log('Fixing the 4 missing images...');
  
  let updatedCount = 0;
  
  for (const update of targetUpdates) {
    // Find products without images that match our criteria
    const matchingProducts = await db
      .select()
      .from(products)
      .where(
        and(
          like(products.brand, `%${update.searchBrand}%`),
          like(products.name, `%${update.searchName}%`),
          isNull(products.imageUrl)
        )
      );
    
    if (matchingProducts.length > 0) {
      const product = matchingProducts[0];
      const imageUrl = `/assets/${update.imageFile}`;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, product.id));
      
      console.log(`✅ Updated "${product.brand} - ${product.name}" with ${update.imageFile}`);
      updatedCount++;
    } else {
      console.log(`❌ No match found for: ${update.searchBrand} - ${update.searchName}`);
    }
  }
  
  // Check final count
  const finalCount = await db
    .select()
    .from(products)
    .where(products.imageUrl !== null);
  
  console.log(`\n📊 Fixed ${updatedCount} missing images`);
  console.log(`🎯 Final total: ${finalCount.length} products with images`);
}

fixMissing4Images()
  .then(() => {
    console.log('\n🎉 Missing 4 images fixed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });