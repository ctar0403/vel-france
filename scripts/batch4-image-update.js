import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// All 20 image mappings from batch 4
const batch4ImageMappings = [
  // Initio products (2 products)
  { searchBrand: 'Initio', searchName: 'Oud For Happiness', imageFile: 'Initio – Oud For Happiness_1753551333688.png' },
  { searchBrand: 'Initio', searchName: 'Side Effect', imageFile: 'Initio – Side Effect_1753551333689.png' },
  
  // Jean Paul Gaultier products (1 product)
  { searchBrand: 'Jean Paul Gaultier', searchName: 'Divine', imageFile: 'Jean Paul Gaultier – Divine_1753551333689.png' },
  
  // More Dior products (2 products)
  { searchBrand: 'Dior', searchName: 'Sauvage Elixir', imageFile: 'Dior – Sauvage Elixir_1753551333690.png' },
  { searchBrand: 'Dior', searchName: 'Sauvage', imageFile: 'Dior - Sauvage_1753551333690.png' },
  
  // Dolce & Gabbana products (8 products)
  { searchBrand: 'Dolce & Gabbana', searchName: 'K', imageFile: 'Dolce & Gabbana – K_1753551333691.png' },
  { searchBrand: 'Dolce & Gabbana', searchName: 'Q', imageFile: 'Dolce & Gabbana – Q_1753551333691.png' },
  { searchBrand: 'Dolce & Gabbana', searchName: 'Light Blue', imageFile: 'Dolce&Gabbana – Light Blue_1753551333692.png' },
  { searchBrand: 'Dolce & Gabbana', searchName: 'The One', imageFile: 'Dolce&Gabbana – The One_1753551333693.png' },
  { searchBrand: 'Dolce & Gabbana', searchName: 'The Only One 2', imageFile: 'Dolce&Gabbana – The Only One 2_1753551333693.png' },
  { searchBrand: 'Dolce & Gabbana', searchName: 'The Only One', imageFile: 'Dolce&Gabbana – The Only One_1753551333694.png' },
  
  // Givenchy products (1 product)
  { searchBrand: 'Givenchy', searchName: 'Gentleman', imageFile: 'Givenchy – Gentleman_1753551333694.png' }
];

async function updateBatch4Images() {
  console.log(`Starting batch 4 image update for ${batch4ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch4ImageMappings) {
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
      
      // For multiple matches, try to find the best match
      let productToUpdate = foundProducts[0];
      
      // Special handling for "The Only One" vs "The Only One 2"
      if (mapping.searchName === 'The Only One 2') {
        productToUpdate = foundProducts.find(p => 
          p.name.toLowerCase().includes('2') || p.name.toLowerCase().includes('two')
        ) || foundProducts[0];
      } else if (mapping.searchName === 'The Only One') {
        productToUpdate = foundProducts.find(p => 
          !p.name.toLowerCase().includes('2') && !p.name.toLowerCase().includes('two')
        ) || foundProducts[0];
      } else {
        // Try exact match first
        const exactMatch = foundProducts.find(p => 
          p.name.toLowerCase().trim() === mapping.searchName.toLowerCase().trim()
        );
        productToUpdate = exactMatch || foundProducts[0];
      }
      
      const imageUrl = `/assets/${mapping.imageFile}`;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, productToUpdate.id));
      
      console.log(`✅ Updated "${productToUpdate.brand} - ${productToUpdate.name}" with ${mapping.imageFile}`);
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Batch 4 Results:`);
  console.log(`  Successfully updated: ${updatedCount}/${batch4ImageMappings.length} products`);
  console.log(`  Not found: ${notFoundCount}/${batch4ImageMappings.length} products`);
  
  if (notFoundList.length > 0) {
    console.log(`\n❌ Products not found in database:`);
    notFoundList.forEach(item => console.log(`  - ${item}`));
    
    console.log(`\n💡 Searching for similar products...`);
    for (const notFound of notFoundList) {
      const [brand, ...nameParts] = notFound.split(' - ');
      const name = nameParts.join(' - ');
      
      const similarProducts = await db
        .select()
        .from(products)
        .where(like(products.brand, `%${brand}%`))
        .limit(3);
      
      if (similarProducts.length > 0) {
        console.log(`  Similar to "${notFound}":`);
        similarProducts.forEach(p => console.log(`    → ${p.brand} - ${p.name}`));
      }
    }
  }
}

// Run the batch 4 update
updateBatch4Images()
  .then(() => {
    console.log('\n🎉 Batch 4 image update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 4 image update failed:', error);
    process.exit(1);
  });