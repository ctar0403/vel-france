import XLSX from 'xlsx';
import fs from 'fs';

// Read the Excel file
const workbook = XLSX.readFile('attached_assets/price_1753806194236.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Price list data:');
console.log(JSON.stringify(data, null, 2));

// Also save to a JSON file for easy access
fs.writeFileSync('scripts/price-data.json', JSON.stringify(data, null, 2));
console.log('\nPrice data saved to scripts/price-data.json');