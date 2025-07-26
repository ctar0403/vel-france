import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 11 Missing: The 8 remaining images
const missingImageMappings = [
  // Orto Parisi remaining (2 products)
  { searchBrand: 'Orto Parisi', searchName: 'Terroni', imageFile: 'Orto Parisi – Terroni_1753552335224.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Viride', imageFile: 'Orto Parisi – Viride_1753552335225.png' },
  
  // Paco Rabanne collection (6 products) - handle duplicate 1 Million files
  { searchBrand: 'Paco Rabanne', searchName: '1 Million', imageFile: 'Paco Rabanne - 1 Million_1753552335226.png' },
  { searchBrand: 'Paco Rabanne', searchName: 'Fame', imageFile: 'Paco Rabanne - Fame_1753552335227.png' },
  { searchBrand: 'Paco Rabanne', searchName: 'Invictus', imageFile: 'Paco Rabanne – Invictus_1753552335227.png' },
  { searchBrand: 'Paco Rabanne', searchName: 'Olympea', imageFile: 'Paco Rabanne – Olympea_1753552335228.png' },
  { searchBrand: 'Paco Rabanne', searchName: 'Phantom', imageFile: 'Paco Rabanne - Phantom_1753552335229.png' }
];

async function updateMissingImages() {
  console.log(`Processing the 8 missing images from batch 11...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of missingImageMappings) {
    // Regular search for all products
    const foundProducts = await db
      .select()
      .from(products)
      .where(
        and(
          like(products.brand, `%${mapping.searchBrand}%`),
          like(products.name, `%${mapping.searchName}%`)
        )
      );
    
    if (foundProducts.length >= 1) {
      const product = foundProducts[0]; // Take the first match
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
  
  console.log(`\n📊 Missing images batch results:`);
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
  
  console.log(`\n🎯 Updated total: ${finalCount.length} products with images`);
}

// Run the missing images update
updateMissingImages()
  .then(() => {
    console.log('\n🎉 Missing 8 images from batch 11 completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Missing images update failed:', error);
    process.exit(1);
  });