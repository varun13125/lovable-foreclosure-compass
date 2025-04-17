
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Case } from "@/types";
import { toast } from "sonner";
import CaseListHeader from "./CaseListHeader";
import CaseListTable from "./CaseListTable";

export default function CaseList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          file_number,
          status,
          created_at,
          updated_at,
          property: properties (
            id,
            address: street,
            city,
            province,
            postal_code,
            property_type,
            legal_description,
            pid
          ),
          parties: case_parties (
            party: parties (
              id,
              name,
              type
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
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the Case type
      const transformedCases: Case[] = data.map(caseItem => ({
        id: caseItem.id,
        fileNumber: caseItem.file_number,
        status: caseItem.status,
        createdAt: caseItem.created_at,
        updatedAt: caseItem.updated_at,
        property: {
          id: caseItem.property.id,
          address: {
            street: caseItem.property.address,
            city: caseItem.property.city,
            province: caseItem.property.province || '',
            postalCode: caseItem.property.postal_code || ''
          },
          pid: caseItem.property.pid || '',
          legal_description: caseItem.property.legal_description || '',
          propertyType: caseItem.property.property_type || 'Residential'
        },
        parties: caseItem.parties.map(cp => ({
          id: cp.party.id,
          name: cp.party.name,
          type: cp.party.type,
          contactInfo: {
            email: '',
            phone: ''
          }
        })),
        mortgage: {
          id: caseItem.mortgage.id,
          registrationNumber: caseItem.mortgage.registration_number,
          principal: caseItem.mortgage.principal,
          interestRate: caseItem.mortgage.interest_rate,
          startDate: caseItem.mortgage.start_date,
          currentBalance: caseItem.mortgage.current_balance,
          perDiemInterest: caseItem.mortgage.per_diem_interest || 0
        },
        deadlines: [],
        documents: []
      }));

      setCases(transformedCases);
    } catch (error) {
      console.error("Error fetching cases:", error);
      toast.error("Failed to load cases", {
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter((caseItem) => {
    // Apply search filter
    const matchesSearch =
      searchQuery === "" ||
      caseItem.fileNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.property.address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.parties.some((party) =>
        party.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Apply status filter
    const matchesStatus = filterStatus === null || caseItem.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Get all unique statuses for the filter
  const statuses = Array.from(new Set(cases.map((caseItem) => caseItem.status)));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle>Active Cases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <CaseListHeader 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            statuses={statuses}
          />
        </div>
        <div className="rounded-md border">
          <CaseListTable 
            cases={filteredCases} 
            loading={loading} 
            formatCurrency={formatCurrency} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
