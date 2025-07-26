import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 12 Fix: The remaining images that weren't processed due to script error
const remainingImageMappings = [
  // Tom Ford remaining (2 products)
  { searchBrand: 'Tom Ford', searchName: 'Vanilla Sex', imageFile: 'Tom Ford – Vanilla S_x_1753552822889.png' },
  { searchBrand: 'Tom Ford', searchName: 'Vanille Fatale', imageFile: 'Tom Ford – Vanille Fatale_1753552822889.png' },
  
  // Trussardi collection (4 products)
  { searchBrand: 'Trussardi', searchName: 'Behind The Curtain', imageFile: 'Trussardi – Behind The Curtain_1753552822890.png' },
  { searchBrand: 'Trussardi', searchName: 'Donna', imageFile: 'Trussardi – Donna_1753552822890.png' },
  { searchBrand: 'Trussardi', searchName: 'Limitless Shopping', imageFile: 'Trussardi – Limitless Shopping_1753552822891.png' },
  { searchBrand: 'Trussardi', searchName: 'Musc Noir', imageFile: 'Trussardi – Musc Noir_1753552822891.png' }
];

async function updateRemainingBatch12Images() {
  console.log(`Processing the remaining ${remainingImageMappings.length} images from batch 12...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of remainingImageMappings) {
    // Special handling for Tom Ford Vanilla Sex
    if (mapping.searchName === 'Vanilla Sex') {
      // Try multiple variations including partial matches
      const variations = ['Vanilla Sex', 'Vanilla S*x', 'Vanilla', 'Sex'];
      let foundProduct = null;
      
      for (const variation of variations) {
        const foundProducts = await db
          .select()
          .from(products)
          .where(
            and(
              like(products.brand, `%${mapping.searchBrand}%`),
              like(products.name, `%${variation}%`)
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
      } else {
        console.log(`❌ No match for Tom Ford Vanilla Sex variants`);
        notFoundList.push(`${mapping.searchBrand} - ${mapping.searchName}`);
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
      const product = foundProducts[0];
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
  
  console.log(`\n📊 Remaining batch 12 results:`);
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

// Run the remaining batch 12 update
updateRemainingBatch12Images()
  .then(() => {
    console.log('\n🎉 Remaining batch 12 images completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Remaining batch 12 update failed:', error);
    process.exit(1);
  });