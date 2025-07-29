import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import csv from 'csv-parser';

const sql = neon(process.env.DATABASE_URL);

// Georgian to English category mapping
const categoryMapping = {
  'კაცის': 'Men\'s',
  'ქალის': 'Women\'s', 
  'უნისექსი': 'Unisex',
  'ნიშური': 'Niche'
};

// Function to parse CSV and create category mappings
async function parseCsvAndUpdateCategories() {
  console.log('🔄 Starting comprehensive category update from CSV...');
  
  const csvData = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('../attached_assets/wc-product-export-26-7-2025-1753548927640_1753815824723.csv')
      .pipe(csv())
      .on('data', (row) => {
        csvData.push(row);
      })
      .on('end', async () => {
        console.log(`📊 Found ${csvData.length} products in CSV`);
        
        let updated = 0;
        let notFound = 0;
        let errors = 0;

        for (const row of csvData) {
          try {
            const productName = row.Name?.trim();
            const categoriesStr = row.Categories?.trim();
            
            if (!productName || !categoriesStr) {
              console.log(`⚠️  Skipping row - missing data: ${productName || 'NO_NAME'}`);
              continue;
            }

            // Parse Georgian categories and convert to English
            const georgianCategories = categoriesStr.split(',').map(cat => cat.trim());
            const englishCategories = georgianCategories
              .map(cat => categoryMapping[cat])
              .filter(Boolean);

            if (englishCategories.length === 0) {
              console.log(`⚠️  No valid categories for: ${productName}`);
              continue;
            }

            // Extract the actual product name without the brand prefix
            let searchName = productName;
            
            // Try to match products in various ways
            const searchVariations = [
              productName,
              productName.replace(/^[^-]+ - /, ''), // Remove "Brand - " prefix
              productName.replace(/^[^–]+ – /, ''), // Remove "Brand – " prefix  
              productName.split(' - ').pop(), // Get part after last dash
              productName.split(' – ').pop(), // Get part after last en-dash
            ].filter(Boolean);

            let result = null;
            let foundName = '';

            // Try exact matches first
            for (const variation of searchVariations) {
              if (result && result.count > 0) break;
              
              result = await sql`
                UPDATE products 
                SET category = ${englishCategories[0]}, 
                    categories = ${englishCategories}
                WHERE name = ${variation}
              `;
              
              if (result.count > 0) {
                foundName = variation;
                break;
              }
            }

            // Try case-insensitive matches
            if (!result || result.count === 0) {
              for (const variation of searchVariations) {
                if (result && result.count > 0) break;
                
                result = await sql`
                  UPDATE products 
                  SET category = ${englishCategories[0]}, 
                      categories = ${englishCategories}
                  WHERE LOWER(name) = LOWER(${variation})
                `;
                
                if (result.count > 0) {
                  foundName = variation;
                  break;
                }
              }
            }

            // Try partial matches for complex names
            if (!result || result.count === 0) {
              for (const variation of searchVariations) {
                if (result && result.count > 0) break;
                
                // Remove common suffixes and try again
                const cleanedName = variation
                  .replace(/\s+eau\s+de\s+parfum$/i, '')
                  .replace(/\s+edp$/i, '')
                  .replace(/\s+perfume$/i, '')
                  .trim();
                
                if (cleanedName !== variation) {
                  result = await sql`
                    UPDATE products 
                    SET category = ${englishCategories[0]}, 
                        categories = ${englishCategories}
                    WHERE LOWER(name) = LOWER(${cleanedName})
                  `;
                  
                  if (result.count > 0) {
                    foundName = cleanedName;
                    break;
                  }
                }
              }
            }

            if (result && result.count > 0) {
              updated++;
              console.log(`✅ Updated: ${foundName} -> [${englishCategories.join(', ')}]`);
            } else {
              notFound++;
              console.log(`❌ Product not found: ${productName} (tried: ${searchVariations.join(', ')})`);
            }

          } catch (error) {
            errors++;
            console.error(`❌ Error processing ${row.Name}:`, error.message);
          }
        }

        console.log(`\n📈 Update Summary:`);
        console.log(`✅ Successfully updated: ${updated} products`);
        console.log(`❌ Products not found: ${notFound}`);
        console.log(`❌ Errors: ${errors}`);
        console.log(`🔄 Comprehensive category update completed!`);
        
        resolve({ updated, notFound, errors });
      })
      .on('error', reject);
  });
}

parseCsvAndUpdateCategories().catch(console.error);