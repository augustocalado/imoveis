# Plano de Correção Revisado

## 1. Formulário de Captura de Lead (WhatsApp do Cliente)
* Na página do imóvel (`src/app/imovel/[slug]/page.tsx`), substituir o link direto para WhatsApp por um formulário.
* O formulário deve conter um campo para o cliente digitar seu WhatsApp e um botão "Estou Interessado".
* Ao clicar, os dados devem ser enviados para a tabela `leads` no Supabase.

## 2. Exibição de Características na Home
* Modificar o card de imóvel no `src/app/page.tsx`.
* Adicionar uma pequena lista ou ícones das principais características (amenities) cadastradas no admin.

## 3. Reversão de Fonte e Fix de Encoding
* Finalizar a remoção do `Outfit` e garantir UTF-8 sem BOM em todos os arquivos.
* Garantir que as acentuações portuguesas estejam corretas.
