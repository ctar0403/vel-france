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
    // Simple admin check - in production use proper JWT validation
    const isAdmin = req.headers.authorization?.includes('admin') || 
                   req.body?.username?.toLowerCase() === 'giorgi';

    if (!isAdmin) {
      return res.status(401).json({ message: 'Admin access required' });
    }

    if (req.method === 'GET') {
      const products = await sql`
        SELECT * FROM products 
        ORDER BY created_at DESC
      `;
      
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const { name, description, price, brand, category, imageUrl, capacity, categories, descriptionEn, descriptionKa } = req.body;
      
      const [product] = await sql`
        INSERT INTO products (id, name, description, price, brand, category, image_url, capacity, categories, description_en, description_ka)
        VALUES (${crypto.randomUUID()}, ${name}, ${description}, ${price}, ${brand}, ${category}, ${imageUrl}, ${capacity}, ${JSON.stringify(categories)}, ${descriptionEn}, ${descriptionKa})
        RETURNING *
      `;
      
      return res.status(201).json(product);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { name, description, price, brand, category, imageUrl, capacity, categories, descriptionEn, descriptionKa } = req.body;
      
      const [product] = await sql`
        UPDATE products 
        SET name = ${name}, description = ${description}, price = ${price}, 
            brand = ${brand}, category = ${category}, image_url = ${imageUrl}, 
            capacity = ${capacity}, categories = ${JSON.stringify(categories)},
            description_en = ${descriptionEn}, description_ka = ${descriptionKa}
        WHERE id = ${id}
        RETURNING *
      `;
      
      return res.status(200).json(product);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      // Delete related cart items first
      await sql`DELETE FROM cart_items WHERE product_id = ${id}`;
      
      // Delete the product
      await sql`DELETE FROM products WHERE id = ${id}`;
      
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}