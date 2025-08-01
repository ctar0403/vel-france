import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 13: Luxury finale - Zadig & Voltaire, Versace, Viktor & Rolf, Xerjoff collection
const batch13ImageMappings = [
  // Zadig & Voltaire (2 products)
  { searchBrand: 'Zadig & Voltaire', searchName: 'This is Her', imageFile: 'Zadig & Voltaire – This is Her_1753553187318.webp' },
  { searchBrand: 'Zadig & Voltaire', searchName: 'This is Him! Vibes of Freedom', imageFile: 'Zadig & Voltaire – This is Him! Vibes of Freedom_1753553187319.webp' },
  
  // Versace (3 products)
  { searchBrand: 'Versace', searchName: 'Eros Flame', imageFile: 'Versace – Eros Flame_1753553187319.webp' },
  { searchBrand: 'Versace', searchName: 'Eros', imageFile: 'Versace - Eros_1753553187320.webp' },
  { searchBrand: 'Versace', searchName: 'Pour Femme Dylan Purple', imageFile: 'Versace – Pour Femme Dylan Purple_1753553187320.webp' },
  
  // Viktor & Rolf (1 product)
  { searchBrand: 'Viktor & Rolf', searchName: 'Spicebomb Extreme', imageFile: 'Viktor&Rolf – Spicebomb Extreme_1753553187321.webp' },
  
  // Xerjoff luxury collection (6 products)
  { searchBrand: 'Xerjoff', searchName: 'Accento', imageFile: 'Xerjoff – Accento_1753553187321.webp' },
  { searchBrand: 'Xerjoff', searchName: 'Erba Pura', imageFile: 'Xerjoff – Erba Pura_1753553187322.webp' },
  { searchBrand: 'Xerjoff', searchName: 'More Than Words', imageFile: 'Xerjoff – More Than Words_1753553187322.webp' },
  { searchBrand: 'Xerjoff', searchName: 'Naxos 1861', imageFile: 'Xerjoff – Naxos 1861_1753553187323.webp' },
  { searchBrand: 'Xerjoff', searchName: 'Opera', imageFile: 'Xerjoff – Opera_1753553187323.webp' },
  { searchBrand: 'Xerjoff', searchName: 'Oud Stars Luxor', imageFile: 'Xerjoff – Oud Stars Luxor_1753553187324.webp' }
];

async function updateBatch13Images() {
  console.log(`Starting batch 13 luxury finale for ${batch13ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch13ImageMappings) {
    let searchName = mapping.searchName;
    let searchBrand = mapping.searchBrand;
    
    // Handle special brand variations
    if (mapping.searchBrand === 'Viktor & Rolf') {
      // Try variations including Viktor&Rolf
      const brandVariations = ['Viktor & Rolf', 'Viktor&Rolf', 'Viktor Rolf'];
      let foundProduct = null;
      
      for (const brandVar of brandVariations) {
        const foundProducts = await db
          .select()
          .from(products)
          .where(
            and(
              like(products.brand, `%${brandVar}%`),
              like(products.name, `%${searchName}%`)
            )
          );
        
        if (foundProducts.length > 0) {
          foundProduct = foundProducts[0];
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
    
    // Handle Xerjoff Naxos variations
    if (mapping.searchName === 'Naxos 1861') {
      searchName = 'Naxos'; // Try without the year first
    }
    
    // Handle Xerjoff Oud Stars variations
    if (mapping.searchName === 'Oud Stars Luxor') {
      searchName = 'Luxor'; // Try just the name
    }
    
    // Regular search for other products
    const foundProducts = await db
      .select()
      .from(products)
      .where(
        and(
          like(products.brand, `%${searchBrand}%`),
          like(products.name, `%${searchName}%`)
        )
      );
    
    if (foundProducts.length >= 1) {
      const product = foundProducts[0];
      const imageUrl = `/assets/${mapping.imageFile}`;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, product.id));
      
      console.log(`✅ Updated "${product.brand} - ${product.name}" with ${mapping.imageFile}`);
      updatedCount++;
    } else {
      console.log(`❌ No match for: ${searchBrand} - ${searchName}`);
      notFoundList.push(`${searchBrand} - ${searchName}`);
      notFoundCount++;
    }
  }
  
  console.log(`\n📊 Batch 13 Results:`);
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

updateBatch13Images()
  .then(() => {
    console.log('\n🎉 Batch 13 luxury finale completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 13 update failed:', error);
    process.exit(1);
  });