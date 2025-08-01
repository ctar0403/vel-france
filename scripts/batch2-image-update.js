import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// All 20 image mappings from batch 2
const batch2ImageMappings = [
  { searchBrand: 'Calvin Klein', searchName: 'Euphoria', imageFile: 'Calvin Klein – Euphoria_1753550361311.webp' },
  { searchBrand: 'Carolina Herrera', searchName: '212 VIP Black', imageFile: 'Carolina Herrera – 212 VIP Black_1753550361312.webp' },
  { searchBrand: 'Carolina Herrera', searchName: 'Good Girl', imageFile: 'Carolina Herrera – Good Girl_1753550361313.webp' },
  { searchBrand: 'Carolina Herrera', searchName: 'Very Good Girl', imageFile: 'Carolina Herrera – Very Good Girl_1753550361313.webp' },
  { searchBrand: 'Chanel', searchName: 'Allure Homme Sport', imageFile: 'Chanel – Allure Homme Sport_1753550361313.webp' },
  { searchBrand: 'Chanel', searchName: 'Allure Homme', imageFile: 'Chanel – Allure Homme_1753550361314.webp' },
  { searchBrand: 'Chanel', searchName: 'Allure Sensuelle', imageFile: 'Chanel – Allure Sensuelle_1753550361314.webp' },
  { searchBrand: 'Chanel', searchName: 'Bleu de Chanel', imageFile: 'Chanel – Bleu de Chanel_1753550361314.webp' },
  { searchBrand: 'Burberry', searchName: 'Hero', imageFile: 'Burberry – Hero_1753550361314.webp' },
  { searchBrand: 'Burberry', searchName: 'My Burberry', imageFile: 'Burberry – My Burberry_1753550361315.webp' },
  { searchBrand: 'Burberry', searchName: 'Weekend', imageFile: 'Burberry – Weekend_1753550361315.webp' },
  { searchBrand: 'Bvlgari', searchName: 'BLV Pour Homme', imageFile: 'Bvlgari – BLV Pour Homme_1753550361315.webp' },
  { searchBrand: 'Bvlgari', searchName: 'Man In Black', imageFile: 'Bvlgari – Man In Black_1753550361316.webp' },
  { searchBrand: 'Bvlgari', searchName: 'Omnia Crystalline', imageFile: 'Bvlgari – Omnia Crystalline_1753550361316.webp' },
  { searchBrand: 'Bvlgari', searchName: 'Wood Essence', imageFile: 'Bvlgari – Wood Essence_1753550361316.webp' },
  { searchBrand: 'Byredo', searchName: 'Black Saffron', imageFile: 'Byredo – Black Saffron_1753550361317.webp' },
  { searchBrand: 'Byredo', searchName: 'Blanche', imageFile: 'Byredo – Blanche_1753550361317.webp' },
  { searchBrand: 'Byredo', searchName: 'Marijuana', imageFile: 'Byredo – Marijuana_1753550361317.webp' },
  { searchBrand: 'Byredo', searchName: 'Super Cedar', imageFile: 'Byredo - Super Cedar_1753550361317.webp' },
  { searchBrand: 'Byredo', searchName: 'Vanille Antique', imageFile: 'Byredo – Vanille Antique_1753550361318.webp' }
];

async function updateBatch2Images() {
  console.log(`Starting batch 2 image update for ${batch2ImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of batch2ImageMappings) {
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
      // Use the first match for now
      const product = foundProducts[0];
      const imageUrl = `/assets/${mapping.imageFile}`;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, product.id));
      
      console.log(`✅ Updated "${product.brand} - ${product.name}" (first match) with ${mapping.imageFile}`);
      updatedCount++;
    }
  }
  
  console.log(`\n📊 Batch 2 Results:`);
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

// Run the batch 2 update
updateBatch2Images()
  .then(() => {
    console.log('\n🎉 Batch 2 image update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Batch 2 image update failed:', error);
    process.exit(1);
  });