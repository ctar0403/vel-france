import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Batch 12: Luxury collection - Tom Ford, Versace, Trussardi
const batch12ImageMappings = [
  // Versace (1 product)
  { searchBrand: 'Versace', searchName: 'Dylan Blue Femme', imageFile: 'Versace – Dylan Blue Femme_1753552822884.webp' },
  
  // Tom Ford collection (8 products)
  { searchBrand: 'Tom Ford', searchName: 'Oud Wood', imageFile: 'Tom Ford – Oud Wood_1753552822887.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Rose Prick', imageFile: 'Tom Ford – Rose Prick_1753552822888.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Santal Blush', imageFile: 'Tom Ford - Santal Blush_1753552822888.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Soleil Brulant', imageFile: 'Tom Ford – Soleil Brulant_1753552822888.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Tobacco Vanille', imageFile: 'Tom Ford – Tobacco Vanille_1753552822889.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Vanilla Sex', imageFile: 'Tom Ford – Vanilla S_x_1753552822889.webp' },
  { searchBrand: 'Tom Ford', searchName: 'Vanille Fatale', imageFile: 'Tom Ford – Vanille Fatale_1753552822889.webp' },
  
  // Trussardi collection (4 products)
  { searchBrand: 'Trussardi', searchName: 'Behind The Curtain', imageFile: 'Trussardi – Behind The Curtain_1753552822890.webp' },
  { searchBrand: 'Trussardi', searchName: 'Donna', imageFile: 'Trussardi – Donna_1753552822890.webp' },
  { searchBrand: 'Trussardi', searchName: 'Limitless Shopping', imageFile: 'Trussardi – Limitless Shopping_1753552822891.webp' },
  { searchBrand: 'Trussardi', searchName: 'Musc Noir', imageFile: 'Trussardi – Musc Noir_1753552822891.webp' }
];

async function updateBatch12Images() {
  console.log(`Starting batch 12 luxury collection update for ${batch12ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch12ImageMappings) {
    // Special handling for Tom Ford Vanilla Sex (might be stored differently)
    let searchName = mapping.searchName;
    if (mapping.searchName === 'Vanilla Sex') {
      // Try multiple variations
      const variations = ['Vanilla Sex', 'Vanilla S*x', 'Vanilla'];
      let foundProduct = null;
      
      for (const variation of variations) {
        const products = await db
          .select()
          .from(products)
          .where(
            and(
              like(products.brand, `%${mapping.searchBrand}%`),
              like(products.name, `%${variation}%`)
            )
          );
        
        if (products.length > 0) {
          foundProduct = products[0];
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
          like(products.name, `%${searchName}%`)
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
      console.log(`❌ No match for: ${mapping.searchBrand} - ${searchName}`);
      notFoundList.push(`${mapping.searchBrand} - ${searchName}`);
      notFoundCount++;
    }
  }
  
  console.log(`\n📊 Batch 12 Results:`);
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

// Run batch 12 update
updateBatch12Images()
  .then(() => {
    console.log('\n🎉 Batch 12 luxury collection update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 12 update failed:', error);
    process.exit(1);
  });