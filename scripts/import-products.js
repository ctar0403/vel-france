import fs from 'fs';
import csv from 'csv-parser';
import { db } from '../server/db.ts';
import { products } from '../shared/schema.ts';

// Category mapping from Georgian to English
const categoryMapping = {
  'კაცის': "Men's",
  'ქალის': "Women's", 
  'ნიშური': 'Niche',
  'უნისექსი': 'Unisex'
};

// Function to clean and process product data
function processProductData(row) {
  // Extract brand from name (everything before the first " - ")
  const nameParts = row.Name.split(' - ');
  const brand = nameParts[0].trim();
  const productName = nameParts.slice(1).join(' - ').trim();
  
  // Clean and process categories
  let categories = [];
  if (row.Categories) {
    const rawCategories = row.Categories.split(',').map(cat => cat.trim());
    categories = rawCategories.map(cat => categoryMapping[cat] || cat).filter(Boolean);
  }
  
  // If no categories found, try to infer from context or default
  if (categories.length === 0) {
    categories = ['Unisex']; // Default category
  }
  
  // Clean description - remove HTML and Georgian text, keep only English parts
  let description = row.Description || '';
  // Remove HTML tags
  description = description.replace(/<[^>]*>/g, '');
  // Remove div and section content
  description = description.replace(/\n\n/g, '\n').trim();
  
  // Extract price information
  let salePrice = parseFloat(row['Sale price']) || 0;
  let regularPrice = parseFloat(row['Regular price']) || 0;
  
  // Use regular price if sale price is 0 or not available
  const finalPrice = salePrice > 0 ? salePrice : regularPrice;
  
  // Process image URL
  let imageUrl = row.Images || null;
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = null; // Invalid URL format
  }
  
  return {
    name: productName || row.Name,
    brand: brand,
    description: description,
    shortDescription: row['Short description'] || '',
    price: finalPrice.toString(),
    category: categories[0], // Use the first category as primary
    imageUrl: imageUrl,
    inStock: row['In stock?'] === '1',
    notes: description // Use description as notes for now
  };
}

async function importProducts() {
  console.log('Starting product import...');
  
  const csvFilePath = './attached_assets/wc-product-export-26-7-2025-1753548927640_1753548989205.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('CSV file not found:', csvFilePath);
    return;
  }
  
  const productsToInsert = [];
  let processedCount = 0;
  let errorCount = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Skip if name is empty
          if (!row.Name || row.Name.trim() === '') {
            return;
          }
          
          const productData = processProductData(row);
          
          // Basic validation
          if (productData.name && productData.price && parseFloat(productData.price) > 0) {
            productsToInsert.push(productData);
            processedCount++;
          } else {
            console.warn(`Skipping invalid product: ${row.Name}`);
            errorCount++;
          }
        } catch (error) {
          console.error(`Error processing row: ${row.Name}`, error);
          errorCount++;
        }
      })
      .on('end', async () => {
        console.log(`Processed ${processedCount} products, ${errorCount} errors`);
        
        if (productsToInsert.length === 0) {
          console.log('No valid products to insert');
          resolve();
          return;
        }
        
        try {
          // Clear existing products first (optional - remove if you want to keep existing)
          console.log('Clearing existing products...');
          await db.delete(products);
          
          // Insert products in batches to avoid overwhelming the database
          const batchSize = 50;
          let insertedCount = 0;
          
          for (let i = 0; i < productsToInsert.length; i += batchSize) {
            const batch = productsToInsert.slice(i, i + batchSize);
            
            try {
              await db.insert(products).values(batch);
              insertedCount += batch.length;
              console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}: ${insertedCount}/${productsToInsert.length} products`);
            } catch (error) {
              console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
              
              // Try inserting one by one in case of batch error
              for (const product of batch) {
                try {
                  await db.insert(products).values([product]);
                  insertedCount++;
                } catch (singleError) {
                  console.error(`Failed to insert product: ${product.name}`, singleError);
                }
              }
            }
          }
          
          console.log(`✅ Successfully imported ${insertedCount} products`);
          
          // Show summary by category
          const categorySummary = {};
          productsToInsert.forEach(product => {
            categorySummary[product.category] = (categorySummary[product.category] || 0) + 1;
          });
          
          console.log('\n📊 Products by category:');
          Object.entries(categorySummary).forEach(([category, count]) => {
            console.log(`  ${category}: ${count} products`);
          });
          
          resolve();
        } catch (error) {
          console.error('Error during database operations:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
}

// Run the import
importProducts()
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });

export { importProducts };