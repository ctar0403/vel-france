import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const products = await sql`
        SELECT * FROM products 
        ORDER BY name ASC
      `;
      
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const { name, description, price, brand, category, imageUrl, capacity, categories, descriptionEn, descriptionKa } = req.body;
      
      const [product] = await sql`
        INSERT INTO products (name, description, price, brand, category, image_url, capacity, categories, description_en, description_ka)
        VALUES (${name}, ${description}, ${price}, ${brand}, ${category}, ${imageUrl}, ${capacity}, ${categories}, ${descriptionEn}, ${descriptionKa})
        RETURNING *
      `;
      
      return res.status(201).json(product);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}