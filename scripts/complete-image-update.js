import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// All 20 image mappings
const allImageMappings = [
  // Already processed
  { searchBrand: 'Azzaro', searchName: 'Wanted By Night', imageFile: 'Azzaro – Wanted By Night_1753549689340.png' },
  { searchBrand: 'Boss', searchName: 'Bottled Night', imageFile: 'Boss – Bottled Night_1753549689341.png' },
  { searchBrand: 'Boss', searchName: 'Just Different', imageFile: 'Boss – Just Different_1753549689341.png' },
  { searchBrand: 'Bottega Veneta', searchName: 'IX Violetta', imageFile: 'Bottega Veneta – IX Violetta_1753549689342.png' },
  { searchBrand: 'Bottega Veneta', searchName: 'V Lauro', imageFile: 'Bottega Veneta – V Lauro_1753549689342.png' },
  { searchBrand: 'Bottega Veneta', searchName: 'VII Lilla', imageFile: 'Bottega Veneta – VII Lilla_1753549689342.png' },
  { searchBrand: 'Bottega Veneta', searchName: 'XV Salvia Blu', imageFile: 'Bottega Veneta – XV Salvia Blu_1753549689343.png' },
  { searchBrand: 'Burberry', searchName: 'Goddess', imageFile: 'Burberry – Goddess_1753549689343.png' },
  { searchBrand: 'Burberry', searchName: 'Her London Dream', imageFile: 'Burberry – Her London Dream_1753549689344.png' },
  { searchBrand: 'Amouage', searchName: 'Honor Man', imageFile: 'Amouage - Honor Man_1753549689344.png' },
  { searchBrand: 'Amouage', searchName: 'Interlude Woman', imageFile: 'Amouage - Interlude Woman_1753549689344.png' },
  { searchBrand: 'Armani', searchName: 'Acqua di Gio', imageFile: 'Armani - Acqua Di Gio_1753549689344.png' },
  
  // Missing 8 Armani products
  { searchBrand: 'Armani', searchName: 'Code', imageFile: 'Armani - Code_1753549689345.png' },
  { searchBrand: 'Armani', searchName: 'My Way Intense', imageFile: 'Armani - My Way Intense_1753549689345.png' },
  { searchBrand: 'Armani', searchName: 'Si Intense', imageFile: 'Armani – Si Intense_1753549689345.png' },
  { searchBrand: 'Armani', searchName: 'Si Passione', imageFile: 'Armani – Si Passione_1753549689345.png' },
  { searchBrand: 'Armani', searchName: 'Si', imageFile: 'Armani – Si_1753549689346.png' },
  { searchBrand: 'Armani', searchName: 'Stronger With You Absolutely', imageFile: 'Armani – Stronger With You Absolutely_1753549689346.png' },
  { searchBrand: 'Armani', searchName: 'Stronger With You Intensely', imageFile: 'Armani – Stronger With You Intensely_1753549689346.png' },
  { searchBrand: 'Armani', searchName: 'Stronger With You', imageFile: 'Armani – Stronger With You_1753549689346.png' }
];

async function updateAllImages() {
  console.log(`Starting complete image update for ${allImageMappings.length} images...`);
  
  let updatedCount = 0;
  let notFoundCount = 0;
  const notFoundList = [];
  
  for (const mapping of allImageMappings) {
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
  
  console.log(`\n📊 Final Results:`);
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

// Run the complete update
updateAllImages()
  .then(() => {
    console.log('\n🎉 Complete image update finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Complete image update failed:', error);
    process.exit(1);
  });