
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Case, Property, Mortgage } from '@/types';

export interface CaseFormProps {
  initialData?: Case;
  caseData?: Case;
  onCancel: () => void;
  onSuccess: (caseId: string) => void;
  onError: (errorMessage: string) => void;
}

const CaseForm: React.FC<CaseFormProps> = ({ initialData, caseData, onCancel, onSuccess, onError }) => {
  const data = initialData || caseData; // Use either initialData or caseData props (for backward compatibility)
  const [fileNumber, setFileNumber] = useState(data?.fileNumber || '');
  const [notes, setNotes] = useState(data?.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  
  // Property fields
  const [street, setStreet] = useState(data?.property?.address?.street || '');
  const [city, setCity] = useState(data?.property?.address?.city || '');
  const [province, setProvince] = useState(data?.property?.address?.province || 'BC');
  const [postalCode, setPostalCode] = useState(data?.property?.address?.postalCode || '');
  // Define propertyType with the correct type to match our Property type
  const [propertyType, setPropertyType] = useState<'Residential' | 'Commercial' | 'Land' | 'Other'>(
    (data?.property?.propertyType as 'Residential' | 'Commercial' | 'Land' | 'Other') || 'Residential'
  );
  const [legalDescription, setLegalDescription] = useState(data?.property?.legalDescription || '');
  const [pid, setPid] = useState(data?.property?.pid || '');
  
  // Mortgage fields
  const [registrationNumber, setRegistrationNumber] = useState(data?.mortgage?.registrationNumber || '');
  const [principal, setPrincipal] = useState(data?.mortgage?.principal?.toString() || '');
  const [interestRate, setInterestRate] = useState(data?.mortgage?.interestRate?.toString() || '');
  const [startDate, setStartDate] = useState(data?.mortgage?.startDate || '');
  const [currentBalance, setCurrentBalance] = useState(data?.mortgage?.currentBalance?.toString() || '');
  const [perDiemInterest, setPerDiemInterest] = useState(data?.mortgage?.perDiemInterest?.toString() || '');
  
  // This function explicitly casts the input string to our PropertyType union type
  const handlePropertyTypeChange = (value: string) => {
    setPropertyType(value as 'Residential' | 'Commercial' | 'Land' | 'Other');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!fileNumber.trim()) {
      toast.error("File number is required.");
      setIsLoading(false);
      return;
    }

    // Validate other required fields
    if (!street.trim() || !city.trim()) {
      toast.error("Property street and city are required.");
      setIsLoading(false);
      return;
    }

    if (!registrationNumber.trim() || !principal.trim() || !interestRate.trim() || !startDate || !currentBalance.trim()) {
      toast.error("All mortgage information fields are required.");
      setIsLoading(false);
      return;
    }

    try {
      // First create property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert([{ 
          street: street,
          city: city,
          province: province,
          postal_code: postalCode,
          property_type: propertyType,
          legal_description: legalDescription,
          pid: pid
        }])
        .select()
        .single();

      if (propertyError) {
        throw new Error(`Failed to create property: ${propertyError.message}`);
      }

      // Then create mortgage
      const { data: mortgageData, error: mortgageError } = await supabase
        .from('mortgages')
        .insert([{ 
          registration_number: registrationNumber,
          principal: parseFloat(principal),
          interest_rate: parseFloat(interestRate),
          start_date: startDate,
          current_balance: parseFloat(currentBalance),
          per_diem_interest: parseFloat(perDiemInterest) || 0
        }])
        .select()
        .single();

      if (mortgageError) {
        throw new Error(`Failed to create mortgage: ${mortgageError.message}`);
      }

      if (data?.id) {
        // Update existing case
        const { data: updatedData, error } = await supabase
          .from('cases')
          .update({ 
            file_number: fileNumber, 
            notes: notes,
            mortgage_id: mortgageData.id,
            property_id: propertyData.id
          })
          .eq('id', data.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating case:", error);
          onError("Failed to update case.");
          toast.error("Failed to update case.");
        } else {
          toast.success("Case updated successfully!");
          onSuccess(data.id);
        }
      } else {
        // Create new case
        const { data: newData, error } = await supabase
          .from('cases')
          .insert([{ 
            file_number: fileNumber, 
            notes: notes,
            mortgage_id: mortgageData.id,
            property_id: propertyData.id,
            status: 'New'
          }])
          .select()
          .single();

        if (error) {
          console.error("Error creating case:", error);
          onError("Failed to create case.");
          toast.error("Failed to create case.");
        } else {
          toast.success("Case created successfully!");
          onSuccess(newData.id);
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fileNumber">File Number</Label>
            <Input
              id="fileNumber"
              type="text"
              placeholder="Enter file number"
              value={fileNumber}
              onChange={(e) => setFileNumber(e.target.value)}
              disabled={isLoading}
              required
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                type="text"
                placeholder="Enter street address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                type="text"
                placeholder="Enter province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                type="text"
                placeholder="Enter postal code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="propertyType">Property Type</Label>
            <Select 
              value={propertyType} 
              onValueChange={handlePropertyTypeChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Residential">Residential</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Land">Land</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="legalDescription">Legal Description</Label>
            <Textarea
              id="legalDescription"
              placeholder="Enter legal description"
              value={legalDescription}
              onChange={(e) => setLegalDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="pid">PID (Property ID)</Label>
            <Input
              id="pid"
              type="text"
              placeholder="Enter property ID"
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mortgage Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              type="text"
              placeholder="Enter registration number"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="principal">Principal Amount</Label>
              <Input
                id="principal"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter principal amount"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter interest rate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="currentBalance">Current Balance</Label>
              <Input
                id="currentBalance"
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter current balance"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="perDiemInterest">Per Diem Interest</Label>
            <Input
              id="perDiemInterest"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter per diem interest"
              value={perDiemInterest}
              onChange={(e) => setPerDiemInterest(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-law-teal hover:bg-law-teal/90">
          {isLoading ? "Saving..." : data?.id ? "Update" : "Create Case"}
        </Button>
      </div>
    </form>
  );
};

export default CaseForm;
