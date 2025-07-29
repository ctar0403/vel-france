import fs from 'fs';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import { products } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

// Read the price data
const priceData = JSON.parse(fs.readFileSync('scripts/price-data.json', 'utf8'));

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function updatePrices() {
  console.log('Starting price update process...\n');
  
  // Get all current products
  const currentProducts = await db.select().from(products);
  console.log(`Found ${currentProducts.length} products in database`);
  
  const updatedProducts = [];
  const notFoundProducts = [];
  const extraPriceListItems = [];
  
  // Create a map of current products by name for easier lookup
  const productMap = new Map();
  currentProducts.forEach(product => {
    // Normalize product names for comparison (remove extra spaces, convert to lowercase)
    const normalizedName = product.name.trim().toLowerCase();
    productMap.set(normalizedName, product);
  });
  
  // Process each item in the price list
  for (const priceItem of priceData) {
    const normalizedPriceName = priceItem.name.trim().toLowerCase();
    const matchingProduct = productMap.get(normalizedPriceName);
    
    if (matchingProduct) {
      // Update the product price
      await db.update(products)
        .set({ price: priceItem.price.toString() })
        .where(eq(products.id, matchingProduct.id));
      
      updatedProducts.push({
        name: matchingProduct.name,
        oldPrice: matchingProduct.price,
        newPrice: priceItem.price.toString()
      });
      
      console.log(`✓ Updated: ${matchingProduct.name} - ${matchingProduct.price} → ${priceItem.price}`);
    } else {
      // Try partial matching for common variations
      let found = false;
      for (const [dbName, dbProduct] of productMap.entries()) {
        // Check for partial matches or variations
        if (dbName.includes(normalizedPriceName) || normalizedPriceName.includes(dbName)) {
          await db.update(products)
            .set({ price: priceItem.price.toString() })
            .where(eq(products.id, dbProduct.id));
          
          updatedProducts.push({
            name: dbProduct.name,
            oldPrice: dbProduct.price,
            newPrice: priceItem.price.toString()
          });
          
          console.log(`✓ Updated (partial match): ${dbProduct.name} - ${dbProduct.price} → ${priceItem.price}`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        extraPriceListItems.push(priceItem.name);
        console.log(`✗ Not found in database: ${priceItem.name}`);
      }
    }
  }
  
  // Find products that were not updated (missing from price list)
  const updatedProductNames = new Set(updatedProducts.map(p => p.name.toLowerCase()));
  const missedProducts = currentProducts.filter(product => 
    !updatedProductNames.has(product.name.toLowerCase())
  );
  
  console.log('\n=== PRICE UPDATE SUMMARY ===');
  console.log(`Total products in database: ${currentProducts.length}`);
  console.log(`Total items in price list: ${priceData.length}`);
  console.log(`Successfully updated: ${updatedProducts.length}`);
  console.log(`Products missed (not in price list): ${missedProducts.length}`);
  console.log(`Extra items in price list (not in database): ${extraPriceListItems.length}`);
  
  if (missedProducts.length > 0) {
    console.log('\n=== PRODUCTS MISSED (Not updated) ===');
    missedProducts.forEach(product => {
      console.log(`- ${product.name} (Current price: ${product.price})`);
    });
  }
  
  if (extraPriceListItems.length > 0) {
    console.log('\n=== EXTRA ITEMS IN PRICE LIST (Not in database) ===');
    extraPriceListItems.forEach(name => {
      console.log(`- ${name}`);
    });
  }
  
  console.log('\nPrice update completed!');
}

updatePrices().catch(console.error);