import fs from 'node:fs';

const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const html = fs.readFileSync('public/home-service/Html/Packages.html', 'utf8');

const clean = (value = '') =>
  String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const priceNumber = (value = '') => {
  const match = String(value).match(/\$\s*([\d,]+(?:\.\d+)?)/);
  return match ? Number(match[1].replace(/,/g, '')) : 0;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(body)}`);
  }

  return body;
};

const sectionMatches = [...html.matchAll(/<section class="package-section">([\s\S]*?)<\/section>/g)];

const rows = sectionMatches.flatMap(([, sectionHtml]) => {
  const category = clean(sectionHtml.match(/<div class="section-heading">[\s\S]*?<h2>(.*?)<\/h2>/)?.[1]);
  const categoryDescription = clean(
    sectionHtml.match(/<div class="section-heading">[\s\S]*?<p>(.*?)<\/p>/)?.[1]
  );

  const articles = [...sectionHtml.matchAll(/<article class="package-card[^"]*">([\s\S]*?)<\/article>/g)];

  return articles
    .map(([, articleHtml]) => {
      const name = clean(articleHtml.match(/<div class="package-header">[\s\S]*?<h3>(.*?)<\/h3>/)?.[1]);
      const packageDescription = clean(
        articleHtml.match(/<p class="package-subtitle">(.*?)<\/p>/)?.[1]
      );
      const price = priceNumber(articleHtml.match(/<div class="package-price">([\s\S]*?)<\/div>/)?.[1]);
      const listItems = [...articleHtml.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => clean(match[1]));

      if (!name || !packageDescription || !price || listItems.length === 0) {
        return null;
      }

      const pointItem = listItems.find((item) => /\bpoints\b/i.test(item));
      const pointMatch = pointItem?.match(/(\d[\d,]*)/);
      const point = pointMatch ? Number(pointMatch[1].replace(/,/g, '')) : null;
      const services = listItems.filter((item) => item !== pointItem);

      return {
        package_name: name,
        price: price,
        discount: 0,
        services_included: services.join('\n'),
        points: point,
        package_category: category,
        category_description: categoryDescription,
        description: packageDescription,
      };
    })
    .filter(Boolean);
});

const uniqueRows = [];
const seenNames = new Set();

for (const row of rows) {
  if (seenNames.has(row.package_name)) continue;
  seenNames.add(row.package_name);
  uniqueRows.push(row);
}

console.log(`Extracted package rows: ${rows.length}`);
console.log(`Unique package rows: ${uniqueRows.length}`);

const inserted = await request('/rest/v1/packages?on_conflict=package_name', {
  method: 'POST',
  headers: {
    Prefer: 'return=representation,resolution=merge-duplicates',
  },
  body: JSON.stringify(uniqueRows),
});

console.log(`Upserted package rows: ${inserted.length}`);

const finalRows = await request(
  '/rest/v1/packages?select=package_name,price,discount,services_included,points,package_category,category_description,description&order=package_name.asc'
);

console.log(`Final package row count: ${finalRows.length}`);
console.log(JSON.stringify(finalRows, null, 2));