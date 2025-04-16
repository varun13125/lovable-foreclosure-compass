
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, MapPin, Edit } from "lucide-react";
import { mockCases } from "@/data/mockData";

interface CasePartiesProps {
  caseId: string;
}

export default function CaseParties({ caseId }: CasePartiesProps) {
  const caseData = useMemo(() => mockCases.find(c => c.id === caseId), [caseId]);
  
  if (!caseData) {
    return <div>Case not found</div>;
  }
  
  // Group parties by type
  const partyGroups = {
    Borrower: caseData.parties.filter(p => p.type === "Borrower"),
    Lender: caseData.parties.filter(p => p.type === "Lender"),
    ThirdParty: caseData.parties.filter(p => p.type === "ThirdParty"),
    Lawyer: caseData.parties.filter(p => p.type === "Lawyer"),
    Client: caseData.parties.filter(p => p.type === "Client")
  };

  const partyTypeLabels = {
    Borrower: "Borrowers / Mortgagors",
    Lender: "Lenders / Mortgagees",
    ThirdParty: "Third Parties",
    Lawyer: "Lawyers",
    Client: "Clients"
  };
  
  const partyTypeBadgeColors = {
    Borrower: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Lender: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    ThirdParty: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    Lawyer: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    Client: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Case Parties</h2>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Party
        </Button>
      </div>
      
      {(Object.keys(partyGroups) as Array<keyof typeof partyGroups>).map(type => 
        partyGroups[type].length > 0 && (
          <Card key={type} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{partyTypeLabels[type] || type}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partyGroups[type].map(party => (
                  <div key={party.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-base">{party.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`mt-1 ${partyTypeBadgeColors[type]}`}
                        >
                          {party.type}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {party.contactInfo.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${party.contactInfo.email}`} className="text-law-navy hover:underline">
                            {party.contactInfo.email}
                          </a>
                        </div>
                      )}
                      
                      {party.contactInfo.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${party.contactInfo.phone}`} className="hover:underline">
                            {party.contactInfo.phone}
                          </a>
                        </div>
                      )}
                      
                      {party.contactInfo.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground">
                            {party.contactInfo.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
