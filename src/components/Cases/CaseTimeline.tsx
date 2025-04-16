
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types";

interface CaseTimelineProps {
  caseId: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  status: "completed" | "in-progress";
}

export default function CaseTimeline({ caseId }: CaseTimelineProps) {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  useEffect(() => {
    fetchCaseData();
    fetchDocuments();
  }, [caseId]);
  
  const fetchCaseData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id, 
          file_number,
          created_at,
          deadlines(
            id,
            title,
            description,
            date,
            complete
          )
        `)
        .eq('id', caseId)
        .single();
        
      if (error) {
        throw error;
      }
      
      setCaseData(data);
    } catch (error) {
      console.error("Error fetching case data:", error);
    }
  };
  
  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setDocuments(data || []);
      
      // Now construct timeline events
      buildTimelineEvents(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const buildTimelineEvents = (docs: any[]) => {
    if (!caseData) return;
    
    // Create timeline events from case data
    const events: TimelineEvent[] = [
      {
        date: caseData.created_at,
        title: "Case Opened",
        description: `File ${caseData.file_number} created`,
        status: "completed"
      }
    ];
    
    // Add document events
    if (docs.length > 0) {
      docs.forEach(doc => {
        events.push({
          date: doc.created_at,
          title: `Document: ${doc.title}`,
          description: `${doc.type} - ${doc.status}`,
          status: doc.status === "Finalized" ? "completed" : "in-progress"
        });
      });
    }
    
    // Add completed deadlines
    if (caseData.deadlines) {
      caseData.deadlines
        .filter((d: any) => d.complete)
        .forEach((deadline: any) => {
          events.push({
            date: deadline.date,
            title: deadline.title,
            description: deadline.description || '',
            status: "completed"
          });
        });
    }
    
    // Sort by date descending
    const sortedEvents = events.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setTimelineEvents(sortedEvents);
  };
  
  useEffect(() => {
    if (caseData && documents) {
      buildTimelineEvents(documents);
    }
  }, [caseData, documents]);

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Case Timeline</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-law-teal"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Case Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {timelineEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No timeline events available</p>
          </div>
        ) : (
          <div className="relative pl-6 border-l space-y-6">
            {timelineEvents.map((event, i) => (
              <div key={i} className="relative pb-6">
                <div className="absolute -left-[25px] h-10 w-10 rounded-full bg-background border-2 flex items-center justify-center">
                  <div className={`h-3 w-3 rounded-full ${
                    event.status === "completed" ? "bg-law-teal" : "bg-law-amber"
                  }`}></div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                  <h4 className="text-base font-medium mt-1">{event.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
