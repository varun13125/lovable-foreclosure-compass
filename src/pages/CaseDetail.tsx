
import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { 
  ArrowLeft, Calendar, FileText, ClipboardList, 
  DollarSign, MessageSquare, Clock, AlertTriangle, Edit, Plus, Save, X 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import DocumentGenerator from "@/components/Documents/DocumentGenerator";
import { getStatusColor } from "@/data/mockData";
import { Case, Deadline, Party } from "@/types";
import CaseTimeline from "@/components/Cases/CaseTimeline";
import CaseDeadlines from "@/components/Cases/CaseDeadlines";
import CaseFinancials from "@/components/Cases/CaseFinancials";
import CaseParties from "@/components/Cases/CaseParties";
import CaseForm from "@/components/Cases/CaseForm";
import { supabase } from "@/integrations/supabase/client";
import AddDeadlineDialog from "@/components/Cases/AddDeadlineDialog";
import AddPartyDialog from "@/components/Cases/AddPartyDialog";

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<string>("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [addDeadlineOpen, setAddDeadlineOpen] = useState(false);
  const [addPartyOpen, setAddPartyOpen] = useState(false);
  
  // For financials section visibility
  const [financeLoading, setFinanceLoading] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchCase(id);
    }
  }, [id]);

  const fetchCase = async (caseId: string) => {
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
          notes,
          court_file_number,
          hearing_date,
          court_registry,
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
          ),
          deadlines (
            id,
            title,
            description,
            date,
            type,
            complete
          )
        `)
        .eq('id', caseId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        toast.error("Case not found");
        return;
      }

      // Transform the data to match the Case type
      const transformedCase: Case = {
        id: data.id,
        fileNumber: data.file_number,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        notes: data.notes || '',
        property: {
          id: data.property.id,
          address: {
            street: data.property.street,
            city: data.property.city,
            province: data.property.province || '',
            postalCode: data.property.postal_code || ''
          },
          pid: data.property.pid || '',
          legalDescription: data.property.legal_description || '',
          propertyType: data.property.property_type || 'Residential'
        },
        parties: data.parties.map((cp: any) => ({
          id: cp.party.id,
          name: cp.party.name,
          type: cp.party.type,
          contactInfo: {
            email: cp.party.email || '',
            phone: cp.party.phone || '',
            address: cp.party.address || ''
          }
        })),
        mortgage: {
          id: data.mortgage.id,
          registrationNumber: data.mortgage.registration_number,
          principal: data.mortgage.principal,
          interestRate: data.mortgage.interest_rate,
          startDate: data.mortgage.start_date,
          currentBalance: data.mortgage.current_balance,
          perDiemInterest: data.mortgage.per_diem_interest || 0
        },
        deadlines: data.deadlines.map((deadline: any) => ({
          id: deadline.id,
          title: deadline.title,
          description: deadline.description || '',
          date: deadline.date,
          type: deadline.type || 'Internal',
          complete: deadline.complete,
          caseId: caseId
        })),
        court: {
          fileNumber: data.court_file_number || '',
          registry: data.court_registry || '',
          hearingDate: data.hearing_date || null,
          judgeName: data.judge_name || ''
        },
        documents: []
      };

      setActiveCase(transformedCase);
      setNotes(transformedCase.notes || '');
    } catch (error) {
      console.error("Error fetching case:", error);
      toast.error("Failed to load case details", {
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!activeCase) return;
    
    try {
      const { error } = await supabase
        .from('cases')
        .update({ notes: notes })
        .eq('id', activeCase.id);
        
      if (error) throw error;
      
      toast.success("Notes updated successfully");
      setIsEditingNotes(false);
      
      // Update the local state
      setActiveCase({
        ...activeCase,
        notes: notes
      });
    } catch (error) {
      console.error("Error updating notes:", error);
      toast.error("Failed to update notes");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="md:pl-64">
          <Header />
          <main className="p-6">
            <div className="flex items-center mb-6">
              <Button variant="outline" size="sm" asChild className="mr-4">
                <Link to="/cases">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Cases
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Loading Case Details...</h1>
            </div>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-law-teal"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!activeCase) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="md:pl-64">
          <Header />
          <main className="p-6">
            <div className="flex items-center mb-6">
              <Button variant="outline" size="sm" asChild className="mr-4">
                <Link to="/cases">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Cases
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Case Not Found</h1>
            </div>
            <p className="text-muted-foreground">
              The requested case could not be found. Please return to the case list.
            </p>
          </main>
        </div>
      </div>
    );
  }

  // If in edit mode, render the CaseForm
  if (isEditMode) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="md:pl-64">
          <Header />
          <main className="p-6">
            <div className="flex items-center mb-6">
              <Button variant="outline" size="sm" asChild className="mr-4">
                <Link to={`/case/${id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Case
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Edit Case: {activeCase.fileNumber}</h1>
            </div>
            <CaseForm 
              caseData={activeCase}
              onCancel={() => {
                window.location.href = `/case/${id}`;
              }}
              onSuccess={(updatedCaseId) => {
                toast.success("Case updated successfully");
                window.location.href = `/case/${updatedCaseId}`;
              }}
              onError={(errorMessage) => {
                toast.error("Failed to update case", {
                  description: errorMessage || "Please try again."
                });
              }}
            />
          </main>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
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
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="flex items-center">
              <Button variant="outline" size="sm" asChild className="mr-4">
                <Link to="/cases">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{activeCase.fileNumber}</h1>
                  <Badge className={`${getStatusColor(activeCase.status)} hover:bg-opacity-80`}>
                    {activeCase.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {activeCase.property.address.street}, {activeCase.property.address.city}, {activeCase.property.address.province}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button variant="outline" className="gap-2" asChild>
                <Link to={`/case/${activeCase.id}?edit=true`}>
                  <Edit className="h-4 w-4" />
                  Edit Case
                </Link>
              </Button>
              <Button className="gap-2 bg-law-teal hover:bg-law-teal/90">
                <FileText className="h-4 w-4" />
                Generate Documents
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium">
                      {activeCase.property.address.street}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City:</span>
                    <span className="font-medium">
                      {activeCase.property.address.city}, {activeCase.property.address.province}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Postal Code:</span>
                    <span className="font-medium">
                      {activeCase.property.address.postalCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PID:</span>
                    <span className="font-medium">{activeCase.property.pid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{activeCase.property.propertyType}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Mortgage Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration #:</span>
                    <span className="font-medium">
                      {activeCase.mortgage.registrationNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal:</span>
                    <span className="font-medium">
                      {formatCurrency(activeCase.mortgage.principal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate:</span>
                    <span className="font-medium">
                      {activeCase.mortgage.interestRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Balance:</span>
                    <span className="font-medium text-law-navy">
                      {formatCurrency(activeCase.mortgage.currentBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per Diem:</span>
                    <span className="font-medium">
                      {formatCurrency(activeCase.mortgage.perDiemInterest)}/day
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Key Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Opened:</span>
                    <span className="font-medium">{formatDate(activeCase.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">{formatDate(activeCase.updatedAt)}</span>
                  </div>
                  
                  {activeCase.court?.hearingDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hearing Date:</span>
                      <span className="font-medium">{formatDate(activeCase.court.hearingDate)}</span>
                    </div>
                  )}
                  
                  {activeCase.deadlines.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Deadline:</span>
                      <span className="font-medium text-law-amber">
                        {formatDate(activeCase.deadlines[0].date)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="parties">Parties</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  <CaseTimeline caseId={activeCase.id} />
                </div>
                <div className="col-span-1">
                  <Card className="shadow-sm h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Deadlines
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => setAddDeadlineOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <CaseDeadlines caseId={activeCase.id} limit={5} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="parties">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Case Parties</h2>
                <Button className="gap-2" onClick={() => setAddPartyOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Party
                </Button>
              </div>
              <CaseParties caseId={activeCase.id} />
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Case Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentGenerator caseId={activeCase.id} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deadlines">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">All Deadlines</h2>
                <Button className="gap-2" onClick={() => setAddDeadlineOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Deadline
                </Button>
              </div>
              <CaseDeadlines caseId={activeCase.id} />
            </TabsContent>
            
            <TabsContent value="financials">
              <CaseFinancials caseId={activeCase.id} />
            </TabsContent>
            
            <TabsContent value="notes">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Case Notes</CardTitle>
                  {!isEditingNotes ? (
                    <Button size="sm" variant="outline" onClick={() => setIsEditingNotes(true)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit Notes
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveNotes}>
                        <Save className="h-4 w-4 mr-2" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setNotes(activeCase.notes || '');
                        setIsEditingNotes(false);
                      }}>
                        <X className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditingNotes ? (
                    <Textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[300px] w-full"
                      placeholder="Enter case notes here..."
                    />
                  ) : (
                    <div className="border rounded-lg p-4 min-h-[300px] whitespace-pre-wrap">
                      {activeCase.notes || "No notes have been added to this case."}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Add Deadline Dialog */}
      <AddDeadlineDialog 
        open={addDeadlineOpen} 
        onOpenChange={setAddDeadlineOpen} 
        caseId={activeCase.id} 
        onSuccess={() => {
          fetchCase(activeCase.id);
          toast.success("Deadline added successfully");
        }}
      />
      
      {/* Add Party Dialog */}
      <AddPartyDialog 
        open={addPartyOpen} 
        onOpenChange={setAddPartyOpen} 
        caseId={activeCase.id}
        onSuccess={() => {
          fetchCase(activeCase.id);
          toast.success("Party added successfully");
        }}
      />
    </div>
  );
}
