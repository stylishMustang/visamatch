import type { NextApiRequest, NextApiResponse } from 'next';
import { matchAndInsertJobs } from '@/lib/jobSync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const role = req.query.role;

  if (!role || typeof role !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid role' });
  }
  console.log('🔍 Incoming request query:', req.query);
  try {
    await matchAndInsertJobs(role);
    return res.status(200).json({ message: `✅ Jobs fetched for ${role}` });
  } catch (error) {
    console.error('❌ Error in API route:', error);
    return res.status(500).json({ error: 'Failed to fetch and insert jobs' });
  }
}
