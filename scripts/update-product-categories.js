import fs from 'fs';
import csvParser from 'csv-parser';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Category mapping from Georgian to English
const categoryMapping = {
  'კაცის': 'Men\'s',
  'ქალის': 'Women\'s', 
  'უნისექსი': 'Unisex',
  'ნიშური': 'Niche'
};

async function updateProductCategories() {
  console.log('🔄 Starting product categories update...');
  
  const products = [];
  
  // Read and parse CSV file
  await new Promise((resolve, reject) => {
    fs.createReadStream('../attached_assets/wc-product-export-26-7-2025-1753548927640_1753815824723.csv')
      .pipe(csvParser())
      .on('data', (row) => {
        if (row.Name && row.Categories) {
          products.push({
            name: row.Name,
            categories: row.Categories
          });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📊 Found ${products.length} products in CSV`);

  let updated = 0;
  let errors = 0;

  for (const product of products) {
    try {
      // Parse categories from CSV (they're comma-separated Georgian categories)
      const georgianCategories = product.categories
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat);
      
      // Convert Georgian categories to English
      const englishCategories = georgianCategories
        .map(georgianCat => categoryMapping[georgianCat])
        .filter(cat => cat); // Remove any unmapped categories
      
      if (englishCategories.length === 0) {
        console.log(`⚠️  No valid categories found for: ${product.name}`);
        continue;
      }

      // Extract product name without brand (after the " - " part)
      const productNameParts = product.name.split(' - ');
      const productName = productNameParts.length > 1 ? productNameParts[1] : product.name;

      // For products with multiple categories, we'll use the first one as primary
      // and store all categories in the categories array field
      const primaryCategory = englishCategories[0];
      
      // Create a mapping of common name variations
      const nameVariations = [
        productName,
        productName.replace('Eau De Parfum', '').trim(),
        productName.replace('(EDP)', '').trim(),
        productName.replace('S*x', 'Sex'),
        productName.replace('F*cking', 'Fucking'),
        productName.replace('N5', 'No 5'),
        productName.replace('No 5', 'N5'),
        productName.replace(' - ', ' '),
        product.name
      ];

      let result = { count: 0 };
      
      // Try each name variation
      for (const nameVar of nameVariations) {
        if (result.count === 0) {
          result = await sql`
            UPDATE products 
            SET category = ${primaryCategory}, 
                categories = ${englishCategories}
            WHERE LOWER(TRIM(name)) = LOWER(TRIM(${nameVar}))
          `;
        }
      }

      // If still not found, try partial matching
      if (result.count === 0) {
        const cleanProductName = productName.replace(/[^\w\s]/g, '').toLowerCase();
        result = await sql`
          UPDATE products 
          SET category = ${primaryCategory}, 
              categories = ${englishCategories}
          WHERE LOWER(REGEXP_REPLACE(name, '[^\\w\\s]', '', 'g')) = ${cleanProductName}
        `;
      }

      if (result.count > 0) {
        updated++;
        console.log(`✅ Updated: ${productName} -> ${englishCategories.join(', ')}`);
      } else {
        console.log(`❌ Product not found in database: ${product.name} (tried: ${productName})`);
      }

    } catch (error) {
      errors++;
      console.error(`❌ Error updating ${product.name}:`, error.message);
    }
  }

  console.log(`\n📈 Update Summary:`);
  console.log(`✅ Successfully updated: ${updated} products`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`🔄 Categories update completed!`);
}

updateProductCategories().catch(console.error);