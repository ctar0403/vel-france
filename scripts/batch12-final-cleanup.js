import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Final cleanup of remaining images from the current batch
const finalCleanupMappings = [
  // Nasomatto (2 products)
  { searchBrand: 'Nasomatto', searchName: 'Black Afgano', imageFile: 'Nasomatto – Black Afgano_1753552335219.png' },
  { searchBrand: 'Nasomatto', searchName: 'Blamage', imageFile: 'Nasomatto – Blamage_1753552335219.png' },
  
  // Orto Parisi (9 products)
  { searchBrand: 'Orto Parisi', searchName: 'Bergamask', imageFile: 'Orto Parisi – Bergamask_1753552335220.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Boccanera', imageFile: 'Orto Parisi – Boccanera_1753552335220.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Brutus', imageFile: 'Orto Parisi – Brutus_1753552335221.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Cuoium', imageFile: 'Orto Parisi – Cuoium_1753552335221.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Megamare', imageFile: 'Orto Parisi – Megamare_1753552335222.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Seminalis', imageFile: 'Orto Parisi – Seminalis_1753552335222.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Stercus', imageFile: 'Orto Parisi – Stercus_1753552335223.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Terroni', imageFile: 'Orto Parisi – Terroni_1753552335223.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Viride', imageFile: 'Orto Parisi – Viride_1753552335224.png' },
  
  // Paco Rabanne (8 products) - handling both dash variations
  { searchBrand: 'Paco Rabanne', searchName: '1 Million', imageFile: 'Paco Rabanne – 1 Million_1753552335224.png' },
  { searchBrand: 'Paco Rabanne', searchName: '1 Million Parfum', imageFile: 'Paco Rabanne - 1 Million_1753552335226.png' },
  { searchBrand: 'Paco Rabanne', searchName: 'Fame', imageFile: 'Paco Rabanne – Fame_1753552335225.png' },
  { searchBrand: 'Paco Rabanne', searchName: 'Invictus', imageFile: 'Paco Rabanne – Invictus_1753552335225.png' },
  { searchBrand: 'Paco Rabanne', searchName: 'Olympea', imageFile: 'Paco Rabanne – Olympea_1753552335226.png' },
  { searchBrand: 'Paco Rabanne', searchName: 'Phantom', imageFile: 'Paco Rabanne – Phantom_1753552335227.png' },
  { searchBrand: 'Paco Rabanne', searchName: 'Pure XS For Her', imageFile: 'Paco Rabanne – Pure XS For Her_1753552335227.png' },
  { searchBrand: 'Paco Rabanne', searchName: 'Pure XS', imageFile: 'Paco Rabanne – Pure XS_1753552335228.png' }
];

async function updateFinalCleanupImages() {
  console.log(`Processing final ${finalCleanupMappings.length} cleanup images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of finalCleanupMappings) {
    let searchName = mapping.searchName;
    
    // Handle special cases for Paco Rabanne 1 Million variations
    if (mapping.searchBrand === 'Paco Rabanne' && mapping.searchName === '1 Million Parfum') {
      // Look for products that contain "1 Million" but not the basic one already processed
      const foundProducts = await db
        .select()
        .from(products)
        .where(
          and(
            like(products.brand, `%${mapping.searchBrand}%`),
            like(products.name, '%1 Million%')
          )
        );
      
      // Find one without an image
      const productWithoutImage = foundProducts.find(p => !p.imageUrl);
      if (productWithoutImage) {
        const imageUrl = `/assets/${mapping.imageFile}`;
        await db
          .update(products)
          .set({ imageUrl: imageUrl })
          .where(eq(products.id, productWithoutImage.id));
        
        console.log(`✅ Updated "${productWithoutImage.brand} - ${productWithoutImage.name}" with ${mapping.imageFile}`);
        updatedCount++;
        continue;
      }
    }
    
    // Regular search for other products
    const foundProducts = await db
      .select()
      .from(products)
      .where(
        and(
          like(products.brand, `%${mapping.searchBrand}%`),
          like(products.name, `%${searchName}%`)
        )
      );
    
    if (foundProducts.length >= 1) {
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
      console.log(`❌ No match for: ${mapping.searchBrand} - ${searchName}`);
      notFoundList.push(`${mapping.searchBrand} - ${searchName}`);
      notFoundCount++;
    }
  }
  
  console.log(`\n📊 Final cleanup results:`);
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

updateFinalCleanupImages()
  .then(() => {
    console.log('\n🎉 Final cleanup completed! All available images processed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Final cleanup failed:', error);
    process.exit(1);
  });