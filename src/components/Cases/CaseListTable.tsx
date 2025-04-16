
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, FileEdit } from "lucide-react";
import { getStatusColor } from "@/data/mockData";
import { Case } from "@/types";

interface CaseListTableProps {
  cases: Case[];
  loading: boolean;
  formatCurrency: (amount: number) => string;
}

export default function CaseListTable({ cases, loading, formatCurrency }: CaseListTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-law-teal"></div>
        <span className="ml-2">Loading cases...</span>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="text-center h-32 flex items-center justify-center text-muted-foreground">
        No cases match your filters
      </div>
    );
  }

  return (
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
        {cases.map((caseItem) => (
          <TableRow key={caseItem.id} className="hover:bg-muted/50">
            <TableCell className="font-medium">
              <Link to={`/case/${caseItem.id}`} className="hover:underline text-law-navy">
                {caseItem.fileNumber}
              </Link>
            </TableCell>
            <TableCell>
              {caseItem.property?.address?.street}, {caseItem.property?.address?.city}
            </TableCell>
            <TableCell>
              {caseItem.parties?.find((p) => p.type === "Borrower")?.name || "N/A"}
            </TableCell>
            <TableCell>
              <Badge className={`${getStatusColor(caseItem.status)} hover:bg-opacity-80`}>
                {caseItem.status}
              </Badge>
            </TableCell>
            <TableCell>{formatCurrency(caseItem.mortgage?.currentBalance || 0)}</TableCell>
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
                    asChild
                    className="cursor-pointer"
                  >
                    <Link to={`/case/${caseItem.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    asChild 
                    className="cursor-pointer"
                  >
                    <Link to={`/case/${caseItem.id}?edit=true`}>
                      <FileEdit className="mr-2 h-4 w-4" /> Edit Case
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
