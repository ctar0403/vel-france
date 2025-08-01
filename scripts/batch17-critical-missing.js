import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 17: Critical missing products - final push to completion
const batch17ImageMappings = [
  // Tom Ford luxury collection (3 products)
  { searchBrand: 'Tom Ford', searchName: 'Bitter Peach', imageFile: 'Tom Ford - Bitter Peach_1753554288156.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Black Orchid', imageFile: 'Tom Ford – Black Orchid_1753554437896.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Costa Azzurra', imageFile: 'Tom Ford – Costa Azzurra_1753554488467.webp' },
  
  // Roja niche perfumes (2 products)
  { searchBrand: 'Roja', searchName: 'Ahlam', imageFile: 'Roja – Ahlam_1753554347032.webp' },
  { searchBrand: 'Roja', searchName: 'Danger Pour Homme', imageFile: 'Roja – Danger Pour Homme_1753554499826.webp' },
  
  // Tiziana Terenzi niche (1 product)
  { searchBrand: 'Tiziana Terenzi', searchName: 'Andromeda', imageFile: 'Tiziana Terenzi – Andromeda_1753554369049.webp' },
  
  // Prada luxury (1 product)
  { searchBrand: 'Prada', searchName: 'Black Luna Rossa', imageFile: 'Prada - Black Luna Rossa_1753554405484.webp' },
  
  // Versace designer (1 product) - This should replace the existing one
  { searchBrand: 'Versace', searchName: 'Bright Crystal', exactMatch: true, imageFile: 'Versace – Bright Crystal_1753554465269.webp' },
  
  // Parfums de Marly niche (1 product)
  { searchBrand: 'Parfums de Marly', searchName: 'Delina', imageFile: 'Parfums de Marly – Delina_1753554512519.webp' },
  
  // YSL Black Opium series - Update with new high-quality images (3 products)
  { searchBrand: 'Yves Saint Laurent', searchName: 'Black Opium', exactMatch: true, imageFile: 'Yves Saint Laurent – Black Opium_1753554418947.webp' },
  { searchBrand: 'Yves Saint Laurent', searchName: 'Black Opium Intense', imageFile: 'Yves Saint Laurent – Black Opium Intense_1753554422500.webp' },
  { searchBrand: 'Yves Saint Laurent', searchName: 'Black Opium Extreme', imageFile: 'Yves Saint Laurent – Black Opium Extreme_1753554422502.webp' }
];

async function updateBatch17Images() {
  console.log(`Starting batch 17 critical missing products for ${batch17ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let replacedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch17ImageMappings) {
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
  
  console.log(`\n📊 Batch 17 Results:`);
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
}

updateBatch17Images()
  .then(() => {
    console.log('\n🎉 Batch 17 critical missing products completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 17 update failed:', error);
    process.exit(1);
  });