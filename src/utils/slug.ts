/**
 * Gera um slug amigável seguindo as regras:
 * - tipo + bairro + cidade
 * - tudo minúsculo
 * - sem acentos
 * - hífens no lugar de espaços
 * - limite de 5 palavras
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function generatePropertyFriendlySlug(
  title: string,
  neighborhood: string,
  city: string = 'Praia Grande',
  rooms: number | string = 0
): string {
  // Extrai o tipo do imóvel (primeira palavra do título, ex: "Casa", "Apartamento")
  const type = title.trim().split(' ')[0] || 'imovel';
  
  // Formata o texto de quartos
  const roomsText = rooms && Number(rooms) > 0 ? `${rooms}-dormitorios` : '';
  
  // Combina: tipo + quartos + bairro + cidade
  const parts = [type, roomsText, neighborhood, city].filter(Boolean);
  const rawBase = parts.join(' ');
  
  const slugified = slugify(rawBase);
  
  // Aumentamos o limite para 10 palavras para acomodar o slug mais longo e descritivo
  return slugified.split('-').slice(0, 10).join('-');
}

