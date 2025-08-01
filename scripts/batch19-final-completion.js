import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 19: Final completion - the last 8 luxury perfume products
const batch19ImageMappings = [
  // Tom Ford luxury collection (3 products)
  { searchBrand: 'Tom Ford', searchName: 'Noir', exactMatch: true, imageFile: 'Tom Ford – Noir_1753554890306.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Noir Extreme', imageFile: 'Tom Ford – Noir Extreme_1753554890307.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Ombre Leather', imageFile: 'Tom Ford – Ombre Leather_1753554897638.webp' },
  
  // Sospiro niche (1 product)
  { searchBrand: 'Sospiro', searchName: 'Opera', imageFile: 'Sospiro – Opera_1753554911641.webp' },
  
  // Prada luxury (1 product)
  { searchBrand: 'Prada', searchName: 'Paradoxe Intense', imageFile: 'Prada – Paradoxe Intense_1753554922131.webp' },
  
  // Parfums de Marly (1 product)
  { searchBrand: 'Parfums de Marly', searchName: 'Pegasus', imageFile: 'Parfums de Marly – Pegasus_1753554933716.webp' },
  
  // Zadig & Voltaire (1 product)
  { searchBrand: 'Zadig & Voltaire', searchName: 'This is Her! Undressed', imageFile: 'Zadig & Voltaire – This is Her! Undressed_1753554945220.webp' },
  
  // Yves Saint Laurent (1 product)
  { searchBrand: 'Yves Saint Laurent', searchName: 'Y', exactMatch: true, imageFile: 'Yves Saint Laurent – Y_1753554962130.webp' }
];

async function updateBatch19Images() {
  console.log(`Starting batch 19 final completion for ${batch19ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let replacedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch19ImageMappings) {
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
      const imageUrl = `/assets/${mapping.imageFile}`;
      
      // Check if already has an image (for replacement)
      const hadImage = !!product.imageUrl;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, product.id));
      
      if (hadImage) {
        console.log(`🔄 Replaced "${product.brand} - ${product.name}" with ${mapping.imageFile}`);
        replacedCount++;
      } else {
        console.log(`✅ Added "${product.brand} - ${product.name}" with ${mapping.imageFile}`);
        updatedCount++;
      }
    } else {
      console.log(`❌ No match for: ${mapping.searchBrand} - ${mapping.searchName}`);
      notFoundList.push(`${mapping.searchBrand} - ${mapping.searchName}`);
      notFoundCount++;
    }
  }
  
  console.log(`\n📊 Batch 19 Results:`);
  console.log(`  Successfully added: ${updatedCount} products`);
  console.log(`  Successfully replaced: ${replacedCount} products`);
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
  
  // Show final remaining products without images
  const remainingProducts = await db
    .select()
    .from(products)
    .where(eq(products.imageUrl, null));
  
  console.log(`\n📋 Final remaining products without images (${remainingProducts.length}):`);
  remainingProducts.forEach(product => {
    console.log(`  - ${product.brand} - ${product.name}`);
  });
  
  // Achievement message
  if (remainingProducts.length <= 1) {
    console.log(`\n🏆 CATALOG COMPLETION ACHIEVEMENT UNLOCKED! 🏆`);
    console.log(`🎉 We have reached 99%+ completion with beautiful luxury perfume images!`);
    console.log(`🌟 The Vel France catalog is now virtually complete!`);
  }
}

updateBatch19Images()
  .then(() => {
    console.log('\n🎉 Batch 19 final completion finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 19 update failed:', error);
    process.exit(1);
  });