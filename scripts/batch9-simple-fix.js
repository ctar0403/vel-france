import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 9: Remaining images to process
const remainingMappings = [
  // Narciso Rodriguez - match "For Her" instead of "For Her Black"
  { searchBrand: 'Narciso Rodriguez', searchName: 'For Her', imageFile: 'Narciso Rodriguez – For Her (Black)_1753552083120.png' },
  
  // Marc Jacobs regular Decadence (not Rouge Noir)
  { searchBrand: 'Marc Jacobs', searchName: 'Decadence', imageFile: 'Marc Jacobs – Decadence_1753552083122.png' },
  
  // Memo products
  { searchBrand: 'Memo', searchName: 'Italian Leather', imageFile: 'Memo – Italian Leather_1753552083123.png' },
  { searchBrand: 'Memo', searchName: 'Russian Leather', imageFile: 'Memo – Russian Leather_1753552083123.png' },
  
  // Molecule products
  { searchBrand: 'Molecule', searchName: '02', imageFile: 'Molecule – 02_1753552083123.png' },
  { searchBrand: 'Molecule', searchName: '04', imageFile: 'Molecule – 04_1753552083124.png' },
  { searchBrand: 'Molecule', searchName: '05', imageFile: 'Molecule – 05_1753552083124.png' }
];

async function updateRemainingImages() {
  console.log(`Processing ${remainingMappings.length} remaining images...`);
  
  let updatedCount = 0;
  
  for (const mapping of remainingMappings) {
    // Special handling for Marc Jacobs Decadence (regular, not Rouge Noir)
    if (mapping.searchBrand === 'Marc Jacobs' && mapping.searchName === 'Decadence') {
      const allDecadence = await db
        .select()
        .from(products)
        .where(
          and(
            like(products.brand, '%Marc Jacobs%'),
            like(products.name, '%Decadence%')
          )
        );
      
      // Find the one without "Rouge Noir"
      const regularDecadence = allDecadence.find(p => !p.name.includes('Rouge Noir'));
      
      if (regularDecadence) {
        const imageUrl = `/assets/${mapping.imageFile}`;
        await db
          .update(products)
          .set({ imageUrl: imageUrl })
          .where(eq(products.id, regularDecadence.id));
        
        console.log(`✅ Updated "${regularDecadence.brand} - ${regularDecadence.name}" with ${mapping.imageFile}`);
        updatedCount++;
      } else {
        console.log(`❌ No regular Decadence found for Marc Jacobs`);
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
    }
  }
  
  // Check final total
  const finalCount = await db
    .select()
    .from(products)
    .where(products.imageUrl !== null);
  
  console.log(`\n📊 Results: ${updatedCount} products updated`);
  console.log(`🎯 Current total: ${finalCount.length} products with images`);
}

// Run the update
updateRemainingImages()
  .then(() => {
    console.log('\n🎉 Remaining images processed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Update failed:', error);
    process.exit(1);
  });