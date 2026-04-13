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
  city: string = 'Praia Grande'
): string {
  // Extrai o tipo do imóvel (primeira palavra do título, ex: "Casa", "Apartamento")
  const type = title.trim().split(' ')[0] || 'imovel';
  
  // Combina: tipo-bairro-cidade
  const rawBase = `${type} ${neighborhood} ${city}`;
  const slugified = slugify(rawBase);
  
  // Limita a no máximo 5 "palavras" (partes separadas por hífen)
  const parts = slugified.split('-').slice(0, 5);
  
  return parts.join('-');
}
