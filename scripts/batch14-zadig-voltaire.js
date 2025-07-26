import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 14: Additional Zadig & Voltaire products
const batch14ImageMappings = [
  // Zadig & Voltaire (2 products)
  { searchBrand: 'Zadig & Voltaire', searchName: 'This is Us!', imageFile: 'Zadig & Voltaire – This is Us!_1753553429566.png' },
  { searchBrand: 'Zadig & Voltaire', searchName: 'This is Him', imageFile: 'Zadig & Voltaire – This is Him_1753553429567.png' }
];

async function updateBatch14Images() {
  console.log(`Starting batch 14 Zadig & Voltaire update for ${batch14ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch14ImageMappings) {
    let searchName = mapping.searchName;
    
    // Handle "This is Him" vs "This is Him!" variations
    if (mapping.searchName === 'This is Him') {
      // Try both variations
      const nameVariations = ['This is Him', 'This is Him!'];
      let foundProduct = null;
      
      for (const nameVar of nameVariations) {
        const foundProducts = await db
          .select()
          .from(products)
          .where(
            and(
              like(products.brand, `%${mapping.searchBrand}%`),
              like(products.name, `%${nameVar}%`)
            )
          );
        
        // Find one without an image (since we might have processed "This is Him! Vibes of Freedom" already)
        const productWithoutImage = foundProducts.find(p => !p.imageUrl);
        if (productWithoutImage) {
          foundProduct = productWithoutImage;
          break;
        }
      }
      
      if (foundProduct) {
        const imageUrl = `/assets/${mapping.imageFile}`;
        await db
          .update(products)
          .set({ imageUrl: imageUrl })
          .where(eq(products.id, foundProduct.id));
        
        console.log(`✅ Updated "${foundProduct.brand} - ${foundProduct.name}" with ${mapping.imageFile}`);
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
  
  console.log(`\n📊 Batch 14 Results:`);
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

updateBatch14Images()
  .then(() => {
    console.log('\n🎉 Batch 14 Zadig & Voltaire update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 14 update failed:', error);
    process.exit(1);
  });