
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Case, CaseStatus } from '@/types';

export const useCase = (initialCase: Case | null, caseId?: string) => {
  const [currentCase, setCurrentCase] = useState<Case | null>(initialCase);
  const [loading, setLoading] = useState<boolean>(initialCase ? false : true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCase) {
      console.log("Using provided case data:", initialCase.fileNumber);
      setCurrentCase(initialCase);
      setLoading(false);
      setError(null);
    } else if (caseId) {
      console.log("Fetching case by ID:", caseId);
      fetchCaseById(caseId);
    } else {
      console.log("No case data or ID provided");
      setCurrentCase(null);
      setLoading(false);
      setError(null);
    }
  }, [initialCase, caseId]);

  const fetchCaseById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching case data for ID:", id);
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          file_number,
          status,
          created_at,
          updated_at,
          notes,
          court_file_number,
          court_registry,
          hearing_date,
          judge_name,
          property: properties (
            id,
            street,
            city,
            province,
            postal_code,
            property_type,
            pid,
            legal_description
          ),
          parties: case_parties (
            party: parties (
              id,
              name,
              type,
              email,
              phone,
              address
            )
          ),
          mortgage: mortgages (
            id,
            registration_number,
            principal,
            interest_rate,
            start_date,
            current_balance,
            per_diem_interest
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error from Supabase:", error);
        throw error;
      }

      if (data) {
        console.log("Case data fetched successfully:", data.file_number);
        
        const transformedCase: Case = {
          id: data.id,
          fileNumber: data.file_number,
          status: data.status as CaseStatus || 'New', // Ensure we have a valid CaseStatus 
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          property: data.property ? {
            id: data.property.id,
            address: {
              street: data.property.street || "",
              city: data.property.city || "",
              province: data.property.province || "",
              postalCode: data.property.postal_code || "",
            },
            pid: data.property.pid || "",
            legal_description: data.property.legal_description || "",
            propertyType: data.property.property_type || "Residential"
          } : {
            id: '',
            address: { street: '', city: '', province: '', postalCode: '' },
            pid: '',
            legal_description: '',
            propertyType: 'Residential'
          },
          parties: data.parties ? data.parties.map((cp: any) => ({
            id: cp.party.id,
            name: cp.party.name,
            type: cp.party.type,
            contactInfo: {
              email: cp.party.email || '',
              phone: cp.party.phone || '',
              address: cp.party.address || ''
            }
          })) : [],
          mortgage: data.mortgage ? {
            id: data.mortgage.id,
            registrationNumber: data.mortgage.registration_number || '',
            principal: data.mortgage.principal || 0,
            interestRate: data.mortgage.interest_rate || 0,
            startDate: data.mortgage.start_date || '',
            currentBalance: data.mortgage.current_balance || 0,
            perDiemInterest: data.mortgage.per_diem_interest || 0
          } : {
            id: '',
            registrationNumber: '',
            principal: 0,
            interestRate: 0,
            startDate: '',
            currentBalance: 0,
            perDiemInterest: 0
          },
          deadlines: [],
          documents: [],
          court: {
            fileNumber: data.court_file_number || '',
            registry: data.court_registry || '',
            hearingDate: data.hearing_date || null,
            judgeName: data.judge_name || ''
          },
          notes: data.notes || ''
        };
        console.log("Transformed case data:", transformedCase.fileNumber);
        setCurrentCase(transformedCase);
      } else {
        console.log("No case data found for ID:", id);
        setCurrentCase(null);
        setError("Case not found");
      }
    } catch (error: any) {
      console.error("Error fetching case:", error);
      setError(error.message || "Failed to fetch case data");
      setCurrentCase(null);
    } finally {
      setLoading(false);
    }
  };

  return { currentCase, setCurrentCase, loading, error };
};
