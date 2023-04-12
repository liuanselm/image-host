import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://allnfyqmkaokreaxscsh.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbG5meXFta2Fva3JlYXhzY3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODEyMzA0NDIsImV4cCI6MTk5NjgwNjQ0Mn0.Pb_E3-J2kT8koIzjnPVjWkml8spS_eCx-4L93QmPuUk"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)