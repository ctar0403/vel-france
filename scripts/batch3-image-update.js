import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// All 20 image mappings from batch 3
const batch3ImageMappings = [
  // Chanel products (7 products)
  { searchBrand: 'Chanel', searchName: 'Chance Eau Tendre', imageFile: 'Chanel – Chance Eau Tendre_1753551242321.png' },
  { searchBrand: 'Chanel', searchName: 'Coco Eau de Parfum', imageFile: 'Chanel – Coco Eau de Parfum_1753551242322.png' },
  { searchBrand: 'Chanel', searchName: 'Cristalle', imageFile: 'Chanel – Cristalle_1753551242323.png' },
  { searchBrand: 'Chanel', searchName: 'Gabrielle', imageFile: 'Chanel – Gabrielle_1753551242323.png' },
  { searchBrand: 'Chanel', searchName: 'N5', imageFile: 'Chanel – N5_1753551242324.png' },
  { searchBrand: 'Chanel', searchName: 'Chance Eau de Parfum', imageFile: 'Chanel – Chance Eau de Parfum_1753551242330.png' },
  { searchBrand: 'Chanel', searchName: 'Chance Eau Fraiche', imageFile: 'Chanel – Chance Eau Fraiche_1753551242331.png' },
  
  // Creed products (4 products)
  { searchBrand: 'Creed', searchName: 'Aventus', imageFile: 'Creed – Aventus_1753551242324.png' },
  { searchBrand: 'Creed', searchName: 'Queen Of Silk', imageFile: 'Creed – Queen Of Silk_1753551242324.png' },
  { searchBrand: 'Creed', searchName: 'Viking', imageFile: 'Creed - Viking_1753551242325.png' },
  { searchBrand: 'Creed', searchName: 'Wind Flowers', imageFile: 'Creed – Wind Flowers_1753551242325.png' },
  
  // Dior products (9 products)  
  { searchBrand: 'Dior', searchName: 'Addict Eau De Parfum', imageFile: 'Dior – Addict Eau De Parfum_1753551242326.png' },
  { searchBrand: 'Dior', searchName: 'Addict Eau Fraiche', imageFile: 'Dior – Addict Eau Fraiche_1753551242326.png' },
  { searchBrand: 'Dior', searchName: 'Fahrenheit', imageFile: 'Dior – Fahrenheit_1753551242327.png' },
  { searchBrand: 'Dior', searchName: 'Homme Intense', imageFile: 'Dior – Homme Intense_1753551242327.png' },
  { searchBrand: 'Dior', searchName: "J'adore", imageFile: "Dior – J'adore_1753551242328.png" },
  { searchBrand: 'Dior', searchName: 'Joy', imageFile: 'Dior – Joy_1753551242329.png' },
  { searchBrand: 'Dior', searchName: 'Joy Intense', imageFile: 'Dior – Joy Intense_1753551242328.png' },
  { searchBrand: 'Dior', searchName: 'Miss Dior Blooming Bouquet', imageFile: 'Dior – Miss Dior Blooming Bouquet_1753551242330.png' },
  { searchBrand: 'Dior', searchName: 'Miss Dior', imageFile: 'Dior – Miss Dior (EDP)_1753551242329.png' }
];

async function updateBatch3Images() {
  console.log(`Starting batch 3 image update for ${batch3ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch3ImageMappings) {
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
      
      // For multiple matches, try to find the exact match first
      const exactMatch = foundProducts.find(p => 
        p.name.toLowerCase().includes(mapping.searchName.toLowerCase()) &&
        p.name.toLowerCase().trim() === mapping.searchName.toLowerCase().trim()
      );
      
      const productToUpdate = exactMatch || foundProducts[0];
      const imageUrl = `/assets/${mapping.imageFile}`;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, productToUpdate.id));
      
      console.log(`✅ Updated "${productToUpdate.brand} - ${productToUpdate.name}" with ${mapping.imageFile}`);
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Batch 3 Results:`);
  console.log(`  Successfully updated: ${updatedCount}/20 products`);
  console.log(`  Not found: ${notFoundCount}/20 products`);
  
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

// Run the batch 3 update
updateBatch3Images()
  .then(() => {
    console.log('\n🎉 Batch 3 image update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 3 image update failed:', error);
    process.exit(1);
  });