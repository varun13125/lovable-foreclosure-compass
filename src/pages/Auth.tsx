
import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Scale, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const { authState, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authTab, setAuthTab] = useState<string>(
    location.search.includes('tab=register') ? 'register' : 'login'
  );
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setLoginLoading(true);
    
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        toast.error(error.message || 'Failed to sign in');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerEmail || !registerPassword) {
      toast.error('Please enter both email and password');
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (registerPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setRegisterLoading(true);
    
    try {
      const { error } = await signUp(registerEmail, registerPassword, firstName, lastName);
      
      if (error) {
        toast.error(error.message || 'Failed to create account');
      } else {
        toast.success('Account created! Please check your email for verification.');
        setAuthTab('login');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setRegisterLoading(false);
    }
  };

  // If user is already authenticated, redirect to dashboard
  if (authState.user) {
    // Redirect system admins to admin page
    if (authState.user.role === 'system_admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-law-navy to-law-navy/80">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-white mr-2" />
            <h1 className="text-2xl font-bold text-white">LegalFlow</h1>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 md:py-20 flex justify-center">
          <Card className="w-full max-w-md">
            <Tabs defaultValue={authTab} onValueChange={setAuthTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="p-6">
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold">Sign In to Your Account</h3>
                  <p className="text-sm text-muted-foreground">Access your case management portal</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@firm.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-xs text-law-teal hover:underline">Forgot password?</a>
                    </div>
                    <Input 
                      id="password" 
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-law-navy hover:bg-law-navy/90"
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center text-sm">
                  <p>Don't have an account? <button onClick={() => setAuthTab('register')} className="text-law-teal hover:underline">Sign up</button></p>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="p-6">
                <div className="mb-6 text-center">
                  <h3 className="text-xl font-bold">Create Your Account</h3>
                  <p className="text-sm text-muted-foreground">Get started with LegalFlow</p>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input 
                      id="registerEmail" 
                      type="email" 
                      placeholder="name@firm.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <Input 
                      id="registerPassword" 
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-law-teal hover:bg-law-teal/90"
                    disabled={registerLoading}
                  >
                    {registerLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center text-sm">
                  <p>Already have an account? <button onClick={() => setAuthTab('login')} className="text-law-teal hover:underline">Sign in</button></p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </section>
      </main>
    </div>
  );
}
