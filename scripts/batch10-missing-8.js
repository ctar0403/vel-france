import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 10: The 8 missing images
const batch10ImageMappings = [
  // Montblanc (2 products)
  { searchBrand: 'Montblanc', searchName: 'Legend', imageFile: 'Montblanc – Legend_1753552083125.png' },
  { searchBrand: 'Montblanc', searchName: 'Legend Red', imageFile: 'Montblanc – Legend Red_1753552083125.png' },
  
  // Moschino (3 products)
  { searchBrand: 'Moschino', searchName: 'Bubblegum', imageFile: 'Moschino - Bubblegum_1753552083125.png' },
  { searchBrand: 'Moschino', searchName: 'Toy 2', imageFile: 'Moschino - Toy 2_1753552083126.png' },
  { searchBrand: 'Moschino', searchName: 'Toy Boy', imageFile: 'Moschino - Toy Boy_1753552083126.png' },
  
  // Mugler (3 products)
  { searchBrand: 'Mugler', searchName: 'Angel', imageFile: 'Mugler - Angel_1753552083126.png' },
  { searchBrand: 'Mugler', searchName: 'Aura', imageFile: 'Mugler – Aura_1753552083127.png' },
  { searchBrand: 'Mugler', searchName: 'Nova', imageFile: 'Mugler - Nova_1753552083127.png' }
];

async function updateBatch10Images() {
  console.log(`Processing the final 8 missing images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch10ImageMappings) {
    // Handle special case for regular Legend vs Legend Red
    let searchCondition;
    if (mapping.searchName === 'Legend' && mapping.searchBrand === 'Montblanc') {
      // Find Legend that is NOT Legend Red
      const allLegend = await db
        .select()
        .from(products)
        .where(
          and(
            like(products.brand, '%Montblanc%'),
            like(products.name, '%Legend%')
          )
        );
      
      const regularLegend = allLegend.find(p => !p.name.includes('Red'));
      
      if (regularLegend) {
        const imageUrl = `/assets/${mapping.imageFile}`;
        await db
          .update(products)
          .set({ imageUrl: imageUrl })
          .where(eq(products.id, regularLegend.id));
        
        console.log(`✅ Updated "${regularLegend.brand} - ${regularLegend.name}" with ${mapping.imageFile}`);
        updatedCount++;
      } else {
        console.log(`❌ No regular Legend found for Montblanc`);
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
  
  // Check final total
  const finalCount = await db
    .select()
    .from(products)
    .where(products.imageUrl !== null);
  
  console.log(`\n📊 Batch 10 Results:`);
  console.log(`  Successfully updated: ${updatedCount} products`);
  console.log(`  Not found: ${notFoundCount} products`);
  
  if (notFoundList.length > 0) {
    console.log(`\n❌ Products not found in database:`);
    notFoundList.forEach(item => console.log(`  - ${item}`));
  }
  
  console.log(`\n🎯 Final total: ${finalCount.length} products with images`);
}

// Run batch 10 update
updateBatch10Images()
  .then(() => {
    console.log('\n🎉 Batch 10 - Final 8 missing images completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 10 update failed:', error);
    process.exit(1);
  });