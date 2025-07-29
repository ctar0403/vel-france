import fs from 'fs';

// Read the price data
const priceData = JSON.parse(fs.readFileSync('scripts/price-data.json', 'utf8'));

console.log('=== PRICE UPDATE ANALYSIS ===\n');

// Create SQL update statements
const updateStatements = [];
const notFoundItems = [];

// Mapping of variations found in database vs price list
const nameMapping = {
  // Armani variations
  'armani – si passione': 'armani - si passione',
  'armani – si': 'armani - si (black)',
  'armani – my way intense': 'armani - my way',
  'armani – stronger with you': 'armani - stronger with you',
  'armani – stronger with you intensely': 'armani - stronger with you intensely',
  'armani – stronger with you absolutely': 'armani - stronger with you absolutely',
  'armani – acqua di gio': 'armani - acqua di gio',
  'armani – code': 'armani – code',
  
  // Azzaro
  'azzaro – wanted by night': 'azzaro - wanted by night',
  
  // Boss
  'boss – bottled night': 'boss - bottled night',
  'boss – just different': 'boss – just different',
  
  // Bottega Veneta
  'bottega veneta – ix violetta': 'bottega veneta - ix violetta',
  'bottega veneta – v lauro': 'bottega veneta - v lauro',
  'bottega veneta – xv salvia blu': 'bottega veneta - xv salvia blu',
  'bottega veneta – vii lilla': 'bottega veneta - vii lilla',
  
  // Burberry
  'burberry – weekend': 'burberry - weekend',
  'burberry – my burberry': 'burberry - my',
  'burberry – hero': 'burberry – hero',
  'burberry – her london dream': 'burberry – her london dream',
  'burberry – goddess': 'burberry – goddess',
  
  // Bvlgari
  'bvlgari – man in black': 'bvlgari – man in black',
  'bvlgari – wood essence': 'bvlgari – wood essence',
  'bvlgari – blv pour homme': 'bvlgari – blv pour homme',
  'bvlgari – omnia crystalline': 'bvlgari – omnia crystalline',
  
  // Byredo
  'byredo – marijuana': 'byredo - marijuana',
  'byredo – vanille antique': 'byredo - vanille antique',
  'byredo – super cedar': 'byredo - super cedar',
  'byredo – black saffron': 'byredo – black saffron',
  'byredo – blanche': 'byredo – blanche',
  
  // Calvin Klein
  'calvin klein – euphoria': 'calvin klein – euphoria',
  
  // Carolina Herrera
  'carolina herrera – very good girl': 'carolina herrera - very good girl',
  'carolina herrera – good girl': 'carolina herrera - good girl',
  'carolina herrera – 212 vip black': 'carolina herrera – 212 vip black',
  
  // Chanel
  'chanel – n5': 'chanel - n5',
  'chanel – bleu de chanel': 'chanel – bleu de chanel',
  'chanel – chance eau fraiche': 'chanel – chance eau fraiche',
  'chanel – chance eau tendre': 'chanel – chance eau tendre',
  'chanel – chance eau de parfum': 'chanel – chance eau de parfum',
  'chanel – coco eau de parfum': 'chanel – coco eau de parfum',
  'chanel – cristalle': 'chanel – cristalle',
  'chanel – gabrielle': 'chanel – gabrielle',
  'chanel – allure homme': 'chanel – allure homme',
  'chanel – allure homme sport': 'chanel – allure homme sport',
  'chanel – allure sensuelle': 'chanel – allure sensuelle'
};

// Process price updates
for (const item of priceData) {
  const priceName = item.name.toLowerCase();
  let sqlUpdate = null;
  
  // Direct name match
  sqlUpdate = `UPDATE products SET price = '${item.price}' WHERE LOWER(name) = '${priceName.replace(/'/g, "''")}';`;
  updateStatements.push({
    sql: sqlUpdate,
    name: item.name,
    price: item.price
  });
}

console.log(`Generated ${updateStatements.length} update statements\n`);

// Write all SQL statements to a file
const sqlContent = updateStatements.map(stmt => stmt.sql).join('\n');
fs.writeFileSync('scripts/price-updates.sql', sqlContent);

// Also create summary
const summary = `-- Price Update Summary
-- Total updates: ${updateStatements.length}
-- Generated on: ${new Date().toISOString()}

${sqlContent}`;

fs.writeFileSync('scripts/price-updates-with-summary.sql', summary);

console.log('SQL files generated:');
console.log('- scripts/price-updates.sql');
console.log('- scripts/price-updates-with-summary.sql');

console.log('\nNext steps:');
console.log('1. Review the generated SQL file');
console.log('2. Execute the SQL updates');
console.log('3. Check for products that were not updated');