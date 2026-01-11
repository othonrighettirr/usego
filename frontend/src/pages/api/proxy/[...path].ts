import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Proxy para API - evita problemas de CORS
 * Todas as chamadas para /api/proxy/* são redirecionadas para a API backend
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path || '';
  
  // URL da API backend
  const apiUrl = process.env.API_URL || 'http://api:3001';
  const targetUrl = `${apiUrl}/api/${apiPath}`;
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Passar x-api-key se presente
    if (req.headers['x-api-key']) {
      headers['x-api-key'] = req.headers['x-api-key'] as string;
    }
    
    // Passar Authorization se presente
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'] as string;
    }
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await response.json().catch(() => ({}));
    
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
}
