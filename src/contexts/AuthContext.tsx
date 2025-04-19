
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
        console.log('Auth state changed:', event);
        setAuthState(prevState => ({ ...prevState, session }));
        
        if (session?.user) {
          // Use setTimeout to prevent deadlocks with Supabase auth
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

              if (error) {
                console.error("Error fetching user profile:", error);
                toast.error("Error loading user profile");
                setAuthState(prevState => ({ 
                  ...prevState, 
                  loading: false 
                }));
                return;
              }

              if (profile) {
                console.log('Profile found:', profile);
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
              } else {
                console.log('No profile found, creating one...');
                // If no profile found, create one
                const { data: newProfile, error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                    role: 'staff',
                    first_name: session.user.user_metadata?.first_name,
                    last_name: session.user.user_metadata?.last_name
                  })
                  .select()
                  .single();
                
                if (insertError) {
                  console.error("Error creating user profile:", insertError);
                  toast.error("Error creating user profile");
                  setAuthState(prevState => ({ ...prevState, loading: false }));
                  return;
                }
                
                console.log('New profile created:', newProfile);
                const userProfile: UserProfile = {
                  id: newProfile.id,
                  email: newProfile.email,
                  firstName: newProfile.first_name || undefined,
                  lastName: newProfile.last_name || undefined,
                  role: newProfile.role,
                  lawFirmId: newProfile.law_firm_id || undefined,
                  avatarUrl: newProfile.avatar_url || undefined,
                  createdAt: newProfile.created_at,
                  updatedAt: newProfile.updated_at
                };

                setAuthState(prevState => ({ 
                  ...prevState, 
                  user: userProfile,
                  loading: false 
                }));
              }
            } catch (error) {
              console.error("Error in auth state change handler:", error);
              setAuthState(prevState => ({ ...prevState, loading: false }));
            }
          }, 0);
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
      console.log('Initial session check:', session ? 'Found session' : 'No session');
      
      if (!session) {
        setAuthState(prevState => ({ ...prevState, loading: false }));
        return;
      }

      setAuthState(prevState => ({ 
        ...prevState, 
        session,
      }));
      
      // The actual fetching of the profile will be handled by onAuthStateChange
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prevState => ({ ...prevState, loading: true }));
    
    try {
      console.log(`Signing in with email: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setAuthState(prevState => ({ ...prevState, loading: false }));
        console.error('Sign in error:', error);
        toast.error(error.message);
        return { error };
      }
      
      console.log('Sign in successful:', data);
      toast.success('Signed in successfully!');
      
      // Authentication was successful, but we'll wait for the onAuthStateChange event to update the state
      return { error: null };
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      setAuthState(prevState => ({ ...prevState, loading: false }));
      toast.error("An unexpected error occurred during sign in");
      return { error };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    setAuthState(prevState => ({ ...prevState, loading: true }));
    
    try {
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
    } catch (error: any) {
      console.error("Unexpected error during sign up:", error);
      setAuthState(prevState => ({ ...prevState, loading: false }));
      toast.error(error.message || "An unexpected error occurred during sign up");
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
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
