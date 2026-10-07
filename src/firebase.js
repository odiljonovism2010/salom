import { createClient } from '@supabase/supabase-js';

// URL вашего проекта Supabase и Publishable (Anon) API Key
const supabaseUrl = 'https://goutcbpoilbmkincohxc.supabase.co'; // Замените на ваш Project URL, если отличается
const supabaseAnonKey = 'sb_publishable_Z_M_QU_Rx5Z_PXSbapDmNQ_S9FYKV1q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);