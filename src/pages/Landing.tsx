import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Shield, Users, BarChart3, Scale, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const scheduleFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(1, "Company name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export default function Landing() {
  const navigate = useNavigate();
  const { authState, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  
  const scheduleForm = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      preferredDate: "",
    },
  });
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    const { error } = await signIn(email, password);
    if (!error) {
      navigate("/dashboard");
    }
  };
  
  const handleScheduleDemo = async (values: ScheduleFormValues) => {
    setIsScheduling(true);
    try {
      // This would normally send the data to your backend
      console.log("Schedule demo data:", values);
      toast.success("Demo scheduled successfully! We'll contact you soon.");
      scheduleForm.reset();
    } catch (error) {
      toast.error("Failed to schedule demo. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  // If user is already authenticated, redirect to dashboard
  if (authState.user) {
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-law-navy to-law-navy/80">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Scale className="h-8 w-8 text-white mr-2" />
            <h1 className="text-2xl font-bold text-white">LegalFlow</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8 text-white">
            <a href="#features" className="hover:text-law-teal transition-colors">Features</a>
            <a href="#pricing" className="hover:text-law-teal transition-colors">Pricing</a>
            <a href="#about" className="hover:text-law-teal transition-colors">About</a>
            <a href="#contact" className="hover:text-law-teal transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Modern Case Management for Legal Professionals
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              LegalFlow helps law firms streamline workflows, manage cases efficiently, and improve client communication with our secure, cloud-based platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-law-teal hover:bg-law-teal/90 text-white px-8"
                onClick={() => navigate("/auth")}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10 bg-law-teal/30"
                  >
                    Schedule Demo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Schedule a Demo</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to schedule a personalized demo of LegalFlow.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...scheduleForm}>
                    <form onSubmit={scheduleForm.handleSubmit(handleScheduleDemo)} className="space-y-4 py-4">
                      <FormField
                        control={scheduleForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={scheduleForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={scheduleForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company/Firm Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Law Firm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={scheduleForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={scheduleForm.control}
                        name="preferredDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <DialogClose asChild>
                          <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isScheduling}>
                          {isScheduling ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Scheduling...
                            </>
                          ) : (
                            "Schedule Demo"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <Card className="w-full max-w-md mx-auto">
              <CardContent className="pt-6">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-law-navy hover:bg-law-navy/90"
                    disabled={authState.loading}
                  >
                    {authState.loading ? (
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
                  <p>Don't have an account? <a href="/auth?tab=register" className="text-law-teal hover:underline">Sign up</a></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <section id="features" className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features for Legal Professionals</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our comprehensive platform provides the tools you need to manage your practice effectively
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-law-teal/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-law-teal" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Case Management</h3>
                <p className="text-gray-600">
                  Track all case details, deadlines, documents, and communications in one secure location.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-law-teal/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-law-teal" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Security & Compliance</h3>
                <p className="text-gray-600">
                  Bank-level encryption and role-based access controls ensure your sensitive data is protected.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-law-teal/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-law-teal" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Client Portal</h3>
                <p className="text-gray-600">
                  Provide clients with secure access to relevant documents and case updates.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-law-teal/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-law-teal" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics & Reporting</h3>
                <p className="text-gray-600">
                  Generate detailed reports and gain insights into your practice performance.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-law-teal/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-law-teal">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-tenant Architecture</h3>
                <p className="text-gray-600">
                  Each law firm has their own secure database and customized settings.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-law-teal/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-law-teal">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">User Role Management</h3>
                <p className="text-gray-600">
                  Assign different access levels and permissions based on user roles within your firm.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to transform your legal practice?</h2>
            <Button 
              size="lg" 
              className="bg-law-teal hover:bg-law-teal/90 text-white px-8"
              onClick={() => navigate("/dashboard")}
            >
              Get Started Today
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Scale className="h-6 w-6 text-law-teal mr-2" />
                <h3 className="text-xl font-bold">LegalFlow</h3>
              </div>
              <p className="text-gray-400">
                Modern case management software for legal professionals.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-law-teal">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-law-teal">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-law-teal">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-law-teal">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-law-teal">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-law-teal">Guides</a></li>
                <li><a href="#" className="text-gray-400 hover:text-law-teal">Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-law-teal">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-law-teal">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-law-teal">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-law-teal">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-law-teal">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between">
            <p className="text-gray-400">© 2025 LegalFlow. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-law-teal">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-law-teal">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-law-teal">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
