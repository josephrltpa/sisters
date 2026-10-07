import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dguokizhyfzuydmduuyk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRndW9raXpoeWZ6dXlkbWR1dXlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzODEwNjcsImV4cCI6MjEwNjk1NzA2N30.bahAY4RaBb-MoiqUFxBiSHIz6VOhmFhMKcIF8XltFFs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
