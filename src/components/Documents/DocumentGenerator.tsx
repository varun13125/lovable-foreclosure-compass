
import React, { useEffect, useState } from 'react';
import { Case } from '@/types';
import { useCase } from '@/hooks/useCase';
import DocumentEditor from './DocumentEditor';
import { toast } from 'sonner';
import { useParams, useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';

interface DocumentGeneratorProps {
  selectedCase: Case | null;
  caseId?: string;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ selectedCase, caseId }) => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const urlCaseId = params.id || searchParams.get('caseId');
  const effectiveCaseId = caseId || urlCaseId || null;
  
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(effectiveCaseId);
  const [loadingCases, setLoadingCases] = useState<boolean>(false);
  
  const { currentCase, loading: caseLoading, error: caseError } = useCase(selectedCase, selectedCaseId || undefined);
  
  useEffect(() => {
    fetchCases();
  }, []);
  
  useEffect(() => {
    if (effectiveCaseId) {
      setSelectedCaseId(effectiveCaseId);
    }
  }, [effectiveCaseId]);

  const fetchCases = async () => {
    try {
      setLoadingCases(true);
      const { data, error } = await supabase
        .from('cases')
        .select('id, file_number')
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      if (data) {
        // Make sure we create proper Case objects with all required properties
        const casesData = data.map(c => ({ 
          id: c.id, 
          fileNumber: c.file_number,
          status: 'New' as const,  // Valid CaseStatus value
          createdAt: '',
          updatedAt: '',
          property: { 
            id: 'temp-id', // Add required id property
            address: { 
              street: '', 
              city: '', 
              province: '', 
              postalCode: '' 
            }, 
            pid: '', 
            legal_description: '', 
            propertyType: 'Residential' 
          },
          parties: [],
          mortgage: { 
            id: '', 
            registrationNumber: '', 
            principal: 0, 
            interestRate: 0, 
            startDate: '', 
            currentBalance: 0, 
            perDiemInterest: 0 
          },
          deadlines: [],
          documents: []
        }));
        setCases(casesData);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setLoadingCases(false);
    }
  };

  const handleCaseChange = (value: string) => {
    setSelectedCaseId(value);
  };
  
  if (caseLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-law-teal"></div>
        <span className="ml-3">Loading case data...</span>
      </div>
    );
  }
  
  if (caseError) {
    console.error("Case error:", caseError);
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <h3 className="mb-2 font-semibold">Case data not available</h3>
        <p className="text-muted-foreground">
          Unable to load case data. Please try again or check if the case exists.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {!selectedCase && !effectiveCaseId && (
        <div className="mb-6">
          <label className="block mb-2 font-medium">Select a case:</label>
          <div className="flex gap-3">
            <Select value={selectedCaseId || ""} onValueChange={handleCaseChange}>
              <SelectTrigger className="w-[350px]">
                <SelectValue placeholder="Select case" />
              </SelectTrigger>
              <SelectContent>
                {loadingCases ? (
                  <SelectItem value="loading-placeholder">Loading cases...</SelectItem>
                ) : cases.length > 0 ? (
                  cases.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fileNumber}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-cases-found">No cases found</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline"
              onClick={fetchCases}
              disabled={loadingCases}
            >
              Refresh
            </Button>
          </div>
        </div>
      )}
      
      {currentCase ? (
        <DocumentEditor 
          selectedCase={currentCase} 
          caseId={selectedCaseId || undefined} 
        />
      ) : selectedCaseId ? (
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <h3 className="mb-2 font-semibold">Loading case data</h3>
          <p className="text-muted-foreground">
            Please wait while we load the case information.
          </p>
        </div>
      ) : (
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <h3 className="mb-2 font-semibold">No case selected</h3>
          <p className="text-muted-foreground">
            Please select a case to generate documents.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator;
