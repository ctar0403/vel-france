import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Correct image mappings - let's be more precise
const correctMappings = [
  {
    searchBrand: 'Azzaro',
    searchName: 'Wanted By Night',
    imageFile: 'Azzaro – Wanted By Night_1753549689340.webp'
  },
  {
    searchBrand: 'Boss',
    searchName: 'Bottled Night',
    imageFile: 'Boss – Bottled Night_1753549689341.webp'
  },
  {
    searchBrand: 'Boss',
    searchName: 'Just Different',
    imageFile: 'Boss – Just Different_1753549689341.webp'
  },
  {
    searchBrand: 'Bottega Veneta',
    searchName: 'IX Violetta',
    imageFile: 'Bottega Veneta – IX Violetta_1753549689342.webp'
  },
  {
    searchBrand: 'Bottega Veneta',
    searchName: 'V Lauro',
    imageFile: 'Bottega Veneta – V Lauro_1753549689342.webp'
  },
  {
    searchBrand: 'Bottega Veneta',
    searchName: 'VII Lilla',
    imageFile: 'Bottega Veneta – VII Lilla_1753549689342.webp'
  },
  {
    searchBrand: 'Bottega Veneta',
    searchName: 'XV Salvia Blu',
    imageFile: 'Bottega Veneta – XV Salvia Blu_1753549689343.webp'
  },
  {
    searchBrand: 'Burberry',
    searchName: 'Goddess',
    imageFile: 'Burberry – Goddess_1753549689343.webp'
  },
  {
    searchBrand: 'Burberry',
    searchName: 'Her London Dream',
    imageFile: 'Burberry – Her London Dream_1753549689344.webp'
  },
  {
    searchBrand: 'Amouage',
    searchName: 'Honor Man',
    imageFile: 'Amouage - Honor Man_1753549689344.webp'
  },
  {
    searchBrand: 'Amouage',
    searchName: 'Interlude Woman',
    imageFile: 'Amouage - Interlude Woman_1753549689344.webp'
  },
  {
    searchBrand: 'Armani',
    searchName: 'Acqua di Gio',
    imageFile: 'Armani - Acqua Di Gio_1753549689344.webp'
  }
];

async function fixImageMatching() {
  console.log('Starting precise image matching...');
  
  let matchedCount = 0;
  let notFoundCount = 0;
  
  for (const mapping of correctMappings) {
    // Find the exact product
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
      matchedCount++;
    } else if (foundProducts.length === 0) {
      console.log(`❌ No product found for: ${mapping.searchBrand} - ${mapping.searchName}`);
      notFoundCount++;
    } else {
      console.log(`⚠️  Multiple products found for: ${mapping.searchBrand} - ${mapping.searchName}`);
      foundProducts.forEach(p => console.log(`    → ${p.brand} - ${p.name}`));
      notFoundCount++;
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`  Successfully matched: ${matchedCount}`);
  console.log(`  Not found/Multiple: ${notFoundCount}`);
}

// Run the fix
fixImageMatching()
  .then(() => {
    console.log('\n✅ Image matching fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Image matching fix failed:', error);
    process.exit(1);
  });