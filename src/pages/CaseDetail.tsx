
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, Calendar, FileText, ClipboardList, 
  DollarSign, MessageSquare, Clock, AlertTriangle 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { mockCases, getStatusColor } from "@/data/mockData";
import { Case } from "@/types";
import CaseTimeline from "@/components/Cases/CaseTimeline";
import CaseDeadlines from "@/components/Cases/CaseDeadlines";
import CaseFinancials from "@/components/Cases/CaseFinancials";
import CaseParties from "@/components/Cases/CaseParties";

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeCase, setActiveCase] = useState<Case | undefined>(
    mockCases.find((c) => c.id === id)
  );

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
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
              <Button variant="outline" className="gap-2">
                <Clock className="h-4 w-4" />
                Update Status
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
                  <CaseDeadlines caseId={activeCase.id} limit={5} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="parties">
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
              <CaseDeadlines caseId={activeCase.id} />
            </TabsContent>
            
            <TabsContent value="financials">
              <CaseFinancials caseId={activeCase.id} />
            </TabsContent>
            
            <TabsContent value="notes">
              <Card>
                <CardHeader>
                  <CardTitle>Case Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 min-h-[300px]">
                    {activeCase.notes || "No notes have been added to this case."}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button>Edit Notes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
