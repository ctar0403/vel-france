import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';
import { isNull } from 'drizzle-orm';

async function findRemainingProducts() {
  console.log('Finding products without images...');
  
  const productsWithoutImages = await db
    .select()
    .from(products)
    .where(isNull(products.imageUrl))
    .orderBy(products.brand, products.name);
  
  console.log(`\n📊 Found ${productsWithoutImages.length} products without images:`);
  
  productsWithoutImages.forEach(product => {
    console.log(`- ${product.brand} - ${product.name}`);
  });
  
  // Group by brand
  const byBrand = {};
  productsWithoutImages.forEach(product => {
    if (!byBrand[product.brand]) {
      byBrand[product.brand] = [];
    }
    byBrand[product.brand].push(product.name);
  });
  
  console.log('\n📈 Grouped by brand:');
  Object.keys(byBrand).sort().forEach(brand => {
    console.log(`${brand}: ${byBrand[brand].length} products`);
    byBrand[brand].forEach(name => console.log(`  → ${name}`));
  });
}

// Run the analysis
findRemainingProducts()
  .then(() => {
    console.log('\n✅ Analysis completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error);
    process.exit(1);
  });