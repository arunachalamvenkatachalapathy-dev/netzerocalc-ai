import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const sourceHtml = path.join(rootDir, 'index.html');

console.log('Building NetZeroCalc static distribution from root...');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Clean dist/_redirects to prevent Cloudflare infinite redirect loop error
const distRedirects = path.join(distDir, '_redirects');
if (fs.existsSync(distRedirects)) {
  fs.unlinkSync(distRedirects);
}

if (fs.existsSync(sourceHtml)) {
  let htmlContent = fs.readFileSync(sourceHtml, 'utf-8');
  
  // Parse .env
  const envPath = path.join(rootDir, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) env[match[1].trim()] = match[2].trim();
    });
  }

  // Inject variables from process.env (Cloudflare) or local .env
  htmlContent = htmlContent.replace('https://nepmqpdxolisxkbbhmxn.supabase.co', process.env.SUPABASE_URL || env.SUPABASE_URL || 'https://nepmqpdxolisxkbbhmxn.supabase.co');
  htmlContent = htmlContent.replace('sb_publishable_3_jOVeUeMgKc0iIHTBXikQ_BjzeV4lE', process.env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || 'sb_publishable_3_jOVeUeMgKc0iIHTBXikQ_BjzeV4lE');
  
  htmlContent = htmlContent.replace('{{FIREBASE_API_KEY}}', process.env.FIREBASE_API_KEY || env.FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY');
  htmlContent = htmlContent.replace('{{FIREBASE_AUTH_DOMAIN}}', process.env.FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN || 'YOUR_FIREBASE_AUTH_DOMAIN');
  htmlContent = htmlContent.replace('{{FIREBASE_PROJECT_ID}}', process.env.FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || 'YOUR_FIREBASE_PROJECT_ID');
  htmlContent = htmlContent.replace('{{FIREBASE_STORAGE_BUCKET}}', process.env.FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || 'YOUR_FIREBASE_STORAGE_BUCKET');
  htmlContent = htmlContent.replace('{{FIREBASE_MESSAGING_SENDER_ID}}', process.env.FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_FIREBASE_MESSAGING_SENDER_ID');
  htmlContent = htmlContent.replace('{{FIREBASE_APP_ID}}', process.env.FIREBASE_APP_ID || env.FIREBASE_APP_ID || 'YOUR_FIREBASE_APP_ID');

  fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);
  
  const excelFile = path.join(rootDir, 'GHG_Calculator_RECTIFIED_v6.xlsx');
  if (fs.existsSync(excelFile)) {
    fs.copyFileSync(excelFile, path.join(distDir, 'GHG_Calculator_RECTIFIED_v6.xlsx'));
  }
  console.log('Successfully processed and copied index.html to dist/index.html!');
} else {
  console.error('Error: index.html not found!');
  process.exit(1);
}
