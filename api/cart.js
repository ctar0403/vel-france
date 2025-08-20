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
    // Simple session-based cart using cookie or IP
    const sessionId = req.headers['x-session-id'] || req.connection.remoteAddress || 'anonymous';

    if (req.method === 'GET') {
      const cartItems = await sql`
        SELECT c.*, p.name, p.brand, p.price, p.image_url, p.capacity
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.session_id = ${sessionId}
        ORDER BY c.created_at DESC
      `;
      
      return res.status(200).json(cartItems);
    }

    if (req.method === 'POST') {
      const { productId, quantity = 1 } = req.body;
      
      // Check if item already exists in cart
      const [existingItem] = await sql`
        SELECT * FROM cart_items 
        WHERE session_id = ${sessionId} AND product_id = ${productId}
      `;

      if (existingItem) {
        // Update quantity
        const [updatedItem] = await sql`
          UPDATE cart_items 
          SET quantity = quantity + ${quantity}
          WHERE session_id = ${sessionId} AND product_id = ${productId}
          RETURNING *
        `;
        return res.status(200).json(updatedItem);
      } else {
        // Add new item
        const [newItem] = await sql`
          INSERT INTO cart_items (session_id, product_id, quantity)
          VALUES (${sessionId}, ${productId}, ${quantity})
          RETURNING *
        `;
        return res.status(201).json(newItem);
      }
    }

    if (req.method === 'DELETE') {
      const { productId } = req.query;
      
      await sql`
        DELETE FROM cart_items 
        WHERE session_id = ${sessionId} AND product_id = ${productId}
      `;
      
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}