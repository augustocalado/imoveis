require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTables() {
    const { data, error } = await supabase
        .from('properties')
        .select('id')
        .limit(1);

    console.log('Testing connection...');
    if (error) {
        console.error('Error connecting:', error);
    } else {
        console.log('Connected to Supabase');
    }

    // Check if blog table exists by trying to select from it
    const { error: blogError } = await supabase.from('blog_posts').select('*').limit(1);
    if (blogError) {
        console.log('blog_posts table probably does NOT exist:', blogError.message);
    } else {
        console.log('blog_posts table EXISTS');
    }
}

checkTables();
