require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

console.log("🚀 Starting sitemap generation...");

try {
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountRaw) {
    throw new Error("❌ FIREBASE_SERVICE_ACCOUNT_KEY is missing or not loaded from .env.local");
  }

  const serviceAccount = JSON.parse(serviceAccountRaw);

// 🔥 Convert private_key from "\\n" to real newlines
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}


  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
    console.log("✅ Firebase initialized");
  }

  const db = getFirestore();

  (async () => {
    console.log("📡 Connecting to Firestore...");
    const recruitsSnapshot = await db.collection('Recruits').get();
    console.log(`📄 Found ${recruitsSnapshot.size} Recruits`);

    const baseUrl = 'https://wecruitkc.com';

    const recruitUrls = recruitsSnapshot.docs.map((doc) => {
      const id = doc.id;
      return `
  <url>
    <loc>${baseUrl}/Recruits/${id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    const staticUrls = [
      `
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
      `
  <url>
    <loc>${baseUrl}/Recruits</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join('\n')}
${recruitUrls.join('\n')}
</urlset>`;

    fs.writeFileSync('./public/sitemap.xml', sitemap.trim());
    console.log(`✅ Sitemap written to /public/sitemap.xml`);
  })();

} catch (err) {
  console.error("❌ Failed to generate sitemap:", err.message);
}
