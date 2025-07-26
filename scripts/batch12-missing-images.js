import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// The remaining images from the attached assets that were missed
const missingImageMappings = [
  // Trussardi remaining (2 products)
  { searchBrand: 'Trussardi', searchName: 'Passeggiata In Galleria', imageFile: 'Trussardi – Passeggiata In Galleria_1753552822891.png' },
  { searchBrand: 'Trussardi', searchName: 'Via Fiori Chiari', imageFile: 'Trussardi – Via Fiari Chiori_1753552822892.png' },
  
  // Valentino (3 products)
  { searchBrand: 'Valentino', searchName: 'Uomo Born In Roma Yellow Dream', imageFile: 'Valentino - Uomo Born In Roma Yellow Dream_1753552822893.png' },
  { searchBrand: 'Valentino', searchName: 'Donna Coral Fantasy', imageFile: 'Valentino – Donna Coral Fantasy_1753552822892.png' },
  { searchBrand: 'Valentino', searchName: 'Pink PP', imageFile: 'Valentino – Pink PP_1753552822893.png' },
  
  // Versace remaining (3 products)
  { searchBrand: 'Versace', searchName: 'Bright Crystal Absolu', imageFile: 'Versace – Bright Crystal Absolu_1753552822893.png' },
  { searchBrand: 'Versace', searchName: 'Bright Crystal', imageFile: 'Versace – Bright Crystal_1753552822894.png' },
  { searchBrand: 'Versace', searchName: 'Crystal Noir', imageFile: 'Versace – Crystal Noir_1753552822894.png' }
];

async function updateMissingImages() {
  console.log(`Processing the ${missingImageMappings.length} missing images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of missingImageMappings) {
    // Handle special name variations
    let searchName = mapping.searchName;
    if (mapping.searchName === 'Via Fiori Chiari') {
      // The file name has "Fiari" but product might be "Fiori"
      searchName = 'Via Fiori';
    }
    
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
  
  console.log(`\n📊 Missing images results:`);
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

updateMissingImages()
  .then(() => {
    console.log('\n🎉 Missing images processing completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Missing images update failed:', error);
    process.exit(1);
  });