const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fuoipsehqjnpafhqjnyo.supabase.co';
const supabaseKey = 'sb_publishable_x5DJuL2prE1IUefCyXR-Gw_ctmw28hw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Verificando URLs de Imagens ---');
  
  const { data: props } = await supabase.from('properties').select('images').limit(5);
  console.log('\nImóveis:');
  props?.forEach((p, i) => {
    console.log(`[${i}] ${p.images?.[0]}`);
  });

  const { data: posts } = await supabase.from('blog_posts').select('image_url').limit(5);
  console.log('\nBlog:');
  posts?.forEach((p, i) => {
    console.log(`[${i}] ${p.image_url}`);
  });
}

check();
