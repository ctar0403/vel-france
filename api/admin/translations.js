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
    // Simple admin check
    const isAdmin = req.headers.authorization?.includes('admin') || 
                   req.body?.username?.toLowerCase() === 'giorgi';

    if (!isAdmin) {
      return res.status(401).json({ message: 'Admin access required' });
    }

    if (req.method === 'GET') {
      const translations = await sql`
        SELECT * FROM translations 
        ORDER BY key ASC
      `;
      
      return res.status(200).json(translations);
    }

    if (req.method === 'POST') {
      const { key, english, georgian } = req.body;
      
      const [translation] = await sql`
        INSERT INTO translations (id, key, english, georgian)
        VALUES (${crypto.randomUUID()}, ${key}, ${english}, ${georgian})
        ON CONFLICT (key) DO UPDATE SET
          english = EXCLUDED.english,
          georgian = EXCLUDED.georgian
        RETURNING *
      `;
      
      return res.status(200).json(translation);
    }

    if (req.method === 'PUT') {
      const { key, english, georgian } = req.body;
      
      const [translation] = await sql`
        UPDATE translations 
        SET english = ${english}, georgian = ${georgian}
        WHERE key = ${key}
        RETURNING *
      `;
      
      return res.status(200).json(translation);
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}