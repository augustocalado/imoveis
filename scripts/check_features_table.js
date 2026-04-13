require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-client');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTable() {
    const { error } = await supabase.from('property_features').select('*').limit(1);
    if (error) {
        console.log('property_features table does NOT exist:', error.message);
    } else {
        console.log('property_features table EXISTS');
    }
}

checkTable();
