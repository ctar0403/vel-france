import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Fix compromised images - products not showing pictures
const compromisedImageMappings = [
  // Kilian collection (6 products)
  { searchBrand: 'Kilian', searchName: 'Angels\' Share', imageFile: 'Kilian – Angels\' Share_1753551627385.png' },
  { searchBrand: 'Kilian', searchName: 'Bad Boys Are No Good But Good Boys Are No Fun', imageFile: 'Kilian – Bad Boys Are No Good But Good Boys Are No Fun_1753551627386.png' },
  { searchBrand: 'Kilian', searchName: 'Black Phantom', imageFile: 'Kilian – Black Phantom_1753551627387.png' },
  { searchBrand: 'Kilian', searchName: 'Good Girl Gone Bad Extreme', imageFile: 'Kilian – Good Girl Gone Bad Extreme_1753551627388.png' },
  { searchBrand: 'Kilian', searchName: 'Good Girl Gone Bad', exactMatch: true, imageFile: 'Kilian – Good Girl Gone Bad_1753551627389.png' },
  { searchBrand: 'Kilian', searchName: 'Rolling In Love', imageFile: 'Kilian – Rolling In Love_1753551627389.png' },
  { searchBrand: 'Kilian', searchName: 'Roses On Ice', imageFile: 'Kilian – Roses On Ice_1753551627390.png' },
  
  // Gucci collection (4 products)
  { searchBrand: 'Gucci', searchName: 'Bloom', exactMatch: true, imageFile: 'Gucci – Bloom_1753551333696.png' },
  { searchBrand: 'Gucci', searchName: 'Flora Gorgeous Gardenia', imageFile: 'Gucci – Flora Gorgeous Gardenia_1753551333696.png' },
  { searchBrand: 'Gucci', searchName: 'Flora Gorgeous Jasmine', imageFile: 'Gucci – Flora Gorgeous Jasmine_1753551333696.png' },
  { searchBrand: 'Gucci', searchName: 'Flora Gorgeous Orchid', imageFile: 'Gucci – Flora Gorgeous Orchid_1753551333697.png' },
  
  // Dior collection (6 products)  
  { searchBrand: 'Dior', searchName: 'J\'adore', imageFile: 'Dior – J\'adore_1753551242328.png' },
  { searchBrand: 'Dior', searchName: 'Joy Intense', imageFile: 'Dior – Joy Intense_1753551242328.png' },
  { searchBrand: 'Dior', searchName: 'Joy', exactMatch: true, imageFile: 'Dior – Joy_1753551242329.png' },
  { searchBrand: 'Dior', searchName: 'Miss Dior (EDP)', imageFile: 'Dior – Miss Dior (EDP)_1753551242329.png' },
  { searchBrand: 'Dior', searchName: 'Miss Dior Blooming Bouquet', imageFile: 'Dior – Miss Dior Blooming Bouquet_1753551242330.png' },
  
  // Other luxury brands (4 products)
  { searchBrand: 'Lancome', searchName: 'Climat', imageFile: 'Lancome – Climat_1753551627390.png' },
  { searchBrand: 'Givenchy', searchName: 'L\'Interdit Eau de Parfum Rouge', imageFile: 'Givenchy – L\'Interdit Eau de Parfum Rouge_1753551333695.png' },
  { searchBrand: 'Hermes', searchName: 'Merveilles', imageFile: 'Hermes – Merveilles_1753551333697.png' },
  { searchBrand: 'Paco Rabanne', searchName: 'Pure XS', imageFile: 'Paco Rabanne – Pure XS For Her_1753552335217.png' },
  { searchBrand: 'Givenchy', searchName: 'Society', imageFile: 'Givenchy – Society_1753551333695.png' }
];

async function fixCompromisedImages() {
  console.log(`Fixing compromised images for ${compromisedImageMappings.length} products...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of compromisedImageMappings) {
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
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, product.id));
      
      console.log(`✅ Fixed "${product.brand} - ${product.name}" with ${mapping.imageFile}`);
      updatedCount++;
    } else {
      console.log(`❌ No match for: ${mapping.searchBrand} - ${mapping.searchName}`);
      notFoundList.push(`${mapping.searchBrand} - ${mapping.searchName}`);
      notFoundCount++;
    }
  }
  
  console.log(`\n📊 Compromised Image Fix Results:`);
  console.log(`  Successfully fixed: ${updatedCount} products`);
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

fixCompromisedImages()
  .then(() => {
    console.log('\n🎉 Compromised images fixed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix compromised images failed:', error);
    process.exit(1);
  });