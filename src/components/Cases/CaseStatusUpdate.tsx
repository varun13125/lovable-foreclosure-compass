
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CaseStatus } from "@/types";

interface CaseStatusUpdateProps {
  caseId: string;
  currentStatus: CaseStatus;
  onStatusUpdated: (newStatus: CaseStatus) => void;
}

export default function CaseStatusUpdate({ 
  caseId, 
  currentStatus, 
  onStatusUpdated 
}: CaseStatusUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Make sure these statuses match the CaseStatus type in src/types/index.ts
  const statuses: CaseStatus[] = [
    'New',
    'Demand Letter Sent',
    'Petition Filed',
    'Order Nisi Granted',
    'Redemption Period',
    'Sale Process',
    'Closed'
  ];
  
  const handleStatusChange = async (newStatus: CaseStatus) => {
    if (newStatus === currentStatus) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('cases')
        .update({ status: newStatus })
        .eq('id', caseId);
      
      if (error) throw error;
      
      toast.success(`Case status updated to ${newStatus}`);
      onStatusUpdated(newStatus);
      
    } catch (error) {
      console.error("Error updating case status:", error);
      toast.error("Failed to update case status");
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isUpdating}>
      <SelectTrigger className={isUpdating ? "opacity-50" : ""}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
