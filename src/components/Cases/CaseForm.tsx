
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Case } from '@/types';

export interface CaseFormProps {
  initialData?: Case;
  caseData?: Case;
  onCancel: () => void;
  onSuccess: (caseId: string) => void;
  onError: (errorMessage: string) => void;
}

const CaseForm: React.FC<CaseFormProps> = ({ initialData, onCancel, onSuccess, onError }) => {
  const [fileNumber, setFileNumber] = useState(initialData?.fileNumber || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!fileNumber.trim()) {
      toast.error("File number is required.");
      setIsLoading(false);
      return;
    }

    try {
      if (initialData?.id) {
        // Update existing case
        const { data, error } = await supabase
          .from('cases')
          .update({ 
            file_number: fileNumber, 
            notes: notes,
            // Add mock values for required fields if they don't exist in the initialData
            mortgage_id: initialData.mortgage || '00000000-0000-0000-0000-000000000000',
            property_id: initialData.property || '00000000-0000-0000-0000-000000000000'
          })
          .eq('id', initialData.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating case:", error);
          onError("Failed to update case.");
          toast.error("Failed to update case.");
        } else {
          toast.success("Case updated successfully!");
          onSuccess(initialData.id);
        }
      } else {
        // Create new case with mock data for required fields
        const { data, error } = await supabase
          .from('cases')
          .insert([{ 
            file_number: fileNumber, 
            notes: notes,
            // Mock values for required fields
            mortgage_id: '00000000-0000-0000-0000-000000000000',
            property_id: '00000000-0000-0000-0000-000000000000'
          }])
          .select()
          .single();

        if (error) {
          console.error("Error creating case:", error);
          onError("Failed to create case.");
          toast.error("Failed to create case.");
        } else {
          toast.success("Case created successfully!");
          onSuccess(data.id);
        }
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      onError("An unexpected error occurred.");
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fileNumber">File Number</Label>
        <Input
          id="fileNumber"
          type="text"
          placeholder="Enter file number"
          value={fileNumber}
          onChange={(e) => setFileNumber(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Enter case notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-law-teal hover:bg-law-teal/90">
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default CaseForm;
