
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, MapPin, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Party } from "@/types";
import EditPartyDialog from "./EditPartyDialog";

interface CasePartiesProps {
  caseId: string;
}

export default function CaseParties({ caseId }: CasePartiesProps) {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [editParty, setEditParty] = useState<Party | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchParties();
  }, [caseId]);
  
  const fetchParties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('case_parties')
        .select(`
          party:parties(
            id,
            name,
            type,
            email,
            phone,
            address
          )
        `)
        .eq('case_id', caseId);

      if (error) {
        throw error;
      }

      // Transform data to match Party type
      const transformedParties: Party[] = data?.map((item) => ({
        id: item.party.id,
        name: item.party.name,
        type: item.party.type,
        contactInfo: {
          email: item.party.email || '',
          phone: item.party.phone || '',
          address: item.party.address || '',
        }
      })) || [];

      setParties(transformedParties);
    } catch (error) {
      console.error("Error fetching parties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group parties by type
  const partyGroups = {
    Borrower: parties.filter(p => p.type === "Borrower"),
    Lender: parties.filter(p => p.type === "Lender"),
    ThirdParty: parties.filter(p => p.type === "ThirdParty"),
    Lawyer: parties.filter(p => p.type === "Lawyer"),
    Client: parties.filter(p => p.type === "Client")
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
  
  const handleEditParty = (party: Party) => {
    setEditParty(party);
    setIsEditDialogOpen(true);
  };
  
  const handleEditSuccess = () => {
    fetchParties();
    setIsEditDialogOpen(false);
    setEditParty(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-law-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">      
      {parties.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No parties have been added to this case.</p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Party
            </Button>
          </CardContent>
        </Card>
      ) : (
        (Object.keys(partyGroups) as Array<keyof typeof partyGroups>).map(type => 
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditParty(party)}
                        >
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
        )
      )}
      
      {editParty && (
        <EditPartyDialog 
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          party={editParty}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
