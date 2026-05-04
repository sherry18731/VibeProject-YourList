/**
 * Supabase Initialization and Configuration
 */

const SUPABASE_URL = 'https://jfjvfyaqdfvdwklxtyqh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmanZmeWFxZGZ2ZHdrbHh0eXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzUzMjcsImV4cCI6MjA5MzQ1MTMyN30.qOwlMNwalVhKeva6J_8un-hzLyG3zykB09Gifpthrrk';

// Initialize Supabase Client
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
