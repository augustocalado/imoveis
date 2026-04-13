require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-client');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkLeads() {
    const { data, error } = await supabase.from('leads').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Columns in leads table:', Object.keys(data[0] || {}));
    }
}

checkLeads();
