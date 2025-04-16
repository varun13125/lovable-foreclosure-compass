
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import ClientForm from "@/components/Clients/ClientForm";
import ClientList from "@/components/Clients/ClientList";
import ClientTypeCard from "@/components/Clients/ClientTypeCard";
import RecentClientActivity from "@/components/Clients/RecentClientActivity";
import ClientViewDialog from "@/components/Clients/ClientViewDialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Party } from "@/types";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [isViewClientOpen, setIsViewClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Party | null>(null);
  const [clients, setClients] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [partyFilter, setPartyFilter] = useState<string>("All");
  const [clientCaseCounts, setClientCaseCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load clients from supabase
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('parties')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      // Transform database structure to match Party interface
      const transformedParties: Party[] = data.map(party => ({
        id: party.id,
        name: party.name,
        type: party.type,
        contactInfo: {
          email: party.email || '',
          phone: party.phone || '',
          address: party.address || '',
        }
      }));
      
      setClients(transformedParties);
      
      // Fetch case counts for each client
      fetchCaseCounts(transformedParties);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Error loading clients",
        description: "There was a problem loading the client list.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch case counts for clients
  const fetchCaseCounts = async (clientsList: Party[]) => {
    try {
      const { data, error } = await supabase
        .from('case_parties')
        .select('party_id, case_id');
        
      if (error) {
        throw error;
      }
      
      // Count cases per client
      const counts: Record<string, number> = {};
      
      data.forEach(item => {
        if (counts[item.party_id]) {
          counts[item.party_id]++;
        } else {
          counts[item.party_id] = 1;
        }
      });
      
      setClientCaseCounts(counts);
    } catch (error) {
      console.error('Error fetching case counts:', error);
    }
  };
  
  useEffect(() => {
    fetchClients();
  }, []);
  
  // Group clients by type for stats
  const partiesByType: Record<string, Party[]> = {
    Client: [],
    Borrower: [],
    Lender: [],
    ThirdParty: [],
    Lawyer: []
  };
  
  clients.forEach(party => {
    if (partiesByType[party.type]) {
      partiesByType[party.type].push(party);
    }
  });

  const handleViewClient = (client: Party) => {
    setSelectedClient(client);
    setIsViewClientOpen(true);
  };

  const handleEditClient = (client: Party) => {
    setSelectedClient(client);
    setIsEditClientOpen(true);
  };

  const handleClientTypeClick = (type: string) => {
    setPartyFilter(type);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Clients</h1>
              <p className="text-muted-foreground">Manage clients and borrowers</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                className="bg-law-teal hover:bg-law-teal/90"
                onClick={() => setIsAddClientOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Client
              </Button>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Client Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientList 
                clients={clients}
                isLoading={isLoading}
                clientCaseCounts={clientCaseCounts}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                partyFilter={partyFilter}
                setPartyFilter={setPartyFilter}
                onViewClient={handleViewClient}
                onEditClient={handleEditClient}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <ClientTypeCard 
              partiesByType={partiesByType} 
              onClientTypeClick={handleClientTypeClick}
            />
            
            <RecentClientActivity 
              clients={clients}
              onViewClient={handleViewClient}
            />
          </div>
        </main>
      </div>
      
      {/* Add Client Dialog */}
      <ClientForm 
        open={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onSuccess={() => fetchClients()}
      />

      {/* View Client Dialog */}
      <ClientViewDialog
        open={isViewClientOpen}
        onClose={() => setIsViewClientOpen(false)}
        client={selectedClient}
        clientCaseCounts={clientCaseCounts}
        onEdit={handleEditClient}
      />

      {/* Edit Client Dialog */}
      <ClientForm
        open={isEditClientOpen}
        onClose={() => setIsEditClientOpen(false)}
        onSuccess={() => fetchClients()}
        initialData={selectedClient || undefined}
      />
    </div>
  );
}
