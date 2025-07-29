import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Category mapping from Georgian to English
const categoryMapping = {
  'კაცის': 'Men\'s',
  'ქალის': 'Women\'s', 
  'უნისექსი': 'Unisex',
  'ნიშური': 'Niche'
};

// Based on the CSV data, here are the multiple category updates for specific products
const multiCategoryUpdates = [
  // Products with all 4 categories (კაცის, ნიშური, უნისექსი, ქალის)
  { name: 'Ganymede', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Baccarat Rouge 540 Eau De Parfum', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Oud Satin Mood', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  
  // Products with 3 categories (კაცის, უნისექსი, ქალის)
  { name: 'Oud Wood', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  { name: 'Bitter Peach', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  { name: 'Vanilla S*x', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  { name: 'F*cking Fabulous', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  
  // Products with 4 categories (კაცის, ნიშური, უნისექსი, ქალის)
  { name: 'Red Tobacco', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  
  // Products with Niche + Women's (ნიშური, ქალის)
  { name: 'Good Girl Gone Bad Extreme', categories: ['Niche', 'Women\'s'] },
  { name: 'Good Girl Gone Bad', categories: ['Niche', 'Women\'s'] },
  
  // Add more as needed based on CSV data
  { name: 'Black Afgano', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Roses On Ice', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'More Than Words', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'Side Effect', categories: ['Men\'s', 'Niche', 'Unisex'] },
  { name: 'Angels\' Share', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Jazz Club', categories: ['Men\'s', 'Niche', 'Unisex'] },
  { name: 'Beach Walk', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'Coffee Break', categories: ['Men\'s', 'Niche', 'Unisex'] },
  { name: 'When the Rain Stops', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'Under The Lemon Trees', categories: ['Niche', 'Unisex', 'Women\'s'] },
];

async function updateMultiCategories() {
  console.log('🔄 Starting multi-category updates...');
  
  let updated = 0;
  let errors = 0;

  for (const product of multiCategoryUpdates) {
    try {
      const primaryCategory = product.categories[0];
      
      // Try exact name match first
      let result = await sql`
        UPDATE products 
        SET category = ${primaryCategory}, 
            categories = ${product.categories}
        WHERE name = ${product.name}
      `;

      // If not found, try case insensitive
      if (result.count === 0) {
        result = await sql`
          UPDATE products 
          SET category = ${primaryCategory}, 
              categories = ${product.categories}
          WHERE LOWER(name) = LOWER(${product.name})
        `;
      }

      // Try common variations
      if (result.count === 0) {
        const variations = [
          product.name.replace('Sex', 'S*x'),
          product.name.replace('Fucking', 'F*cking'),
          product.name.replace('Fucking', 'F***ing'),
          product.name + ' Eau De Parfum'
        ];

        for (const variation of variations) {
          if (result.count === 0) {
            result = await sql`
              UPDATE products 
              SET category = ${primaryCategory}, 
                  categories = ${product.categories}
              WHERE LOWER(name) = LOWER(${variation})
            `;
          }
        }
      }

      if (result.count > 0) {
        updated++;
        console.log(`✅ Updated: ${product.name} -> ${product.categories.join(', ')}`);
      } else {
        console.log(`❌ Product not found: ${product.name}`);
      }

    } catch (error) {
      errors++;
      console.error(`❌ Error updating ${product.name}:`, error.message);
    }
  }

  console.log(`\n📈 Update Summary:`);
  console.log(`✅ Successfully updated: ${updated} products`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`🔄 Multi-category update completed!`);
}

updateMultiCategories().catch(console.error);