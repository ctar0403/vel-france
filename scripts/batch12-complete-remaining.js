import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Complete remaining images from the current batch
const completeRemainingMappings = [
  // Marc Antoine Barrois (3 products)
  { searchBrand: 'Marc Antoine Barrois', searchName: 'Encelade', imageFile: 'Marc Antoine Barrois – Encelade_1753552083120.webp' },
  { searchBrand: 'Marc Antoine Barrois', searchName: 'Ganymede', imageFile: 'Marc Antoine Barrois – Ganymede_1753552083121.webp' },
  { searchBrand: 'Marc Antoine Barrois', searchName: 'Tilia', imageFile: 'Marc Antoine Barrois – Tilia_1753552083121.webp' },
  
  // Marc Jacobs (3 products)
  { searchBrand: 'Marc Jacobs', searchName: 'Daisy', imageFile: 'Marc Jacobs – Daisy_1753552083122.webp' },
  { searchBrand: 'Marc Jacobs', searchName: 'Decadence', imageFile: 'Marc Jacobs – Decadence_1753552083122.webp' },
  { searchBrand: 'Marc Jacobs', searchName: 'Decadence Rouge Noir', imageFile: 'Marc Jacobs – Decadence Rouge Noir Edition_1753552083122.webp' },
  
  // Memo (2 products)
  { searchBrand: 'Memo', searchName: 'Italian Leather', imageFile: 'Memo – Italian Leather_1753552083123.webp' },
  { searchBrand: 'Memo', searchName: 'Russian Leather', imageFile: 'Memo – Russian Leather_1753552083123.webp' },
  
  // Molecule (3 products)
  { searchBrand: 'Molecule', searchName: '02', imageFile: 'Molecule – 02_1753552083123.webp' },
  { searchBrand: 'Molecule', searchName: '04', imageFile: 'Molecule – 04_1753552083124.webp' },
  { searchBrand: 'Molecule', searchName: '05', imageFile: 'Molecule – 05_1753552083124.webp' },
  
  // Montblanc (2 products)
  { searchBrand: 'Montblanc', searchName: 'Legend', imageFile: 'Montblanc – Legend_1753552083125.webp' },
  { searchBrand: 'Montblanc', searchName: 'Legend Red', imageFile: 'Montblanc – Legend Red_1753552083125.webp' },
  
  // Moschino (3 products)
  { searchBrand: 'Moschino', searchName: 'Toy 2 Bubble Gum', imageFile: 'Moschino - Bubblegum_1753552083125.webp' },
  { searchBrand: 'Moschino', searchName: 'Toy 2', imageFile: 'Moschino - Toy 2_1753552083126.webp' },
  { searchBrand: 'Moschino', searchName: 'Toy Boy', imageFile: 'Moschino - Toy Boy_1753552083126.webp' },
  
  // Mugler (3 products)
  { searchBrand: 'Mugler', searchName: 'Angel', imageFile: 'Mugler - Angel_1753552083126.webp' },
  { searchBrand: 'Mugler', searchName: 'Aura', imageFile: 'Mugler – Aura_1753552083127.webp' },
  { searchBrand: 'Mugler', searchName: 'Nova', imageFile: 'Mugler - Nova_1753552083127.webp' },
  
  // Narciso Rodriguez (1 product)
  { searchBrand: 'Narciso Rodriguez', searchName: 'For Her', imageFile: 'Narciso Rodriguez – For Her_1753552335218.webp' }
];

async function updateCompleteRemainingImages() {
  console.log(`Processing ${completeRemainingMappings.length} complete remaining images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of completeRemainingMappings) {
    let searchName = mapping.searchName;
    
    // Handle special cases for better matching
    if (mapping.searchName === 'Toy 2 Bubble Gum') {
      searchName = 'Bubble Gum';
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
  
  console.log(`\n📊 Complete remaining results:`);
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

updateCompleteRemainingImages()
  .then(() => {
    console.log('\n🎉 Complete remaining images processing finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Complete remaining images update failed:', error);
    process.exit(1);
  });