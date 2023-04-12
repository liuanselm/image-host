import { supabase } from '../../supabaseClient'
import { Auth } from '@supabase/auth-ui-react'

import {
  // Import predefined theme
  ThemeSupa,
} from '@supabase/auth-ui-shared'

const Authentication = () => <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" />

export default Authentication;