import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 9: Additional luxury brands - Narciso Rodriguez, Marc Antoine Barrois, Marc Jacobs, Memo, Molecule
const batch9ImageMappings = [
  // Narciso Rodriguez (1 product) - try different variations
  { searchBrand: 'Narciso Rodriguez', searchName: 'For Her Black', imageFile: 'Narciso Rodriguez – For Her (Black)_1753552083120.png' },
  
  // Marc Antoine Barrois (3 products)
  { searchBrand: 'Marc Antoine Barrois', searchName: 'Encelade', imageFile: 'Marc Antoine Barrois – Encelade_1753552083120.png' },
  { searchBrand: 'Marc Antoine Barrois', searchName: 'Ganymede', imageFile: 'Marc Antoine Barrois – Ganymede_1753552083121.png' },
  { searchBrand: 'Marc Antoine Barrois', searchName: 'Tilia', imageFile: 'Marc Antoine Barrois – Tilia_1753552083121.png' },
  
  // Marc Jacobs (3 products)
  { searchBrand: 'Marc Jacobs', searchName: 'Daisy', imageFile: 'Marc Jacobs – Daisy_1753552083122.png' },
  { searchBrand: 'Marc Jacobs', searchName: 'Decadence Rouge Noir Edition', imageFile: 'Marc Jacobs – Decadence Rouge Noir Edition_1753552083122.png' },
  { searchBrand: 'Marc Jacobs', searchName: 'Decadence', imageFile: 'Marc Jacobs – Decadence_1753552083122.png' },
  
  // Memo (2 products)
  { searchBrand: 'Memo', searchName: 'Italian Leather', imageFile: 'Memo – Italian Leather_1753552083123.png' },
  { searchBrand: 'Memo', searchName: 'Russian Leather', imageFile: 'Memo – Russian Leather_1753552083123.png' },
  
  // Molecule (3 products)
  { searchBrand: 'Molecule', searchName: '02', imageFile: 'Molecule – 02_1753552083123.png' },
  { searchBrand: 'Molecule', searchName: '04', imageFile: 'Molecule – 04_1753552083124.png' },
  { searchBrand: 'Molecule', searchName: '05', imageFile: 'Molecule – 05_1753552083124.png' }
];

async function updateBatch9Images() {
  console.log(`Starting batch 9 additional brands image update for ${batch9ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch9ImageMappings) {
    // Handle special case for Decadence vs Decadence Rouge Noir Edition
    let searchCondition;
    if (mapping.searchName === 'Decadence Rouge Noir Edition') {
      searchCondition = and(
        like(products.brand, `%${mapping.searchBrand}%`),
        like(products.name, '%Rouge Noir%')
      );
    } else if (mapping.searchName === 'Decadence') {
      // Find regular Decadence (not Rouge Noir Edition)
      const allDecadence = await db
        .select()
        .from(products)
        .where(
          and(
            like(products.brand, `%${mapping.searchBrand}%`),
            like(products.name, '%Decadence%')
          )
        );
      const regularDecadence = allDecadence.filter(p => !p.name.includes('Rouge Noir'));
      foundProducts = regularDecadence;
      
      if (foundProducts.length === 1) {
        const product = foundProducts[0];
        const imageUrl = `/assets/${mapping.imageFile}`;
        
        await db
          .update(products)
          .set({ imageUrl: imageUrl })
          .where(eq(products.id, product.id));
        
        console.log(`✅ Updated "${product.brand} - ${product.name}" with ${mapping.imageFile}`);
        updatedCount++;
        continue;
      }
    } else {
      searchCondition = and(
        like(products.brand, `%${mapping.searchBrand}%`),
        like(products.name, `%${mapping.searchName}%`)
      );
    }
    
    const foundProducts = await db
      .select()
      .from(products)
      .where(searchCondition);
    
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
  
  console.log(`\n📊 Batch 9 Results:`);
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

// Run batch 9 update
updateBatch9Images()
  .then(() => {
    console.log('\n🎉 Batch 9 additional brands image update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 9 update failed:', error);
    process.exit(1);
  });