import fs from 'node:fs';

const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const html = fs.readFileSync('public/home-service/Html/Services.html', 'utf8');
const cards = [...html.matchAll(/<article class="card">([\s\S]*?)<\/article>/g)].map((m) => m[1]);

const clean = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const averageNumber = (value = '') => {
  const text = clean(value).toLowerCase();
  const numbers = [...text.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));

  if (numbers.length) {
    return Math.round(numbers.reduce((sum, n) => sum + n, 0) / numbers.length);
  }

  if (text.includes('per day')) return 1;
  return 0;
};

const rows = cards
  .map((card) => {
    const name = card.match(/<h3>(.*?)<\/h3>/s)?.[1];
    const category = card.match(/<p>(.*?)<\/p>/s)?.[1];
    const point = card.match(/<span class="stars">\s*★\s*(\d+)\s*<\/span>/s)?.[1];
    const values = [...card.matchAll(/<span class="value">(.*?)<\/span>/gs)].map((m) => m[1]);

    if (!name || !category || !point || values.length < 2) return null;

    return {
      'Service Name': clean(name),
      Category: clean(category).replace(/\.+$/, ''),
      Price: averageNumber(values[0]),
      Duration: averageNumber(values[1]),
      Point: Number(point),
    };
  })
  .filter(Boolean);

const uniqueRows = [];
const seenServiceNames = new Set();

for (const row of rows) {
  const serviceName = row['Service Name'];
  if (seenServiceNames.has(serviceName)) continue;
  seenServiceNames.add(serviceName);
  uniqueRows.push(row);
}

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

const keyOf = (row) =>
  JSON.stringify([
    row['Service Name'],
    row.Category,
    Number(row.Price),
    Number(row.Duration),
    Number(row.Point),
  ]);

const existing = await request('/rest/v1/Service?select=Service%20Name,Category,Price,Duration,Point');
const existingKeys = new Set(existing.map(keyOf));
const missing = uniqueRows.filter((row) => !existingKeys.has(keyOf(row)));

console.log(`Extracted rows: ${rows.length}`);
console.log(`Unique rows: ${uniqueRows.length}`);
console.log(`Existing rows: ${existing.length}`);
console.log(`Missing rows: ${missing.length}`);

if (missing.length) {
  const inserted = await request('/rest/v1/Service', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify(missing),
  });

  console.log(`Inserted rows: ${inserted.length}`);
}

const finalRows = await request('/rest/v1/Service?select=Service%20Name,Category,Price,Duration,Point');
console.log(`Final row count: ${finalRows.length}`);
console.log(`First row: ${JSON.stringify(finalRows[0])}`);
console.log(`Last row: ${JSON.stringify(finalRows[finalRows.length - 1])}`);