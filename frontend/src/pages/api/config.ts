import type { NextApiRequest, NextApiResponse } from 'next';

// Esta API route roda no servidor e tem acesso às variáveis de ambiente
// NÃO expor dados sensíveis como email/senha
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '',
  });
}
