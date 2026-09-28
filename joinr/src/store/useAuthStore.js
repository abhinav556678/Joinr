import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  session: null,
  isInitialized: false,
  setSession: (session) => set({ session, isInitialized: true }),
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  }
}));
