
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CaseListHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string | null;
  setFilterStatus: (status: string | null) => void;
  statuses: string[];
}

export default function CaseListHeader({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  statuses
}: CaseListHeaderProps) {
  const navigate = useNavigate();
  
  const handleNewCase = () => {
    navigate('/new-case');
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
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
      <Button className="bg-law-teal hover:bg-law-teal/90 ml-3" onClick={handleNewCase}>
        <Plus className="mr-2 h-4 w-4" />
        New Case
      </Button>
    </div>
  );
}
