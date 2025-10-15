import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

export async function signUp(email: string, password: string, name: string) {
  try {
    // Automatically confirm the user's email since an email server hasn't been configured.
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    });

    if (error) {
      console.log(`Sign up error: ${error.message}`);
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.log(`Sign up exception: ${error}`);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function verifyToken(accessToken: string) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    return { success: true, userId: user.id, email: user.email };
  } catch (error) {
    console.log(`Token verification error: ${error}`);
    return { success: false, error: 'Invalid token' };
  }
}
