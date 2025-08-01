import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 18: Complete the missing products from your full list
const batch18ImageMappings = [
  // Parfums de Marly (1 product)
  { searchBrand: 'Parfums de Marly', searchName: 'Layton', imageFile: 'Parfums de Marly – Layton_1753554601478.webp' },
  
  // Sospiro niche (1 product)
  { searchBrand: 'Sospiro', searchName: 'Erba Pura', imageFile: 'Sospiro – Erba Pura_1753554563492.webp' },
  
  // Tiziana Terenzi (1 product)
  { searchBrand: 'Tiziana Terenzi', searchName: 'Kirke', imageFile: 'Tiziana Terenzi – Kirke_1753554583293.webp' },
  
  // Tom Ford (2 products)
  { searchBrand: 'Tom Ford', searchName: 'F*cking Fabulous', imageFile: 'Tom Ford – F_cking Fabulous_1753554574949.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Lost Cherry', imageFile: 'Tom Ford – Lost Cherry_1753554632306.webp' },
  
  // YSL additional (3 products) - Updated versions
  { searchBrand: 'Yves Saint Laurent', searchName: 'La Nuit de l\'Homme', imageFile: 'Yves Saint Laurent – La Nuit de l\'Homme_1753554591160.png' },
  { searchBrand: 'Yves Saint Laurent', searchName: 'Libre', exactMatch: true, imageFile: 'Yves Saint Laurent – Libre_1753554613583.webp' },
  { searchBrand: 'Yves Saint Laurent', searchName: 'Libre Intense', imageFile: 'Yves Saint Laurent – Libre Intense_1753554617007.webp' }
];

async function updateBatch18Images() {
  console.log(`Starting batch 18 complete missing products for ${batch18ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let replacedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch18ImageMappings) {
    let foundProducts;
    
    // Handle exact match requirements
    if (mapping.exactMatch) {
      foundProducts = await db
        .select()
        .from(products)
        .where(
          and(
            like(products.brand, `%${mapping.searchBrand}%`),
            eq(products.name, mapping.searchName)
          )
        );
    } else {
      // Regular search
      foundProducts = await db
        .select()
        .from(products)
        .where(
          and(
            like(products.brand, `%${mapping.searchBrand}%`),
            like(products.name, `%${mapping.searchName}%`)
          )
        );
    }
    
    if (foundProducts && foundProducts.length >= 1) {
      const product = foundProducts[0];
      const imageUrl = `/assets/${mapping.imageFile}`;
      
      // Check if already has an image (for replacement)
      const hadImage = !!product.imageUrl;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, product.id));
      
      if (hadImage) {
        console.log(`🔄 Replaced "${product.brand} - ${product.name}" with ${mapping.imageFile}`);
        replacedCount++;
      } else {
        console.log(`✅ Added "${product.brand} - ${product.name}" with ${mapping.imageFile}`);
        updatedCount++;
      }
    } else {
      console.log(`❌ No match for: ${mapping.searchBrand} - ${mapping.searchName}`);
      notFoundList.push(`${mapping.searchBrand} - ${mapping.searchName}`);
      notFoundCount++;
    }
  }
  
  console.log(`\n📊 Batch 18 Results:`);
  console.log(`  Successfully added: ${updatedCount} products`);
  console.log(`  Successfully replaced: ${replacedCount} products`);
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
  
  // Show final remaining products without images
  const remainingProducts = await db
    .select()
    .from(products)
    .where(eq(products.imageUrl, null));
  
  console.log(`\n📋 Final remaining products without images (${remainingProducts.length}):`);
  remainingProducts.forEach(product => {
    console.log(`  - ${product.brand} - ${product.name}`);
  });
}

updateBatch18Images()
  .then(() => {
    console.log('\n🎉 Batch 18 complete missing products finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 18 update failed:', error);
    process.exit(1);
  });