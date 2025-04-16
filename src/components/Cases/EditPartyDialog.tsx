
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Party } from "@/types";
import { toast } from "sonner";

interface EditPartyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  party: Party;
  onSuccess: () => void;
}

export default function EditPartyDialog({ 
  open, 
  onOpenChange, 
  party,
  onSuccess 
}: EditPartyDialogProps) {
  const [name, setName] = useState(party.name);
  const [type, setType] = useState<"Borrower" | "Lender" | "ThirdParty" | "Lawyer" | "Client">(party.type);
  const [email, setEmail] = useState(party.contactInfo.email || "");
  const [phone, setPhone] = useState(party.contactInfo.phone || "");
  const [address, setAddress] = useState(party.contactInfo.address || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update form when party changes
  useEffect(() => {
    setName(party.name);
    setType(party.type);
    setEmail(party.contactInfo.email || "");
    setPhone(party.contactInfo.phone || "");
    setAddress(party.contactInfo.address || "");
  }, [party]);

  const handleSubmit = async () => {
    if (!name || !type) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('parties')
        .update({
          name,
          type,
          email,
          phone,
          address
        })
        .eq('id', party.id);

      if (error) throw error;

      toast.success("Party updated successfully");
      
      // Close dialog and notify parent
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating party:", error);
      toast.error("Failed to update party");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Party</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name*</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name or entity name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type*</Label>
              <Select value={type} onValueChange={(val) => setType(val as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Borrower">Borrower</SelectItem>
                  <SelectItem value="Lender">Lender</SelectItem>
                  <SelectItem value="ThirdParty">Third Party</SelectItem>
                  <SelectItem value="Lawyer">Lawyer</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name || !type}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
