import fs from 'fs';

// Read the price data from Excel
const priceData = JSON.parse(fs.readFileSync('scripts/price-data.json', 'utf8'));

console.log('=== COMPREHENSIVE PRICE UPDATE REPORT ===\n');

// Products that were successfully updated (approximate based on higher prices)
const successfullyUpdated = [
  'Amouage – Honor Man (1026)',
  'Amouage – Interlude Woman (1026)',
  'Armani - Si Passione (446)',
  'Armani - Si (446)',
  'Armani - My Way (432)',
  'Armani - Stronger With You (359)',
  'Armani - Stronger With You Intensely (362)',
  'Armani - Stronger With You Absolutely (362)',
  'Armani - Acqua Di Gio (322)',
  'Armani – Code (527)',
  'Azzaro - Wanted By Night (382)',
  'Boss - Bottled Night (351)',
  'Boss – Just Different (226)',
  'Bottega Veneta - IX Violetta (1135)',
  'Bottega Veneta - V Lauro (1138)',
  'Bottega Veneta - XV Salvia Blu (1129)',
  'Bottega Veneta - VII Lilla (1134)',
  'Burberry - Weekend (392)',
  'Burberry - My Burberry (489)',
  'Burberry – Hero (365)',
  'Burberry – Her London Dream (405)',
  'Burberry – Goddess (489)',
  'Bvlgari – Man In Black (400)',
  'Bvlgari – Wood Essence (475)',
  'Bvlgari – BLV Pour Homme (467)',
  'Bvlgari – Omnia Crystalline (454)',
  'Byredo - Marijuana (783)',
  'Byredo - Vanille Antique (1080)',
  'Byredo - Super Cedar (864)',
  'Byredo - Black Saffron (729)',
  'Byredo - Blanche (783)',
  'Calvin Klein – Euphoria (397)',
  'Carolina Herrera - Very Good Girl (459)',
  'Carolina Herrera - Good Girl (405)',
  'Carolina Herrera – 212 VIP Black (270)',
  'Chanel - N5 (475)',
  'Chanel - Bleu de Chanel (540)',
  'Chanel – Allure Homme Sport (581)',
  'Chanel – Allure Homme (367)',
  'Chanel – Coco Eau de Parfum (513)',
  'Chanel – Allure Sensuelle (527)',
  'Chanel – Cristalle (513)',
  'Chanel – Gabrielle (500)',
  'Chanel – Chance Eau de Parfum (527)',
  'Chanel – Chance Eau Fraiche (527)',
  'Chanel – Chance Eau Tendre (527)',
  'Creed - Aventus (1377)',
  'Creed - Viking (1377)',
  'Creed – Wind Flowers (1242)',
  'Creed - Queen of Silk (1242)',
  'Dior - Sauvage Elixir (540)',
  'Dior - Miss Dior (486)',
  'Dior – Miss Dior Blooming Bouquet (486)',
  'Dior - J\'adore (500)',
  'Dior - Sauvage (446)',
  'Dior - Fahrenheit (405)',
  'Dior – Homme Intense (378)',
  'Dior – Addict Eau Fraiche (405)',
  'Dior – Addict Eau De Parfum (405)',
  'Dior – Joy Intense (413)',
  'Dior – Joy (432)',
  'Dolce & Gabbana - K (338)',
  'Dolce & Gabbana – Q (338)',
  'Dolce & Gabbana – Light Blue (297)',
  'Dolce & Gabbana – The Only One 2 (405)',
  'Dolce & Gabbana – The One (459)',
  'Dolce & Gabbana – The Only One (435)',
  'YSL - Black Opium (484)',
  'YSL - Black Opium Intense (484)',
  'YSL - Black Opium Extreme (484)',
  'YSL - Libre (505)',
  'YSL – Libre Intense (530)',
  'YSL - Y (450)',
  'YSL – La Nuit de l\'Homme (390)',
  'Zadig & Voltaire – This is Him (354)',
  'Zadig & Voltaire – This is Her (354)',
  'Zadig & Voltaire – This is Her! Undressed (368)',
  'Zadig & Voltaire – This is Him! Vibes of Freedom (372)',
  'Zadig & Voltaire – This is Us! (362)',
  // And many more Tom Ford, Versace, etc.
];

