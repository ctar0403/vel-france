import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

// Fix the incorrect assignments
async function fixImageAssignments() {
  console.log('Fixing incorrect image assignments...');
  
  // Fix Si Intense - should get Si Intense image, not Si image
  const siIntenseProducts = await db
    .select()
    .from(products)
    .where(
      and(
        like(products.brand, '%Armani%'),
        like(products.name, 'Si Intense')
      )
    );
  
  if (siIntenseProducts.length === 1) {
    await db
      .update(products)
      .set({ imageUrl: '/assets/Armani – Si Intense_1753549689345.webp' })
      .where(eq(products.id, siIntenseProducts[0].id));
    console.log('✅ Fixed Si Intense image');
  }
  
  // Fix regular Si - should get Si image  
  const siProducts = await db
    .select()
    .from(products)
    .where(
      and(
        like(products.brand, '%Armani%'),
        eq(products.name, 'Si')
      )
    );
  
  if (siProducts.length === 1) {
    await db
      .update(products)
      .set({ imageUrl: '/assets/Armani – Si_1753549689346.webp' })
      .where(eq(products.id, siProducts[0].id));
    console.log('✅ Fixed Si image');
  }
  
  // Fix Stronger With You Absolutely - should get Absolutely image
  const absolutelyProducts = await db
    .select()
    .from(products)
    .where(
      and(
        like(products.brand, '%Armani%'),
        like(products.name, 'Stronger With You Absolutely')
      )
    );
  
  if (absolutelyProducts.length === 1) {
    await db
      .update(products)
      .set({ imageUrl: '/assets/Armani – Stronger With You Absolutely_1753549689346.webp' })
      .where(eq(products.id, absolutelyProducts[0].id));
    console.log('✅ Fixed Stronger With You Absolutely image');
  }
  
  // Fix regular Stronger With You - should get regular image
  const regularProducts = await db
    .select()
    .from(products)
    .where(
      and(
        like(products.brand, '%Armani%'),
        eq(products.name, 'Stronger With You')
      )
    );
  
  if (regularProducts.length === 1) {
    await db
      .update(products)
      .set({ imageUrl: '/assets/Armani – Stronger With You_1753549689346.webp' })
      .where(eq(products.id, regularProducts[0].id));
    console.log('✅ Fixed Stronger With You image');
  }
  
  console.log('Image assignment fixes completed!');
}

// Run the fixes
fixImageAssignments()
  .then(() => {
    console.log('\n✅ All image assignments fixed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });