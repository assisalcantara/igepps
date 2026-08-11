// Helper central para dados do sistema EDEP com cliente Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmlwgvrtissssknqpvbg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_pzruGEyBH8jSASxvcE1W2w_ROYOT62o';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey &&
    !supabaseAnonKey.startsWith('sbp_')
  );
};
