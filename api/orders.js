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
      const orders = await sql`
        SELECT * FROM orders 
        ORDER BY created_at DESC
      `;
      
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const { orderCode, totalAmount, items, customerInfo } = req.body;
      
      const [order] = await sql`
        INSERT INTO orders (order_code, total_amount, items, customer_info, status)
        VALUES (${orderCode}, ${totalAmount}, ${JSON.stringify(items)}, ${JSON.stringify(customerInfo)}, 'pending')
        RETURNING *
      `;
      
      return res.status(201).json(order);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}