
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Party } from "@/types";

interface RecentClientActivityProps {
  clients: Party[];
  onViewClient: (client: Party) => void;
}

export default function RecentClientActivity({ clients, onViewClient }: RecentClientActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Client Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.length > 0 ? (
            clients.slice(0, 3).map((client, index) => (
              <div 
                key={index} 
                className="p-3 border rounded-md cursor-pointer hover:bg-muted/50"
                onClick={() => onViewClient(client)}  
              >
                <div className="flex justify-between">
                  <div className="font-medium">Client Added</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {client.name} ({client.type})
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 border rounded-md text-center text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
