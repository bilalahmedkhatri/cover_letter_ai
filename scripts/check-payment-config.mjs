import { readdir, readFile } from 'node:fs/promises';
import { paymentConfig } from '../server/payments/nowpayments.mjs';
const config = paymentConfig();
const credentials = ['NOWPAYMENT_API_KEY', 'NOWPAYMENT_IPN_KEY', 'NOWPAYMENT_PUBLIC_KEY', 'NOWPAYMENTS_API_KEY', 'NOWPAYMENTS_IPN_SECRET', 'DATABASE_URL', 'DATABASE_URL_UNPOOLED'];
const files = (await readdir('dist/assets')).filter(name => name.endsWith('.js'));
const bundled = (await Promise.all(files.map(file => readFile('dist/assets/' + file, 'utf8')))).join('\n');
const exposed = credentials.filter(name => process.env[name]?.length >= 8 && bundled.includes(process.env[name]));
console.log(JSON.stringify({
  apiKeyConfigured: Boolean(config.apiKey), ipnSecretConfigured: Boolean(config.ipnKey),
  durableStorageConfigured: Boolean(process.env.DATABASE_URL),
  checkoutEnabled: config.enabled, sandbox: config.sandbox,
  paymentSecretsInClientBundle: exposed.length > 0,
}));
if (exposed.length) process.exitCode = 1;
