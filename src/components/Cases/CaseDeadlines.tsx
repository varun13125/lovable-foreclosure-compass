
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Deadline } from "@/types";

interface CaseDeadlinesProps {
  caseId: string;
  limit?: number;
}

export default function CaseDeadlines({ caseId, limit }: CaseDeadlinesProps) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDeadlines();
  }, [caseId]);
  
  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('case_id', caseId)
        .order('date', { ascending: true })
        .order('complete', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      // Transform data to match Deadline type
      const transformedDeadlines: Deadline[] = data?.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        date: item.date,
        type: item.type,
        complete: item.complete,
        caseId: item.case_id
      })) || [];
      
      setDeadlines(transformedDeadlines);
    } catch (error) {
      console.error("Error fetching deadlines:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Apply limit if provided
  const displayDeadlines = limit ? deadlines.slice(0, limit) : deadlines;

  // Function to format relative dates
  const getRelativeDate = (dateStr: string) => {
    const deadline = new Date(dateStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays < 14) {
      return `In ${diffDays} days`;
    } else {
      return new Date(dateStr).toLocaleDateString("en-CA", {
        month: "short",
        day: "numeric"
      });
    }
  };
  
  // Function to get priority based on days remaining
  const getPriority = (deadline: Deadline) => {
    if (deadline.complete) return "completed";
    
    const diffDays = Math.ceil(
      (new Date(deadline.date).getTime() - new Date().getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    if (diffDays < 0) return "overdue";
    if (diffDays < 3) return "urgent";
    if (diffDays < 7) return "high";
    return "normal";
  };
  
  const toggleDeadlineComplete = async (deadline: Deadline) => {
    try {
      const { error } = await supabase
        .from('deadlines')
        .update({ complete: !deadline.complete })
        .eq('id', deadline.id);
        
      if (error) throw error;
      
      // Update local state
      setDeadlines(deadlines.map(d => 
        d.id === deadline.id ? { ...d, complete: !d.complete } : d
      ));
    } catch (error) {
      console.error("Error updating deadline:", error);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            {limit ? "Upcoming Deadlines" : "All Deadlines"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-law-teal"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          {limit ? "Upcoming Deadlines" : "All Deadlines"}
        </CardTitle>
        {limit && displayDeadlines.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs">
            View All
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {displayDeadlines.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No deadlines found for this case</p>
            <Button className="mt-4" size="sm">Add Deadline</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayDeadlines.map((deadline) => {
              const priority = getPriority(deadline);
              return (
                <div 
                  key={deadline.id} 
                  className={`p-3 rounded-md border flex items-start justify-between ${
                    priority === "overdue" ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/30" :
                    priority === "urgent" ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30" :
                    priority === "completed" ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30" :
                    ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={deadline.complete} 
                      onCheckedChange={() => toggleDeadlineComplete(deadline)}
                    />
                    <div>
                      <div className="font-medium">{deadline.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {deadline.description}
                      </div>
                      <div className="flex gap-2 items-center mt-1">
                        <Badge variant="outline" className="text-xs">
                          {deadline.type}
                        </Badge>
                        <span className={`text-xs ${
                          priority === "overdue" ? "text-red-600 dark:text-red-400" :
                          priority === "urgent" ? "text-amber-600 dark:text-amber-400" :
                          priority === "completed" ? "text-green-600 dark:text-green-400" :
                          "text-muted-foreground"
                        }`}>
                          {getRelativeDate(deadline.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
