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
  const [caseName, setCaseName] = useState(initialData?.caseName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!caseName.trim()) {
      toast.error("Case name is required.");
      setIsLoading(false);
      return;
    }

    try {
      if (initialData?.id) {
        // Update existing case
        const { data, error } = await supabase
          .from('cases')
          .update({ caseName, description })
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
        // Create new case
        const { data, error } = await supabase
          .from('cases')
          .insert([{ caseName, description }])
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
        <Label htmlFor="caseName">Case Name</Label>
        <Input
          id="caseName"
          type="text"
          placeholder="Enter case name"
          value={caseName}
          onChange={(e) => setCaseName(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter case description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
