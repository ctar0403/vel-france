import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// The final 8 missing images
const finalImageMappings = [
  // Givenchy products (2 products)
  { searchBrand: 'Givenchy', searchName: "L'Interdit Eau de Parfum Rouge", imageFile: "Givenchy – L'Interdit Eau de Parfum Rouge_1753551333695.png" },
  { searchBrand: 'Givenchy', searchName: 'Society', imageFile: 'Givenchy – Society_1753551333695.png' },
  
  // Gucci products (4 products)
  { searchBrand: 'Gucci', searchName: 'Bloom', imageFile: 'Gucci – Bloom_1753551333696.png' },
  { searchBrand: 'Gucci', searchName: 'Flora Gorgeous Gardenia', imageFile: 'Gucci – Flora Gorgeous Gardenia_1753551333696.png' },
  { searchBrand: 'Gucci', searchName: 'Flora Gorgeous Jasmine', imageFile: 'Gucci – Flora Gorgeous Jasmine_1753551333696.png' },
  { searchBrand: 'Gucci', searchName: 'Flora Gorgeous Orchid', imageFile: 'Gucci – Flora Gorgeous Orchid_1753551333697.png' },
  
  // Hermes products (1 product)
  { searchBrand: 'Hermes', searchName: 'Merveilles', imageFile: 'Hermes – Merveilles_1753551333697.png' }
];

async function updateFinal8Images() {
  console.log(`Starting final batch image update for ${finalImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of finalImageMappings) {
    // Find products that match the brand and name
    const foundProducts = await db
      .select()
      .from(products)
      .where(
        and(
          like(products.brand, `%${mapping.searchBrand}%`),
          like(products.name, `%${mapping.searchName}%`)
        )
      );
    
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
  
  // Now check for Initio Musk Therapy image
  console.log('\nLooking for Initio Musk Therapy image...');
  const initioMuskProducts = await db
    .select()
    .from(products)
    .where(
      and(
        like(products.brand, '%Initio%'),
        like(products.name, '%Musk Therapy%')
      )
    );
  
  if (initioMuskProducts.length > 0) {
    const initioProduct = initioMuskProducts[0];
    // Check if we have this image file
    const initioImageFile = 'Initio – Musk Therapy_1753551333697.png';
    
    if (!initioProduct.imageUrl) {
      await db
        .update(products)
        .set({ imageUrl: `/assets/${initioImageFile}` })
        .where(eq(products.id, initioProduct.id));
      
      console.log(`✅ Updated "${initioProduct.brand} - ${initioProduct.name}" with ${initioImageFile}`);
      updatedCount++;
    } else {
      console.log(`⚠️  "${initioProduct.brand} - ${initioProduct.name}" already has image`);
    }
  }
  
  console.log(`\n📊 Final Results:`);
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
  
  console.log(`\n🎯 Final total: ${finalCount.length} products with images`);
}

// Run the final batch update
updateFinal8Images()
  .then(() => {
    console.log('\n🎉 Final batch image update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Final batch update failed:', error);
    process.exit(1);
  });