
import { useState } from "react";
import { Search, Filter, Eye, FileEdit } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { Mail, Phone, MoreHorizontal } from "lucide-react";
import { Party } from "@/types";

interface ClientListProps {
  clients: Party[];
  isLoading: boolean;
  clientCaseCounts: Record<string, number>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  partyFilter: string;
  setPartyFilter: (filter: string) => void;
  onViewClient: (client: Party) => void;
  onEditClient: (client: Party) => void;
}

export default function ClientList({
  clients,
  isLoading,
  clientCaseCounts,
  searchQuery,
  setSearchQuery,
  partyFilter,
  setPartyFilter,
  onViewClient,
  onEditClient
}: ClientListProps) {
  // Filter clients based on search query and party type filter
  const filteredClients = clients.filter(client =>
    (partyFilter === "All" || client.type === partyFilter) &&
    (searchQuery === "" ||
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contactInfo.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.contactInfo.address && client.contactInfo.address.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div>
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
              {partyFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => setPartyFilter("All")}>All Types</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPartyFilter("Client")}>Clients Only</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPartyFilter("Borrower")}>Borrowers Only</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPartyFilter("Lender")}>Lenders Only</DropdownMenuItem>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  Loading clients...
                </TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                  No clients match your search
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer" onClick={() => onViewClient(client)}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.type}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={`mailto:${client.contactInfo.email}`} 
                          className="text-sm hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {client.contactInfo.email || 'No email'}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={`tel:${client.contactInfo.phone}`} 
                          className="text-sm hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {client.contactInfo.phone || 'No phone'}
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
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewClient(client);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditClient(client);
                          }}
                        >
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
    </div>
  );
}
