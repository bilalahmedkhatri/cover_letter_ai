import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
config({ path: '.env.local', quiet: true });
const [command, id] = process.argv.slice(2);
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const sql = neon(process.env.DATABASE_URL);
if (command === 'list') {
  const rows = await sql.query("SELECT id,display_name,rating,content,created_at FROM app.reviews WHERE status='pending' AND publish_consent=true ORDER BY created_at LIMIT 100");
  console.log(JSON.stringify(rows, null, 2));
} else if (['publish', 'reject'].includes(command) && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '')) {
  const rows = await sql.query("UPDATE app.reviews SET status=$1,updated_at=now() WHERE id=$2 AND publish_consent=true RETURNING id,status", [command === 'publish' ? 'published' : 'rejected', id]);
  if (!rows.length) throw new Error('Consented review not found.');
  console.log(JSON.stringify(rows));
} else {
  throw new Error('Usage: npm run reviews -- list | publish REVIEW_UUID | reject REVIEW_UUID');
}
