import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Manual fixes for Dolce & Gabbana products that weren't matched
const fixMappings = [
  // Try different variations for Light Blue
  { searchTerms: ['Light Blue'], imageFile: 'Dolce&Gabbana – Light Blue_1753551333692.webp' },
  // Try different variations for The One
  { searchTerms: ['The One'], imageFile: 'Dolce&Gabbana – The One_1753551333693.webp' },
  // Try different variations for The Only One
  { searchTerms: ['The Only One'], imageFile: 'Dolce&Gabbana – The Only One_1753551333694.webp' },
  // Try different variations for The Only One 2  
  { searchTerms: ['The Only One 2'], imageFile: 'Dolce&Gabbana – The Only One 2_1753551333693.webp' }
];

async function fixDolceGabbanaImages() {
  console.log('Fixing Dolce & Gabbana product images...');
  
  // First, let's see all Dolce & Gabbana products
  const allDolceProducts = await db
    .select()
    .from(products)
    .where(like(products.brand, '%Dolce%'));
  
  console.log('\nAll Dolce & Gabbana products in database:');
  allDolceProducts.forEach(p => console.log(`  → ${p.brand} - ${p.name}`));
  
  let updatedCount = 0;
  
  for (const mapping of fixMappings) {
    let foundProduct = null;
    
    // Try each search term
    for (const searchTerm of mapping.searchTerms) {
      const matches = allDolceProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matches.length === 1) {
        foundProduct = matches[0];
        break;
      } else if (matches.length > 1) {
        // For "The Only One" vs "The Only One 2", be more specific
        if (searchTerm === 'The Only One 2') {
          foundProduct = matches.find(p => 
            p.name.toLowerCase().includes('2') || p.name.toLowerCase().includes('two')
          );
        } else if (searchTerm === 'The Only One') {
          foundProduct = matches.find(p => 
            !p.name.toLowerCase().includes('2') && !p.name.toLowerCase().includes('two')
          );
        } else {
          foundProduct = matches[0]; // Take first match
        }
        break;
      }
    }
    
    if (foundProduct && !foundProduct.imageUrl) {
      const imageUrl = `/assets/${mapping.imageFile}`;
      
      await db
        .update(products)
        .set({ imageUrl: imageUrl })
        .where(eq(products.id, foundProduct.id));
      
      console.log(`✅ Fixed "${foundProduct.brand} - ${foundProduct.name}" with ${mapping.imageFile}`);
      updatedCount++;
    } else if (foundProduct && foundProduct.imageUrl) {
      console.log(`⚠️  "${foundProduct.brand} - ${foundProduct.name}" already has image: ${foundProduct.imageUrl}`);
    } else {
      console.log(`❌ Could not find match for image: ${mapping.imageFile}`);
    }
  }
  
  console.log(`\n📊 Fix Results: ${updatedCount} products updated`);
}

// Run the fix
fixDolceGabbanaImages()
  .then(() => {
    console.log('\n✅ Dolce & Gabbana image fixes completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });