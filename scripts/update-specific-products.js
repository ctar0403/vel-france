import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Based on common fragrance categorizations and CSV data patterns, these are high-value multi-category products
const multiCategoryProducts = [
  // Unisex luxury/niche fragrances that appeal to all genders
  { name: 'Sauvage', categories: ['Men\'s', 'Unisex'] },
  { name: 'Sauvage Elixir', categories: ['Men\'s', 'Niche', 'Unisex'] },
  { name: 'Oud Wood', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  { name: 'Bitter Peach', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  { name: 'Vanilla S*x', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  { name: 'F*cking Fabulous', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  { name: 'Phantom', categories: ['Men\'s', 'Unisex'] },
  { name: 'Red Tobacco', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Baccarat Rouge 540 Eau De Parfum', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Baccarat Rouge 540 Extrait De Parfum', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Oud Satin Mood', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Black Afgano', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  
  // Tom Ford unisex collection
  { name: 'Lost Cherry', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  { name: 'Tobacco Vanille', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Rose Prick', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  { name: 'Vanille Fatale', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  { name: 'Ombre Leather', categories: ['Men\'s', 'Unisex', 'Women\'s'] },
  { name: 'Soleil Blanc', categories: ['Unisex', 'Women\'s'] },
  { name: 'Tuscan Leather', categories: ['Men\'s', 'Niche', 'Unisex'] },
  
  // Niche unisex fragrances
  { name: 'Black Phantom', categories: ['Men\'s', 'Niche', 'Unisex'] },
  { name: 'Angels\' Share', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Jazz Club', categories: ['Men\'s', 'Niche', 'Unisex'] },
  { name: 'Beach Walk', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'Coffee Break', categories: ['Men\'s', 'Niche', 'Unisex'] },
  { name: 'When the Rain Stops', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'Under The Lemon Trees', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'Whispers in the Library', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'Bubble Bath', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'Flower Market', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'Fireplace', categories: ['Men\'s', 'Niche', 'Unisex'] },
  
  // Byredo unisex collection
  { name: 'Black Saffron', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Blanche', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'Vanille Antique', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Super Cedar', categories: ['Men\'s', 'Niche', 'Unisex'] },
  
  // Creed unisex lines
  { name: 'Aventus', categories: ['Men\'s', 'Niche', 'Unisex'] },
  { name: 'Viking', categories: ['Men\'s', 'Niche', 'Unisex'] },
  { name: 'Wind Flowers', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'Queen Of Silk', categories: ['Niche', 'Women\'s'] },
  
  // Niche/luxury unisex brands
  { name: 'Tilia', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'Ganymede', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'XV Salvia Blu', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'V Lauro', categories: ['Men\'s', 'Niche', 'Unisex', 'Women\'s'] },
  { name: 'VII Lilla', categories: ['Niche', 'Unisex', 'Women\'s'] },
  { name: 'IX Violetta', categories: ['Niche', 'Women\'s'] },
  
  // Women's fragrances that could appeal to unisex
  { name: 'Miss Dior (EDP)', categories: ['Women\'s'] },
  { name: 'J\'adore', categories: ['Women\'s'] },
  { name: 'Chance Eau Tendre', categories: ['Women\'s'] },
  { name: 'Good Girl', categories: ['Women\'s', 'Niche'] },
  { name: 'Very Good Girl', categories: ['Women\'s', 'Niche'] },
  { name: 'Si', categories: ['Women\'s'] },
  { name: 'Si Intense', categories: ['Women\'s'] },
  { name: 'Si Passione', categories: ['Women\'s'] },
  
  // Men's classics that could be unisex
  { name: 'Bleu de Chanel', categories: ['Men\'s', 'Unisex'] },
  { name: 'Allure Homme Sport', categories: ['Men\'s', 'Unisex'] },
  { name: 'Acqua Di Gio', categories: ['Men\'s', 'Unisex'] },
  { name: 'Code', categories: ['Men\'s'] },
  { name: 'Stronger With You', categories: ['Men\'s'] },
];

async function updateSpecificProducts() {
  console.log('🔄 Starting targeted multi-category updates...');
  
  let updated = 0;
  let notFound = 0;
  let errors = 0;

  for (const product of multiCategoryProducts) {
    try {
      const primaryCategory = product.categories[0];
      
      // Update product with categories
      const result = await sql`
        UPDATE products 
        SET category = ${primaryCategory}, 
            categories = ${product.categories}
        WHERE name = ${product.name}
      `;

      if (result.count > 0) {
        updated++;
        console.log(`✅ Updated: ${product.name} -> [${product.categories.join(', ')}]`);
      } else {
        notFound++;
        console.log(`❌ Product not found: ${product.name}`);
      }

    } catch (error) {
      errors++;
      console.error(`❌ Error updating ${product.name}:`, error.message);
    }
  }

  console.log(`\n📈 Update Summary:`);
  console.log(`✅ Successfully updated: ${updated} products`);
  console.log(`❌ Products not found: ${notFound}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`🔄 Targeted multi-category update completed!`);
  
  return { updated, notFound, errors };
}

updateSpecificProducts().catch(console.error);