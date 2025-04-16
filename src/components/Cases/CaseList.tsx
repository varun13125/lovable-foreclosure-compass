
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, MoreHorizontal, Eye, FileEdit } from "lucide-react";
import { mockCases, getStatusColor } from "@/data/mockData";
import { Case } from "@/types";

export default function CaseList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredCases = mockCases.filter((caseItem) => {
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
  const statuses = Array.from(new Set(mockCases.map((caseItem) => caseItem.status)));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const handleNewCase = () => {
    // This would navigate to the case creation form in a real application
    console.log("Create new case clicked");
  };

  const handleViewCase = (caseId: string) => {
    console.log(`View case ${caseId}`);
  };

  const handleEditCase = (caseId: string) => {
    console.log(`Edit case ${caseId}`);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Active Cases</CardTitle>
          <Button className="bg-law-teal hover:bg-law-teal/90" onClick={handleNewCase}>
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {filterStatus || "All Statuses"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                All Statuses
              </DropdownMenuItem>
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Number</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    No cases match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">{caseItem.fileNumber}</TableCell>
                    <TableCell>
                      {caseItem.property.address.street}, {caseItem.property.address.city}
                    </TableCell>
                    <TableCell>
                      {caseItem.parties.find((p) => p.type === "Borrower")?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(caseItem.status)} hover:bg-opacity-80`}>
                        {caseItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(caseItem.mortgage.currentBalance)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleViewCase(caseItem.id)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEditCase(caseItem.id)}
                            className="cursor-pointer"
                          >
                            <FileEdit className="mr-2 h-4 w-4" /> Edit Case
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
  );
}
