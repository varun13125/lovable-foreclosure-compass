
import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, UserProfile } from '@/types';
import { toast } from 'sonner';

interface AuthContextType {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setAuthLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prevState => ({ ...prevState, session }));
        
        if (session?.user) {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select(`
                id, 
                email, 
                first_name, 
                last_name, 
                role, 
                avatar_url, 
                law_firm_id,
                created_at,
                updated_at,
                law_firms(name)
              `)
              .eq('id', session.user.id)
              .single();

            if (error) throw error;

            const userProfile: UserProfile = {
              id: profile.id,
              email: profile.email,
              firstName: profile.first_name || undefined,
              lastName: profile.last_name || undefined,
              role: profile.role,
              lawFirmId: profile.law_firm_id || undefined,
              avatarUrl: profile.avatar_url || undefined,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
              lawFirmName: profile.law_firms?.name
            };

            setAuthState(prevState => ({ 
              ...prevState, 
              user: userProfile,
              loading: false 
            }));
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setAuthState(prevState => ({ ...prevState, loading: false }));
          }
        } else {
          setAuthState(prevState => ({ 
            ...prevState, 
            user: null,
            loading: false 
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAuthState(prevState => ({ ...prevState, loading: false }));
        return;
      }

      // Session exists, now fetch the user profile
      setTimeout(async () => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
              id, 
              email, 
              first_name, 
              last_name, 
              role, 
              avatar_url, 
              law_firm_id,
              created_at,
              updated_at,
              law_firms(name)
            `)
            .eq('id', session.user.id)
            .single();

          if (error) throw error;

          const userProfile: UserProfile = {
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name || undefined,
            lastName: profile.last_name || undefined,
            role: profile.role,
            lawFirmId: profile.law_firm_id || undefined,
            avatarUrl: profile.avatar_url || undefined,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
            lawFirmName: profile.law_firms?.name
          };

          setAuthState({ 
            user: userProfile,
            session,
            loading: false 
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setAuthState(prevState => ({ ...prevState, loading: false }));
        }
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prevState => ({ ...prevState, loading: true }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthState(prevState => ({ ...prevState, loading: false }));
      toast.error(error.message);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setAuthState(prevState => ({ ...prevState, loading: true }));
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      setAuthState(prevState => ({ ...prevState, loading: false }));
      toast.error(error.message);
    } else {
      toast.success("Account created successfully! Please verify your email.");
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const setAuthLoading = (loading: boolean) => {
    setAuthState(prevState => ({ ...prevState, loading }));
  };

  const contextValue: AuthContextType = {
    authState,
    signIn,
    signUp,
    signOut,
    setAuthLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
