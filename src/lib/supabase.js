import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn('Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (ou nas Environment Variables da Vercel).');
}

// Usamos uma URL placeholder válida quando as variáveis não estão setadas,
// pra createClient não travar a aplicação inteira (tela branca). As chamadas
// vão falhar normalmente e cair no modo "offline" (dados de demonstração).
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-anon-key'
);
