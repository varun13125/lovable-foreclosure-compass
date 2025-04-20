
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

// Define the schema for the form
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  company: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
});

export default function Landing() {
  const navigate = useNavigate();
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, this would send the form data to a server
    console.log(values);
    toast.success("Demo request submitted successfully!");
    setDemoDialogOpen(false);
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-law-navy text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Mortgage Enforcement <span className="text-law-teal">Simplified</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              Modernizing legal case management for mortgage enforcement professionals.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-law-teal hover:bg-law-teal/90 text-white"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 bg-law-teal/30"
                onClick={() => setDemoDialogOpen(true)}
              >
                Schedule Demo
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900">Case #MEF-2023-001</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                </div>
                <div className="space-y-1 text-gray-700 text-sm">
                  <p className="flex justify-between">
                    <span>Property:</span>
                    <span className="font-medium">123 Main St, Vancouver</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Mortgage Balance:</span>
                    <span className="font-medium">$543,289.75</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Interest Rate:</span>
                    <span className="font-medium">5.25%</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Next Deadline:</span>
                    <span className="font-medium text-amber-600">May 15, 2023</span>
                  </p>
                </div>
                <div className="pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-law-teal h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span>File Opened</span>
                    <span>Enforcement</span>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features for Legal Professionals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 rounded-full bg-law-teal/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-law-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Document Automation</h3>
              <p className="text-gray-600">Generate legal documents in seconds with our advanced templates and automation tools.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 rounded-full bg-law-amber/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-law-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Deadline Tracking</h3>
              <p className="text-gray-600">Never miss a critical date with our intuitive deadline management system.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 rounded-full bg-law-navy/20 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-law-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Financial Tracking</h3>
              <p className="text-gray-600">Track mortgage balances, payments, and interest calculations in real-time.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by Legal Professionals</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-600">Partner, Johnson & Associates</p>
                </div>
              </div>
              <p className="text-gray-700">"This platform has revolutionized how our firm handles mortgage enforcement cases. The automation alone has saved us countless hours."</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold">Robert Chen</h4>
                  <p className="text-sm text-gray-600">Legal Director, Pacific Mortgage Corp.</p>
                </div>
              </div>
              <p className="text-gray-700">"The deadline tracking and document generation features are exceptional. We've reduced our processing time by over 40%."</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-semibold">Amanda Peterson</h4>
                  <p className="text-sm text-gray-600">Paralegal, Legal Services Inc.</p>
                </div>
              </div>
              <p className="text-gray-700">"The intuitive interface made training our staff a breeze. The customer support has been responsive and extremely helpful."</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-law-teal py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your practice?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join hundreds of legal professionals who are streamlining their mortgage enforcement workflows.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="bg-white text-law-teal hover:bg-gray-100">
              Start Your Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => setDemoDialogOpen(true)}>
              Request a Demo
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">ForeLaw</h3>
              <p className="mb-4">Modern legal technology for mortgage enforcement professionals.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Case Studies</a></li>
                <li><a href="#" className="hover:text-white">Reviews</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Guides</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2023 ForeLaw. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white mr-4">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white mr-4">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Demo Request Dialog */}
      <Dialog open={demoDialogOpen} onOpenChange={setDemoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule a Demo</DialogTitle>
            <DialogDescription>
              Fill out the form below and our team will contact you to schedule a personalized demo.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="w-full">Submit Request</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
