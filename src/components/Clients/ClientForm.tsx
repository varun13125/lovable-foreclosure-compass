
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Party } from "@/types";

const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["Client", "Borrower", "Lender", "ThirdParty", "Lawyer"]),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Party;
  inDialog?: boolean;
}

export default function ClientForm({ open, onClose, onSuccess, initialData, inDialog = true }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || "Borrower",
      email: initialData?.contactInfo.email || "",
      phone: initialData?.contactInfo.phone || "",
      address: initialData?.contactInfo.address || "",
    },
  });

  const onSubmit = async (data: ClientFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (initialData?.id) {
        // Update existing client
        const { error } = await supabase
          .from('parties')
          .update({
            name: data.name,
            type: data.type,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null,
          })
          .eq('id', initialData.id);
          
        if (error) throw error;
        
        toast.success("Client updated successfully");
      } else {
        // Insert new client
        const { error } = await supabase
          .from('parties')
          .insert({
            name: data.name,
            type: data.type,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null,
          });
          
        if (error) throw error;
        
        toast.success("Client created successfully");
      }
      
      // Reset form
      form.reset();
      
      // Close dialog and refresh client list
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error with client:", error);
      toast.error(initialData ? "Failed to update client" : "Failed to create client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Party Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select party type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Borrower">Borrower</SelectItem>
                    <SelectItem value="Lender">Lender</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="ThirdParty">Third Party</SelectItem>
                    <SelectItem value="Lawyer">Lawyer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Full address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-law-teal hover:bg-law-teal/90"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (initialData ? "Updating..." : "Creating...") 
              : (initialData ? "Update Client" : "Create Client")
            }
          </Button>
        </div>
      </form>
    </Form>
  );

  if (!inDialog) {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Update client information" 
              : "Add a new client, borrower, lender or other party to the system"
            }
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
