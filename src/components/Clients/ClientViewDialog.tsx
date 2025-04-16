
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Party } from "@/types";

interface ClientViewDialogProps {
  open: boolean;
  onClose: () => void;
  client: Party | null;
  clientCaseCounts: Record<string, number>;
  onEdit: (client: Party) => void;
}

export default function ClientViewDialog({
  open,
  onClose,
  client,
  clientCaseCounts,
  onEdit
}: ClientViewDialogProps) {
  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Client Details</DialogTitle>
          <DialogDescription>
            View all details for this client
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium text-muted-foreground">Name:</div>
            <div className="col-span-2">{client.name}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium text-muted-foreground">Type:</div>
            <div className="col-span-2">{client.type}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium text-muted-foreground">Email:</div>
            <div className="col-span-2">
              {client.contactInfo.email || "Not provided"}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium text-muted-foreground">Phone:</div>
            <div className="col-span-2">
              {client.contactInfo.phone || "Not provided"}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium text-muted-foreground">Address:</div>
            <div className="col-span-2">
              {client.contactInfo.address || "Not provided"}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="font-medium text-muted-foreground">Cases:</div>
            <div className="col-span-2">
              {clientCaseCounts[client.id] || 0}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                onClose();
                onEdit(client);
              }}
              className="bg-law-teal hover:bg-law-teal/90"
            >
              Edit Client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
