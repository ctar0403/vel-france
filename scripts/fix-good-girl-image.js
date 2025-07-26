import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

async function fixGoodGirlImages() {
  console.log('Looking for Carolina Herrera Good Girl products...');
  
  // Find all Good Girl related products
  const goodGirlProducts = await db
    .select()
    .from(products)
    .where(
      and(
        like(products.brand, '%Carolina Herrera%'),
        like(products.name, '%Good Girl%')
      )
    );
  
  console.log('Found Good Girl products:');
  goodGirlProducts.forEach(p => console.log(`  - ${p.name}: ${p.imageUrl || 'NO IMAGE'}`));
  
  // Assign images correctly:
  // - "Good Girl" (exact match) should get the Good Girl image
  // - "Good Girl Supreme" should get the Good Girl image since we don't have a specific Supreme image
  // - "Very Good Girl" already has its correct image
  
  for (const product of goodGirlProducts) {
    if (product.name === 'Good Girl' && !product.imageUrl) {
      await db
        .update(products)
        .set({ imageUrl: '/assets/Carolina Herrera – Good Girl_1753550361313.png' })
        .where(eq(products.id, product.id));
      console.log('✅ Assigned Good Girl image to regular Good Girl');
    } else if (product.name === 'Good Girl Supreme' && !product.imageUrl) {
      // Use the same Good Girl image for Supreme since we don't have a specific Supreme image
      await db
        .update(products)
        .set({ imageUrl: '/assets/Carolina Herrera – Good Girl_1753550361313.png' })
        .where(eq(products.id, product.id));
      console.log('✅ Assigned Good Girl image to Good Girl Supreme');
    }
  }
  
  // Check final count
  const finalCount = await db
    .select()
    .from(products)
    .where(products.imageUrl !== null);
  
  console.log(`\nFinal count: ${finalCount.length} products with images`);
}

// Run the fix
fixGoodGirlImages()
  .then(() => {
    console.log('\n✅ Good Girl images fixed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });