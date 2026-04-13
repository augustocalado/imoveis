
const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectRow() {
    const { data, error } = await supabase.from('properties').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    console.log('Inspecting property row:', JSON.stringify(data[0], null, 2));
}

inspectRow();
