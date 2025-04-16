
import { useState } from "react";
import { Search, Filter, Plus, MoreHorizontal, Eye, FileEdit, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { mockCases } from "@/data/mockData";
import { Party } from "@/types";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Extract all clients and borrowers from all cases
  const partiesByType: Record<string, Party[]> = {
    Client: [],
    Borrower: [],
    Lender: [],
    ThirdParty: [],
    Lawyer: []
  };
  
  mockCases.forEach(c => {
    if (c.parties && c.parties.length > 0) {
      c.parties.forEach(p => {
        if (partiesByType[p.type]) {
          // Check if this party is already in the array
          const existingParty = partiesByType[p.type].find(existing => existing.id === p.id);
          if (!existingParty) {
            partiesByType[p.type].push({...p});
          }
        }
      });
    }
  });
  
  // Count number of cases per client
  const clientCaseCounts: Record<string, number> = {};
  mockCases.forEach(c => {
    c.parties.forEach(p => {
      if (p.type === "Client" || p.type === "Borrower") {
        if (!clientCaseCounts[p.id]) {
          clientCaseCounts[p.id] = 1;
        } else {
          clientCaseCounts[p.id]++;
        }
      }
    });
  });
  
  // Filter clients based on search query
  const filteredClients = [...partiesByType.Client, ...partiesByType.Borrower]
    .filter(client =>
      searchQuery === "" ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contactInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.contactInfo.address && client.contactInfo.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
              <Button className="bg-law-teal hover:bg-law-teal/90">
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
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      All Types
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuItem>All Types</DropdownMenuItem>
                    <DropdownMenuItem>Clients Only</DropdownMenuItem>
                    <DropdownMenuItem>Borrowers Only</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Cases</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                          No clients match your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.type}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <a href={`mailto:${client.contactInfo.email}`} className="text-sm hover:underline">
                                  {client.contactInfo.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <a href={`tel:${client.contactInfo.phone}`} className="text-sm hover:underline">
                                  {client.contactInfo.phone}
                                </a>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="bg-muted/50 rounded px-2 py-0.5 text-center text-sm">
                              {clientCaseCounts[client.id] || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <FileEdit className="mr-2 h-4 w-4" /> Edit Client
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <div className="font-medium">Borrowers</div>
                      <div className="text-sm text-muted-foreground">Mortgage borrowers</div>
                    </div>
                    <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 font-medium rounded px-2 py-1">
                      {partiesByType.Borrower.length}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <div className="font-medium">Lenders</div>
                      <div className="text-sm text-muted-foreground">Financial institutions</div>
                    </div>
                    <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 font-medium rounded px-2 py-1">
                      {partiesByType.Lender.length}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <div className="font-medium">Third Parties</div>
                      <div className="text-sm text-muted-foreground">Other stakeholders</div>
                    </div>
                    <div className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 font-medium rounded px-2 py-1">
                      {partiesByType.ThirdParty.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Client Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCases[0].documents.slice(0, 3).map((doc, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex justify-between">
                        <div className="font-medium">Document Generated</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {doc.title} for {mockCases[0].parties.find(p => p.type === "Borrower")?.name}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
