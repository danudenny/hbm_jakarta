import { supabase } from './supabase';

/**
 * Simple authentication service for the admin panel
 */
const AdminAuth = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { user: data.user, session: data.session };
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw error;
    }
  },
  
  /**
   * Logout current user
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Get the current user session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },
  
  /**
   * Get current user
   */
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
};

export default AdminAuth;
