#!/usr/bin/env node
/**
 * Script to import scanned translations into the database
 */

import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function importTranslations() {
  try {
    console.log('Reading scanned translations...');
    const translations = JSON.parse(fs.readFileSync('translations-scan-result.json', 'utf8'));
    
    console.log(`Found ${translations.length} translations to import`);
    
    const client = await pool.connect();
    
    let imported = 0;
    let updated = 0;
    
    console.log('Starting import...');
    
    for (const translation of translations) {
      try {
        // Try to insert new translation
        const insertResult = await client.query(
          'INSERT INTO translations (key, english_text, georgian_text) VALUES ($1, $2, $3) RETURNING id',
          [translation.key, translation.englishText, '']
        );
        imported++;
      } catch (error) {
        // If key exists, update the English text
        if (error.code === '23505') { // unique_violation
          await client.query(
            'UPDATE translations SET english_text = $2, updated_at = NOW() WHERE key = $1',
            [translation.key, translation.englishText]
          );
          updated++;
        } else {
          console.error(`Error processing translation ${translation.key}:`, error.message);
        }
      }
    }
    
    client.release();
    
    console.log(`\nImport completed:`);
    console.log(`- New translations imported: ${imported}`);
    console.log(`- Existing translations updated: ${updated}`);
    console.log(`- Total processed: ${imported + updated}`);
    
  } catch (error) {
    console.error('Error importing translations:', error);
  } finally {
    await pool.end();
  }
}

importTranslations();