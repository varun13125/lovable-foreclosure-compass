
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Party } from "@/types";

interface ClientTypesProps {
  partiesByType: Record<string, Party[]>;
  onClientTypeClick: (type: string) => void;
}

export default function ClientTypeCard({ partiesByType, onClientTypeClick }: ClientTypesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div 
            className="flex justify-between items-center p-3 border rounded-md cursor-pointer hover:bg-muted/50"
            onClick={() => onClientTypeClick("Borrower")}
          >
            <div>
              <div className="font-medium">Borrowers</div>
              <div className="text-sm text-muted-foreground">Mortgage borrowers</div>
            </div>
            <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 font-medium rounded px-2 py-1">
              {partiesByType.Borrower.length}
            </div>
          </div>
          
          <div 
            className="flex justify-between items-center p-3 border rounded-md cursor-pointer hover:bg-muted/50"
            onClick={() => onClientTypeClick("Lender")}
          >
            <div>
              <div className="font-medium">Lenders</div>
              <div className="text-sm text-muted-foreground">Financial institutions</div>
            </div>
            <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 font-medium rounded px-2 py-1">
              {partiesByType.Lender.length}
            </div>
          </div>
          
          <div 
            className="flex justify-between items-center p-3 border rounded-md cursor-pointer hover:bg-muted/50"
            onClick={() => onClientTypeClick("ThirdParty")}
          >
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
  );
}
