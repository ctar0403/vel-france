import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Fix compromised images - products that should have images but are showing as missing
const compromisedImageMappings = [
  // Kilian luxury niche collection (6 products)
  { brand: 'Kilian', name: 'Angels\' Share', imageFile: 'Kilian – Angels\' Share_1753551627385.png' },
  { brand: 'Kilian', name: 'Bad Boys Are No Good But Good Boys Are No Fun', imageFile: 'Kilian – Bad Boys Are No Good But Good Boys Are No Fun_1753551627386.webp' },
  { brand: 'Kilian', name: 'Black Phantom', imageFile: 'Kilian – Black Phantom_1753551627387.webp' },
  { brand: 'Kilian', name: 'Good Girl Gone Bad', imageFile: 'Kilian – Good Girl Gone Bad_1753551627388.png' },
  { brand: 'Kilian', name: 'Good Girl Gone Bad Extreme', imageFile: 'Kilian – Good Girl Gone Bad Extreme_1753551627388.webp' },
  { brand: 'Kilian', name: 'Rolling In Love', imageFile: 'Kilian – Rolling In Love_1753551627389.webp' },
  { brand: 'Kilian', name: 'Roses On Ice', imageFile: 'Kilian – Roses On Ice_1753551627390.webp' },
  
  // Gucci luxury collection (4 products)
  { brand: 'Gucci', name: 'Bloom', imageFile: 'Gucci – Bloom_1753551333696.webp' },
  { brand: 'Gucci', name: 'Flora Gorgeous Gardenia', imageFile: 'Gucci – Flora Gorgeous Gardenia_1753551333696.webp' },
  { brand: 'Gucci', name: 'Flora Gorgeous Jasmine', imageFile: 'Gucci – Flora Gorgeous Jasmine_1753551333696.webp' },
  { brand: 'Gucci', name: 'Flora Gorgeous Orchid', imageFile: 'Gucci – Flora Gorgeous Orchid_1753551333697.webp' },
  
  // Dior luxury collection (5 products)
  { brand: 'Dior', name: 'J\'adore', imageFile: 'Dior – J\'adore_1753551242328.png' },
  { brand: 'Dior', name: 'Joy', imageFile: 'Dior – Joy_1753551242329.webp' },
  { brand: 'Dior', name: 'Joy Intense', imageFile: 'Dior – Joy Intense_1753551242328.webp' },
  { brand: 'Dior', name: 'Miss Dior (EDP)', imageFile: 'Dior – Miss Dior (EDP)_1753551242329.webp' },
  { brand: 'Dior', name: 'Miss Dior Blooming Bouquet', imageFile: 'Dior – Miss Dior Blooming Bouquet_1753551242330.webp' },
  
  // Givenchy luxury collection (2 products)
  { brand: 'Givenchy', name: 'L\'Interdit Eau de Parfum Rouge', imageFile: 'Givenchy – L\'Interdit Eau de Parfum Rouge_1753551333695.png' },
  { brand: 'Givenchy', name: 'Society', imageFile: 'Givenchy – Society_1753551333695.webp' },
  
  // Hermes luxury (1 product)
  { brand: 'Hermes', name: 'Merveilles', imageFile: 'Hermes – Merveilles_1753551333697.webp' },
  
  // Lancome luxury (1 product)
  { brand: 'Lancome', name: 'Climat', imageFile: 'Lancome – Climat_1753551627390.webp' },
  
  // Paco Rabanne (1 product)
  { brand: 'Paco Rabanne', name: 'Pure XS For Her', imageFile: 'Paco Rabanne – Pure XS For Her_1753552335217.webp' }
];

async function fixCompromisedImages() {
  console.log(`Starting to fix ${compromisedImageMappings.length} compromised product images...`);
  
  // First, copy all the image files to assets directory
  console.log('Copying image files to assets directory...');
  
  let fixedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of compromisedImageMappings) {
    // Search for the product in database
    const foundProducts = await db
      .select()
      .from(products)
      .where(
        and(
          like(products.brand, `%${mapping.brand}%`),
          like(products.name, `%${mapping.name}%`)
        )
      );
    
    if (foundProducts && foundProducts.length >= 1) {
      const product = foundProducts[0];
      const imageUrl = `/assets/${mapping.imageFile}`;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, product.id));
      
      console.log(`✅ Fixed "${product.brand} - ${product.name}" with ${mapping.imageFile}`);
      fixedCount++;
    } else {
      console.log(`❌ Could not find product: ${mapping.brand} - ${mapping.name}`);
      notFoundList.push(`${mapping.brand} - ${mapping.name}`);
      notFoundCount++;
    }
  }
  
  console.log(`\n📊 Fix Results:`);
  console.log(`  Successfully fixed: ${fixedCount} products`);
  console.log(`  Not found in database: ${notFoundCount} products`);
  
  if (notFoundList.length > 0) {
    console.log(`\n❌ Products not found in database:`);
    notFoundList.forEach(item => console.log(`  - ${item}`));
  }
  
  // Show current status
  const currentCount = await db
    .select()
    .from(products)
    .where(products.imageUrl !== null);
  
  console.log(`\n🎯 Total products with images: ${currentCount.length}/220`);
}

fixCompromisedImages()
  .then(() => {
    console.log('\n🎉 Compromised image fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Compromised image fix failed:', error);
    process.exit(1);
  });