// Test script to debug CustomerProfile loading issue
// Run this in browser console after logging in

const SUPABASE_URL = window.SUPABASE_URL;
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

async function testCustomerProfile() {
  console.log('=== Testing Customer Profile ===');
  
  // 1. Check localStorage
  const authUser = localStorage.getItem('hsAuthUser');
  console.log('1. localStorage hsAuthUser:', authUser);
  
  if (!authUser) {
    console.error('❌ No user in localStorage. Please login first.');
    return;
  }
  
  const user = JSON.parse(authUser);
  console.log('✅ User found:', user);
  
  // 2. Try to fetch customer data
  console.log('2. Fetching customer with email:', user.email);
  
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/customers?select=*&email=eq.${encodeURIComponent(user.email)}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('3. Customer data received:', data);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ No customer found with email:', user.email);
      console.log('Trying to fetch all customers to see what exists...');
      
      const allCustomers = await fetch(
        `${SUPABASE_URL}/rest/v1/customers?select=*`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      
      if (allCustomers.ok) {
        const allData = await allCustomers.json();
        console.log('All customers in database:', allData);
        console.log('Total customers:', allData.length);
      }
    } else {
      console.log('✅ Customer found!');
      console.log('Customer details:', data[0]);
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error);
  }
}

// Run the test
testCustomerProfile();
