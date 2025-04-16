
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const formSchema = z.object({
  // Basic Info
  fileNumber: z.string().min(1, "File number is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
  
  // Property
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().optional(),
  pid: z.string().optional(),
  legalDescription: z.string().optional(),
  propertyType: z.string().default("Residential"),
  
  // Mortgage
  registrationNumber: z.string().min(1, "Registration number is required"),
  principal: z.coerce.number().min(0, "Principal must be a positive number"),
  interestRate: z.coerce.number().min(0, "Interest rate must be a positive number"),
  startDate: z.string().min(1, "Start date is required"),
  currentBalance: z.coerce.number().min(0, "Current balance must be a positive number"),
  paymentAmount: z.coerce.number().optional(),
  paymentFrequency: z.string().optional(),
  arrears: z.coerce.number().optional(),
  perDiemInterest: z.coerce.number().min(0, "Per diem interest must be a positive number"),
  
  // Parties
  borrowerName: z.string().min(1, "Borrower name is required"),
  borrowerEmail: z.string().email("Invalid email").optional().or(z.literal('')),
  borrowerPhone: z.string().optional(),
  
  lenderName: z.string().min(1, "Lender name is required"),
  lenderEmail: z.string().email("Invalid email").optional().or(z.literal('')),
  lenderPhone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CaseFormProps {
  onCancel: () => void;
}

export default function CaseForm({ onCancel }: CaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "New",
      province: "BC",
      propertyType: "Residential",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Step 1: Create property record
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert({
          street: data.street,
          city: data.city,
          province: data.province,
          postal_code: data.postalCode,
          pid: data.pid || null,
          legal_description: data.legalDescription || null,
          property_type: data.propertyType as any,
        })
        .select('id')
        .single();
        
      if (propertyError) throw propertyError;
      
      // Step 2: Create mortgage record
      const { data: mortgageData, error: mortgageError } = await supabase
        .from('mortgages')
        .insert({
          registration_number: data.registrationNumber,
          principal: data.principal,
          interest_rate: data.interestRate,
          start_date: data.startDate,
          current_balance: data.currentBalance,
          payment_amount: data.paymentAmount || null,
          payment_frequency: data.paymentFrequency as any || null,
          arrears: data.arrears || null,
          per_diem_interest: data.perDiemInterest,
        })
        .select('id')
        .single();
        
      if (mortgageError) throw mortgageError;
      
      // Step 3: Create case record
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert({
          file_number: data.fileNumber,
          status: data.status as any,
          property_id: propertyData.id,
          mortgage_id: mortgageData.id,
          notes: data.notes || null,
        })
        .select('id')
        .single();
        
      if (caseError) throw caseError;
      
      // Step 4: Create parties
      const borrower = {
        name: data.borrowerName,
        email: data.borrowerEmail || null,
        phone: data.borrowerPhone || null,
        type: "Borrower" as const,
      };
      
      const lender = {
        name: data.lenderName,
        email: data.lenderEmail || null,
        phone: data.lenderPhone || null,
        type: "Lender" as const,
      };
      
      const { data: borrowerData, error: borrowerError } = await supabase
        .from('parties')
        .insert(borrower)
        .select('id')
        .single();
        
      if (borrowerError) throw borrowerError;
      
      const { data: lenderData, error: lenderError } = await supabase
        .from('parties')
        .insert(lender)
        .select('id')
        .single();
        
      if (lenderError) throw lenderError;
      
      // Step 5: Link parties to case
      const casePartiesData = [
        { case_id: caseData.id, party_id: borrowerData.id },
        { case_id: caseData.id, party_id: lenderData.id }
      ];
      
      const { error: casePartiesError } = await supabase
        .from('case_parties')
        .insert(casePartiesData);
        
      if (casePartiesError) throw casePartiesError;
      
      // Success!
      toast.success("Case created successfully", {
        description: `File number: ${data.fileNumber}`
      });
      
      // Redirect to case detail page
      window.location.href = `/case/${caseData.id}`;
      
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error("Failed to create case", {
        description: "Please try again later"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Create New Case</CardTitle>
            <CardDescription>
              Enter the details for a new foreclosure case
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic">
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="property">Property</TabsTrigger>
                <TabsTrigger value="mortgage">Mortgage</TabsTrigger>
                <TabsTrigger value="parties">Parties</TabsTrigger>
              </TabsList>
              
              {/* Basic Info Tab */}
              <TabsContent value="basic">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="fileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. FC-2023-005" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Demand Letter Sent">Demand Letter Sent</SelectItem>
                            <SelectItem value="Petition Filed">Petition Filed</SelectItem>
                            <SelectItem value="Order Nisi Granted">Order Nisi Granted</SelectItem>
                            <SelectItem value="Redemption Period">Redemption Period</SelectItem>
                            <SelectItem value="Sale Process">Sale Process</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Add any notes about this case" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Property Tab */}
              <TabsContent value="property">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Province" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BC">British Columbia</SelectItem>
                              <SelectItem value="AB">Alberta</SelectItem>
                              <SelectItem value="ON">Ontario</SelectItem>
                              {/* More provinces would go here */}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. V6B 2W9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property ID (PID)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 012-345-678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="legalDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Legal Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter legal description of property" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Residential">Residential</SelectItem>
                            <SelectItem value="Commercial">Commercial</SelectItem>
                            <SelectItem value="Land">Land</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              {/* Mortgage Tab */}
              <TabsContent value="mortgage">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. CA123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="principal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Principal Amount</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 450000" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interestRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interest Rate (%)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 4.5" type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currentBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Balance</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 410350.22" type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="paymentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Amount</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 2275.33" type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                              <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="arrears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Arrears Amount</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 12000" type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="perDiemInterest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Per Diem Interest</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 50.55" type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Parties Tab */}
              <TabsContent value="parties">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 pb-6">
                    <h3 className="font-medium mb-3">Borrower Information</h3>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="borrowerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Full legal name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="borrowerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="borrowerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 pb-6">
                    <h3 className="font-medium mb-3">Lender Information</h3>
                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="lenderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Financial institution name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="lenderEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lenderPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
            <Button 
              className="bg-law-teal hover:bg-law-teal/90" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Case"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
