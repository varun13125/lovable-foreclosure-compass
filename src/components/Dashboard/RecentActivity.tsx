
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockRecentActivity, getCaseById } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";

export default function RecentActivity() {
  // Sort activities by timestamp (most recent first)
  const sortedActivities = [...mockRecentActivity].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  // Get case file number by case ID
  const getCaseFileNumber = (caseId: string) => {
    const caseData = getCaseById(caseId);
    return caseData?.fileNumber || 'Unknown';
  };

  return (
    <Card className="col-span-1 shadow-sm">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates across all cases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          <div className="space-y-4">
            {sortedActivities.map((activity) => (
              <div key={activity.id} className="flex items-start pb-4 last:pb-0 border-b last:border-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-law-teal"></div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <span className="font-medium text-sm">
                      {activity.action}
                    </span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {getCaseFileNumber(activity.caseId)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {activity.details}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium">
                      {activity.user}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getRelativeTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
