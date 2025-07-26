import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Update all the image paths to point to the correct location
const imageMappings = [
  {
    searchBrand: 'Azzaro',
    searchName: 'Wanted By Night',
    imageFile: 'Azzaro – Wanted By Night_1753549689340.png'
  },
  {
    searchBrand: 'Boss',
    searchName: 'Bottled Night',
    imageFile: 'Boss – Bottled Night_1753549689341.png'
  },
  {
    searchBrand: 'Boss',
    searchName: 'Just Different',
    imageFile: 'Boss – Just Different_1753549689341.png'
  },
  {
    searchBrand: 'Bottega Veneta',
    searchName: 'IX Violetta',
    imageFile: 'Bottega Veneta – IX Violetta_1753549689342.png'
  },
  {
    searchBrand: 'Bottega Veneta',
    searchName: 'V Lauro',
    imageFile: 'Bottega Veneta – V Lauro_1753549689342.png'
  },
  {
    searchBrand: 'Bottega Veneta',
    searchName: 'VII Lilla',
    imageFile: 'Bottega Veneta – VII Lilla_1753549689342.png'
  },
  {
    searchBrand: 'Bottega Veneta',
    searchName: 'XV Salvia Blu',
    imageFile: 'Bottega Veneta – XV Salvia Blu_1753549689343.png'
  },
  {
    searchBrand: 'Burberry',
    searchName: 'Goddess',
    imageFile: 'Burberry – Goddess_1753549689343.png'
  },
  {
    searchBrand: 'Burberry',
    searchName: 'Her London Dream',
    imageFile: 'Burberry – Her London Dream_1753549689344.png'
  },
  {
    searchBrand: 'Amouage',
    searchName: 'Honor Man',
    imageFile: 'Amouage - Honor Man_1753549689344.png'
  },
  {
    searchBrand: 'Amouage',
    searchName: 'Interlude Woman',
    imageFile: 'Amouage - Interlude Woman_1753549689344.png'
  },
  {
    searchBrand: 'Armani',
    searchName: 'Acqua di Gio',
    imageFile: 'Armani - Acqua Di Gio_1753549689344.png'
  }
];

async function updateImagePaths() {
  console.log('Updating image paths to correct location...');
  
  let updatedCount = 0;
  
  for (const mapping of imageMappings) {
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
      
      console.log(`✅ Updated "${product.brand} - ${product.name}" with ${imageUrl}`);
      updatedCount++;
    }
  }
  
  console.log(`\n🎉 Successfully updated ${updatedCount} products with correct image paths!`);
}

// Run the update
updateImagePaths()
  .then(() => {
    console.log('\n✅ Image path update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Image path update failed:', error);
    process.exit(1);
  });