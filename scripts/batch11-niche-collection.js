import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 11: Niche luxury collection - Paco Rabanne, Narciso Rodriguez variants, Nasomatto, Orto Parisi
const batch11ImageMappings = [
  // Paco Rabanne (1 product)
  { searchBrand: 'Paco Rabanne', searchName: 'Pure XS For Her', imageFile: 'Paco Rabanne – Pure XS For Her_1753552335217.png' },
  
  // Narciso Rodriguez variants (3 products) - need to handle duplicates
  { searchBrand: 'Narciso Rodriguez', searchName: 'For Her', imageFile: 'Narciso Rodriguez – For Her_1753552335218.png', variant: 'pink' },
  { searchBrand: 'Narciso Rodriguez', searchName: 'Poudree', imageFile: 'Narciso Rodriguez – Poudree_1753552335218.png' },
  { searchBrand: 'Narciso Rodriguez', searchName: 'Rouge', imageFile: 'Narciso Rodriguez – Rouge_1753552335218.png' },
  
  // Nasomatto (1 product)
  { searchBrand: 'Nasomatto', searchName: 'Black Afgano', imageFile: 'Nasomatto – Black Afgano_1753552335219.png' },
  
  // Orto Parisi collection (7 products)
  { searchBrand: 'Orto Parisi', searchName: 'Bergamask', imageFile: 'Orto Parisi – Bergamask_1753552335219.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Boccanera', imageFile: 'Orto Parisi – Boccanera_1753552335219.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Brutus', imageFile: 'Orto Parisi – Brutus_1753552335220.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Cuoium', imageFile: 'Orto Parisi - Cuoium_1753552335220.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Megamare', imageFile: 'Orto Parisi – Megamare_1753552335221.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Seminalis', imageFile: 'Orto Parisi - Seminalis_1753552335222.png' },
  { searchBrand: 'Orto Parisi', searchName: 'Stercus', imageFile: 'Orto Parisi – Stercus_1753552335223.png' }
];

async function updateBatch11Images() {
  console.log(`Starting batch 11 niche collection image update for ${batch11ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch11ImageMappings) {
    // Special handling for Narciso Rodriguez For Her variants
    if (mapping.searchBrand === 'Narciso Rodriguez' && mapping.searchName === 'For Her' && mapping.variant === 'pink') {
      // Find the For Her that doesn't already have an image (the second one)
      const allForHer = await db
        .select()
        .from(products)
        .where(
          and(
            like(products.brand, '%Narciso Rodriguez%'),
            like(products.name, '%For Her%')
          )
        );
      
      const withoutImage = allForHer.find(p => !p.imageUrl);
      
      if (withoutImage) {
        const imageUrl = `/assets/${mapping.imageFile}`;
        await db
          .update(products)
          .set({ imageUrl: imageUrl })
          .where(eq(products.id, withoutImage.id));
        
        console.log(`✅ Updated "${withoutImage.brand} - ${withoutImage.name}" (variant) with ${mapping.imageFile}`);
        updatedCount++;
      } else {
        console.log(`❌ No For Her variant without image found`);
        notFoundCount++;
      }
      continue;
    }
    
    // Regular search for other products
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
  
  console.log(`\n📊 Batch 11 Results:`);
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

// Run batch 11 update
updateBatch11Images()
  .then(() => {
    console.log('\n🎉 Batch 11 niche collection image update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 11 update failed:', error);
    process.exit(1);
  });