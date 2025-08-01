import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

async function fixBatch2Conflicts() {
  console.log('Fixing conflicts from batch 2...');
  
  // Fix Carolina Herrera Good Girl - the regular Good Girl should get the Good Girl image
  const goodGirlProducts = await db
    .select()
    .from(products)
    .where(
      and(
        like(products.brand, '%Carolina Herrera%'),
        eq(products.name, 'Good Girl')
      )
    );
  
  if (goodGirlProducts.length === 1) {
    await db
      .update(products)
      .set({ imageUrl: '/assets/Carolina Herrera – Good Girl_1753550361313.webp' })
      .where(eq(products.id, goodGirlProducts[0].id));
    console.log('✅ Fixed Good Girl image');
  }
  
  // Fix Carolina Herrera Good Girl Supreme - should keep its current image or get a different one if available
  const goodGirlSupremeProducts = await db
    .select()
    .from(products)
    .where(
      and(
        like(products.brand, '%Carolina Herrera%'),
        like(products.name, 'Good Girl Supreme')
      )
    );
  
  if (goodGirlSupremeProducts.length === 1) {
    // For now, clear the image since we don't have a Good Girl Supreme specific image
    await db
      .update(products)
      .set({ imageUrl: null })
      .where(eq(products.id, goodGirlSupremeProducts[0].id));
    console.log('✅ Cleared Good Girl Supreme image (no specific image available)');
  }
  
  // Fix Chanel Allure Homme - the regular Allure Homme should get the regular image
  const allureHommeProducts = await db
    .select()
    .from(products)
    .where(
      and(
        like(products.brand, '%Chanel%'),
        eq(products.name, 'Allure Homme')
      )
    );
  
  if (allureHommeProducts.length === 1) {
    await db
      .update(products)
      .set({ imageUrl: '/assets/Chanel – Allure Homme_1753550361314.webp' })
      .where(eq(products.id, allureHommeProducts[0].id));
    console.log('✅ Fixed Allure Homme image');
  }
  
  // Ensure Chanel Allure Homme Sport keeps its correct image
  const allureHommeSportProducts = await db
    .select()
    .from(products)
    .where(
      and(
        like(products.brand, '%Chanel%'),
        like(products.name, 'Allure Homme Sport')
      )
    );
  
  if (allureHommeSportProducts.length === 1) {
    await db
      .update(products)
      .set({ imageUrl: '/assets/Chanel – Allure Homme Sport_1753550361313.webp' })
      .where(eq(products.id, allureHommeSportProducts[0].id));
    console.log('✅ Confirmed Allure Homme Sport image');
  }
  
  console.log('Batch 2 conflict fixes completed!');
}

// Run the fixes
fixBatch2Conflicts()
  .then(() => {
    console.log('\n✅ All batch 2 conflicts resolved');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });