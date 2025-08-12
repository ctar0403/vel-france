import fs from 'fs';
import csv from 'csv-parser';
import { db } from '../server/db';
import { products } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface ProductCapacityRow {
  Name: string;
  'Attribute 1 name': string;
  'Attribute 1 value(s)': string;
  'Attribute 2 name': string;
  'Attribute 2 value(s)': string;
}

// Mapping of CSV product names to exact database product names
const productNameMapping: Record<string, string> = {
  // Add any name differences between CSV and database here if needed
};

async function updateProductCapacities() {
  const capacityData: Record<string, string> = {};
  
  // Read and parse CSV file
  const csvPath = './attached_assets/wc-product-export-13-8-2025-1755030340120_1755030388103.csv';
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: any) => {
        // Handle BOM (Byte Order Mark) in column names
        const nameKey = Object.keys(row).find(key => key.includes('Name')) || 'Name';
        const productName = row[nameKey];
        let capacity = '';
        
        // Check if capacity is in attribute 1 or 2
        if (row['Attribute 1 name'] === 'მოცულობა') {
          capacity = row['Attribute 1 value(s)'];
        } else if (row['Attribute 2 name'] === 'მოცულობა') {
          capacity = row['Attribute 2 value(s)'];
        }
        
        if (capacity && productName) {
          capacityData[productName] = capacity;
          console.log(`✓ Found capacity data: "${productName}" -> ${capacity}`);
        }
      })
      .on('end', async () => {
        console.log('CSV parsing completed. Found capacity data for', Object.keys(capacityData).length, 'products');
        
        try {
          // Get all products from database
          const allProducts = await db.select().from(products);
          console.log('Found', allProducts.length, 'products in database');
          
          let updateCount = 0;
          let notFoundCount = 0;
          
          for (const product of allProducts) {
            // Try exact match first with current name
            let capacity = capacityData[product.name];
            
            // Try matching with brand + name format like "Dior - Sauvage"
            if (!capacity && product.brand) {
              const brandNameFormat = `${product.brand} - ${product.name}`;
              capacity = capacityData[brandNameFormat];
              if (capacity) {
                console.log(`Matched "${product.name}" (${product.brand}) with CSV "${brandNameFormat}"`);
              }
            }
            
            // Try partial matching if exact matches fail
            if (!capacity) {
              for (const csvProductName of Object.keys(capacityData)) {
                if (csvProductName.includes(product.brand) && csvProductName.includes(product.name)) {
                  capacity = capacityData[csvProductName];
                  console.log(`Partial matched "${product.name}" (${product.brand}) with CSV "${csvProductName}"`);
                  break;
                }
              }
            }
            
            if (capacity) {
              // Update product with capacity
              await db
                .update(products)
                .set({ capacity: capacity, updatedAt: new Date() })
                .where(eq(products.id, product.id));
              
              console.log(`Updated "${product.name}" with capacity: ${capacity}`);
              updateCount++;
            } else {
              console.log(`No capacity found for: "${product.name}"`);
              notFoundCount++;
            }
          }
          
          console.log('\nUpdate Summary:');
          console.log(`- Successfully updated: ${updateCount} products`);
          console.log(`- No capacity data found: ${notFoundCount} products`);
          console.log('Capacity update completed!');
          
          resolve(true);
        } catch (error) {
          console.error('Error updating products:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

// Run the update
updateProductCapacities()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });