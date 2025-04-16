
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface AddPartyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  onSuccess: () => void;
}

export default function AddPartyDialog({ 
  open, 
  onOpenChange, 
  caseId, 
  onSuccess 
}: AddPartyDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"Borrower" | "Lender" | "ThirdParty" | "Lawyer" | "Client">("Borrower");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !type) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the party
      const { data: partyData, error: partyError } = await supabase
        .from('parties')
        .insert({
          name,
          type,
          email,
          phone,
          address
        })
        .select('id')
        .single();

      if (partyError) throw partyError;

      // Step 2: Associate the party with the case
      const { error: relationError } = await supabase
        .from('case_parties')
        .insert({
          case_id: caseId,
          party_id: partyData.id
        });

      if (relationError) throw relationError;

      // Reset form
      setName("");
      setType("Borrower");
      setEmail("");
      setPhone("");
      setAddress("");

      // Close dialog and notify parent
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error adding party:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Party</DialogTitle>
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
            {isSubmitting ? "Adding..." : "Add Party"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
