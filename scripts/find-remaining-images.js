import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { eq, like, and } from 'drizzle-orm';

async function findRemainingUpdates() {
  console.log('Analyzing remaining image opportunities...');
  
  // Check the second 1 Million file that might not have been processed
  const millionProducts = await db
    .select()
    .from(products)
    .where(
      and(
        like(products.brand, '%Paco Rabanne%'),
        like(products.name, '%1 Million%')
      )
    );
  
  console.log(`\nPaco Rabanne 1 Million products found: ${millionProducts.length}`);
  millionProducts.forEach(p => {
    console.log(`  - ID: ${p.id}, Name: "${p.name}", Has Image: ${p.imageUrl ? 'YES' : 'NO'}`);
  });
  
  // Check if there are any products without images that could match our available images
  const withoutImages = await db
    .select()
    .from(products)
    .where(products.imageUrl === null);
    
  console.log(`\nProducts without images: ${withoutImages.length}`);
  
  // Look for potential matches from recent batches
  const possibleMatches = withoutImages.filter(p => 
    p.brand.includes('Paco Rabanne') || 
    p.brand.includes('Narciso Rodriguez') ||
    p.brand.includes('Orto Parisi') ||
    p.brand.includes('Nasomatto') ||
    p.brand.includes('Montblanc') ||
    p.brand.includes('Moschino') ||
    p.brand.includes('Mugler')
  );
  
  console.log(`\nPossible matches from recent brands: ${possibleMatches.length}`);
  possibleMatches.forEach(p => {
    console.log(`  - "${p.brand} - ${p.name}"`);
  });
  
  // Try to update the second 1 Million if it exists
  const millionWithoutImage = millionProducts.find(p => !p.imageUrl);
  if (millionWithoutImage) {
    console.log(`\nFound 1 Million without image, updating...`);
    await db
      .update(products)
      .set({ imageUrl: '/assets/Paco Rabanne – 1 Million_1753552335226.webp' })
      .where(eq(products.id, millionWithoutImage.id));
    console.log(`✅ Updated second 1 Million with different dash variant`);
  }
  
  // Final count
  const finalCount = await db
    .select()
    .from(products)
    .where(products.imageUrl !== null);
    
  console.log(`\n🎯 Current total with images: ${finalCount.length}`);
}

findRemainingUpdates()
  .then(() => {
    console.log('\n🔍 Analysis complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });