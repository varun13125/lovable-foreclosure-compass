
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockCases } from "@/data/mockData";

interface CaseFinancialsProps {
  caseId: string;
}

export default function CaseFinancials({ caseId }: CaseFinancialsProps) {
  const caseData = useMemo(() => mockCases.find(c => c.id === caseId), [caseId]);
  
  if (!caseData) {
    return <div>Case not found</div>;
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate current interest
  const mortgage = caseData.mortgage;
  const startDate = new Date(mortgage.startDate);
  const today = new Date();
  const daysSinceMortgageStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  const accruedInterest = daysSinceMortgageStart * mortgage.perDiemInterest;

  // Mock legal fees and disbursements
  const legalFees = 3500;
  const disbursements = 875.50;
  const totalAmount = mortgage.currentBalance + accruedInterest + legalFees + disbursements;

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
                    <TableCell>{mortgage.interestRate}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Start Date</TableCell>
                    <TableCell>{formatDate(mortgage.startDate)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Current Balance</TableCell>
                    <TableCell className="font-bold">{formatCurrency(mortgage.currentBalance)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Per Diem Interest</TableCell>
                    <TableCell>{formatCurrency(mortgage.perDiemInterest)}/day</TableCell>
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
                    <TableCell>{formatCurrency(mortgage.currentBalance)}</TableCell>
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
                <p>{caseData.property.address.street}</p>
                <p>{caseData.property.address.city}, {caseData.property.address.province}</p>
                <p>{caseData.property.address.postalCode}</p>
                <p className="mt-2">PID: {caseData.property.pid}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Mortgagor</h3>
                {caseData.parties
                  .filter(p => p.type === "Borrower")
                  .map(party => (
                    <div key={party.id} className="mb-2">
                      <p>{party.name}</p>
                      {party.contactInfo.address && <p>{party.contactInfo.address}</p>}
                    </div>
                  ))
                }
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
                  <TableCell className="text-right">{formatCurrency(mortgage.currentBalance)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Interest to {new Date().toLocaleDateString()} @ {mortgage.interestRate}%</TableCell>
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
                    Per diem interest: {formatCurrency(mortgage.perDiemInterest)} per day after {new Date().toLocaleDateString()}
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
