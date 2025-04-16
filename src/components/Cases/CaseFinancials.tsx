
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface CaseFinancialsProps {
  caseId: string;
}

export default function CaseFinancials({ caseId }: CaseFinancialsProps) {
  const [loading, setLoading] = useState(true);
  const [mortgage, setMortgage] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [parties, setParties] = useState<any[]>([]);
  
  useEffect(() => {
    fetchFinancialData();
  }, [caseId]);
  
  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select(`
          mortgage_id,
          property_id,
          mortgage: mortgages (
            id,
            registration_number,
            principal,
            interest_rate,
            start_date,
            current_balance,
            per_diem_interest,
            payment_amount,
            payment_frequency,
            arrears
          ),
          property: properties (
            id,
            street,
            city,
            province,
            postal_code,
            pid,
            property_type
          )
        `)
        .eq('id', caseId)
        .single();
      
      if (caseError) throw caseError;
      
      setMortgage(caseData.mortgage);
      setProperty(caseData.property);
      
      // Fetch parties (borrowers)
      const { data: partiesData, error: partiesError } = await supabase
        .from('case_parties')
        .select(`
          party: parties (
            id,
            name,
            type,
            email,
            phone,
            address
          )
        `)
        .eq('case_id', caseId);
      
      if (partiesError) throw partiesError;
      
      setParties(partiesData.map((p: any) => p.party));
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-law-teal"></div>
      </div>
    );
  }
  
  if (!mortgage) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No financial data available for this case.</p>
      </div>
    );
  }

  // Calculate current interest
  const startDate = new Date(mortgage.start_date);
  const today = new Date();
  const daysSinceMortgageStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const accruedInterest = daysSinceMortgageStart * mortgage.per_diem_interest;

  // Mock legal fees and disbursements
  const legalFees = 3500;
  const disbursements = 875.50;
  const totalAmount = mortgage.current_balance + accruedInterest + legalFees + disbursements;

  // Get borrowers
  const borrowers = parties.filter((p: any) => p.type === 'Borrower');

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-lg mb-4">Mortgage Details</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Principal Amount</TableCell>
                    <TableCell>{formatCurrency(mortgage.principal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Interest Rate</TableCell>
                    <TableCell>{mortgage.interest_rate}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Start Date</TableCell>
                    <TableCell>{formatDate(mortgage.start_date)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Current Balance</TableCell>
                    <TableCell className="font-bold">{formatCurrency(mortgage.current_balance)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Per Diem Interest</TableCell>
                    <TableCell>{formatCurrency(mortgage.per_diem_interest)}/day</TableCell>
                  </TableRow>
                  {mortgage.arrears && (
                    <TableRow>
                      <TableCell className="font-medium">Payment Arrears</TableCell>
                      <TableCell>{formatCurrency(mortgage.arrears)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Total Payout Calculation</h3>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Current Balance</TableCell>
                    <TableCell>{formatCurrency(mortgage.current_balance)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Accrued Interest</TableCell>
                    <TableCell>{formatCurrency(accruedInterest)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Legal Fees</TableCell>
                    <TableCell>{formatCurrency(legalFees)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Disbursements</TableCell>
                    <TableCell>{formatCurrency(disbursements)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total Amount</TableCell>
                    <TableCell className="font-bold">{formatCurrency(totalAmount)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payout Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-6 border rounded-md">
            <div className="mb-6">
              <h2 className="text-center font-bold text-xl mb-1">MORTGAGE PAYOUT STATEMENT</h2>
              <p className="text-center text-muted-foreground">As of {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Property</h3>
                <p>{property.street}</p>
                <p>{property.city}, {property.province}</p>
                <p>{property.postal_code}</p>
                <p className="mt-2">PID: {property.pid}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Mortgagor</h3>
                {borrowers.length > 0 ? (
                  borrowers.map((party: any) => (
                    <div key={party.id} className="mb-2">
                      <p>{party.name}</p>
                      {party.address && <p>{party.address}</p>}
                    </div>
                  ))
                ) : (
                  <p>No borrowers listed</p>
                )}
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Principal Balance</TableCell>
                  <TableCell className="text-right">{formatCurrency(mortgage.current_balance)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Interest to {new Date().toLocaleDateString()} @ {mortgage.interest_rate}%</TableCell>
                  <TableCell className="text-right">{formatCurrency(accruedInterest)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Legal Fees</TableCell>
                  <TableCell className="text-right">{formatCurrency(legalFees)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Disbursements</TableCell>
                  <TableCell className="text-right">{formatCurrency(disbursements)}</TableCell>
                </TableRow>
                <TableRow className="font-bold">
                  <TableCell>Total Payout Amount</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalAmount)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground text-sm">
                    Per diem interest: {formatCurrency(mortgage.per_diem_interest)} per day after {new Date().toLocaleDateString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="mt-8 text-sm text-muted-foreground">
              <p className="mb-2">This statement is valid until the end of business today. Please contact our office for an updated statement after this date.</p>
              <p>Funds must be received by certified cheque, bank draft or wire transfer by 1:00 PM on the day of payout.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
