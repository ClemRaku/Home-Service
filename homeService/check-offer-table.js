const SUPABASE_URL = 'https://erqqqovdprgpfgmueevj.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycXFxb3ZkcHJncGZnbXVlZXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzU2NTIsImV4cCI6MjA4NzAxMTY1Mn0.fnXv6X6v8MAn2tusVwIZmfQTaUXDkyAX6mYoYW8RD9o';

const checkOfferTable = async () => {
  try {
    console.log('Fetching Offer table data...\n');
    
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/Offer?limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log('⚠️  No data in Offer table or table does not exist');
      return;
    }

    const firstOffer = data[0];
    console.log('✅ Offer table exists! Here are the columns:\n');
    console.log('Column Name | Sample Value');
    console.log('─'.repeat(50));
    
    Object.entries(firstOffer).forEach(([key, value]) => {
      console.log(`${key.padEnd(30)} | ${String(value).substring(0, 30)}`);
    });

    console.log('\n\n📊 Full first record:');
    console.log(JSON.stringify(firstOffer, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

checkOfferTable();