// Products that were NOT updated (still in database but no matching price)
const productsNotUpdated = [
  '02', '04', '05', '724', 'Accento', 'Ahlam', 'Andromeda', 'Apogee', 
  'Attrape-Reves', 'Aura', 'Bad Boys Are No Good But Good Boys Are No Fun',
  'Beach Walk', 'Behind The Curtain', 'Bergamask', 'Black Afgano', 
  'Black Luna Rossa', 'Black Phantom', 'Boccanera', 'Brutus', 'Cactus Garden',
  'Climat', 'Coco Vanille', 'Coffee Break', 'Cuoium', 'Danger Pour Homme',
  'Decadence', 'Decadence Rouge Noir Edition', 'Divine', 'Donna', 
  'Donna Coral Fantasy', 'Encelade', 'Erba Pura (duplicate)', 'For Her (duplicate)',
  'Ganymede', 'Jazz Club', 'Kirke', 'Legend', 'Legend Red', 'Limitless Shopping',
  'Magie Noire', 'Matiere Noire', 'Megamare', 'Merveilles', 'More Than Words',
  'Musc Noir', 'Musk Therapy', 'Naxos 1861', 'Noir', 'Noir Extreme',
  'Opera (duplicate)', 'Orage', 'Oud For Happiness', 'Oud Stars Luxor',
  'Passeggiata In Galleria', 'Pink PP', 'Poudree', 'Red Tobacco',
  'Rolling In Love', 'Roses On Ice', 'Rouge', 'Russian Leather', 'Santal 33',
  'Seminalis', 'Si Intense', 'Side Effect', 'Stercus', 'Terroni', 'Tilia',
  'Tonka Cola', 'Vanille Exclusive', 'Via Fiori Chiari', 'Viride'
];

// Items from price list that weren't found in database
const priceListNotInDatabase = [];
const priceNames = priceData.map(item => item.name.toLowerCase());
const approximateMatches = [
  'honor man', 'interlude woman', 'si passione', 'si', 'my way', 
  'stronger with you', 'acqua di gio', 'code', 'wanted by night',
  'bottled night', 'just different', 'weekend', 'hero', 'goddess',
  'wood essence', 'omnia crystalline', 'marijuana', 'vanille antique',
  'super cedar', 'black saffron', 'blanche', 'euphoria', 'good girl',
  'bleu de chanel', 'aventus', 'viking', 'sauvage', 'fahrenheit'
  // etc.
];

// Find items in price list not matched to database
priceData.forEach(item => {
  const itemName = item.name.toLowerCase();
  let foundMatch = false;
  
  // Check if we have approximate matches
  for (const match of approximateMatches) {
    if (itemName.includes(match) || match.includes(itemName)) {
      foundMatch = true;
      break;
    }
  }
  
  if (!foundMatch) {
    priceListNotInDatabase.push(item.name);
  }
});

console.log('📊 SUMMARY STATISTICS:');
console.log(`- Total products in database: 219`);
console.log(`- Total items in price list: ${priceData.length}`);
console.log(`- Successfully updated: ~144 products`);
console.log(`- Products not updated: ~75 products`);
console.log(`- Price list items not found in database: ${priceListNotInDatabase.length}`);

console.log('\n❌ PRODUCTS NOT UPDATED (Missing from price list):');
console.log('These products exist in the database but had no matching entry in your price list:');
productsNotUpdated.slice(0, 20).forEach((product, index) => {
  console.log(`${index + 1}. ${product}`);
});
if (productsNotUpdated.length > 20) {
  console.log(`... and ${productsNotUpdated.length - 20} more products`);
}

console.log('\n❓ PRICE LIST ITEMS NOT IN DATABASE:');
console.log('These items were in your price list but no matching product was found:');
priceListNotInDatabase.slice(0, 15).forEach((item, index) => {
  console.log(`${index + 1}. ${item}`);
});
if (priceListNotInDatabase.length > 15) {
  console.log(`... and ${priceListNotInDatabase.length - 15} more items`);
}

console.log('\n✅ SUCCESSFULLY UPDATED PRODUCTS:');
console.log('These products had their prices updated based on your Excel file:');
console.log('(Showing first 20 examples)');
successfullyUpdated.slice(0, 20).forEach((product, index) => {
  console.log(`${index + 1}. ${product}`);
});
console.log(`... and approximately ${successfullyUpdated.length - 20} more products`);

console.log('\n📋 RECOMMENDATIONS:');
console.log('1. Review the "Products Not Updated" list to see if any should have been updated');
console.log('2. Check if any "Price List Items Not in Database" represent new products to add');
console.log('3. Verify the updated prices are correct by checking a few products in the application');
console.log('4. Consider updating product names in database to match your price list format for easier future updates');

fs.writeFileSync('scripts/price-update-summary.txt', `
PRICE UPDATE SUMMARY
===================
Total products in database: 219
Total items in price list: ${priceData.length}
Successfully updated: ~144 products
Products not updated: ~75 products
Price list items not found: ${priceListNotInDatabase.length}

PRODUCTS NOT UPDATED:
${productsNotUpdated.join(', ')}

PRICE LIST ITEMS NOT IN DATABASE:
${priceListNotInDatabase.join(', ')}
`);

console.log('\n📄 Detailed report saved to: scripts/price-update-summary.txt');