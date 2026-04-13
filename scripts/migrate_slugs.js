const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fuoipsehqjnpafhqjnyo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_publishable_x5DJuL2prE1IUefCyXR-Gw_ctmw28hw'; // Anon Key for now, will try update

/**
 * Nota: Como não tenho a Service Role Key, tentaremos usar a Anon Key.
 * Se houver RLS, o script falhará no update, mas o Frontend já está
 * preparado com o redirecionamento fallback.
 */

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function generatePropertyFriendlySlug(title, neighborhood, city = 'Praia Grande') {
  const type = title.trim().split(' ')[0] || 'imovel';
  const rawBase = `${type} ${neighborhood} ${city}`;
  const slugified = slugify(rawBase);
  const parts = slugified.split('-').slice(0, 5);
  return parts.join('-');
}

async function migrateSlugs() {
  console.log('--- Iniciando Migração de Slugs ---');
  
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, title, neighborhood, city, reference_id, slug')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar imóveis:', error.message);
    return;
  }

  console.log(`Encontrados ${properties.length} imóveis.`);
  
  const slugMap = new Map();
  const updates = [];

  for (const prop of properties) {
    let baseSlug = generatePropertyFriendlySlug(
      prop.title || 'Imovel',
      prop.neighborhood || 'Bairro',
      prop.city || 'Cidade'
    );

    let finalSlug = baseSlug;
    let counter = 1;

    while (slugMap.has(finalSlug)) {
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
    }
    
    slugMap.set(finalSlug, prop.id);
    
    if (prop.slug !== finalSlug) {
      updates.push({ id: prop.id, slug: finalSlug });
    }
  }

  console.log(`\nPreparado para atualizar ${updates.length} imóveis.\n`);

  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('properties')
      .update({ slug: update.slug })
      .eq('id', update.id);
    
    if (updateError) {
      console.error(`Erro ao atualizar ID ${update.id}:`, updateError.message);
      // Se falhar o primeiro, provavelmente é RLS. Paramos por aqui.
      break;
    } else {
      console.log(`ID: ${update.id} -> ${update.slug} OK`);
    }
  }

  console.log('\n--- Migração Encerrada ---');
}

migrateSlugs();
