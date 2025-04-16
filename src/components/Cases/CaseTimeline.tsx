
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCases } from "@/data/mockData";

interface CaseTimelineProps {
  caseId: string;
}

export default function CaseTimeline({ caseId }: CaseTimelineProps) {
  const caseData = useMemo(() => mockCases.find(c => c.id === caseId), [caseId]);
  
  if (!caseData) {
    return <div>Case not found</div>;
  }
  
  // Create timeline events from case data
  const timelineEvents = [
    {
      date: caseData.createdAt,
      title: "Case Opened",
      description: `File ${caseData.fileNumber} created`,
      status: "completed"
    },
    ...(caseData.documents.map(doc => ({
      date: doc.createdAt,
      title: `Document: ${doc.title}`,
      description: `${doc.type} - ${doc.status}`,
      status: doc.status === "Finalized" ? "completed" : "in-progress"
    }))),
    ...(caseData.deadlines.filter(d => d.complete).map(deadline => ({
      date: deadline.date,
      title: deadline.title,
      description: deadline.description,
      status: "completed"
    })))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Case Timeline</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
