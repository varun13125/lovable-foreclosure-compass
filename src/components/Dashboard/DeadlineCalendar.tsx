
import { useCallback, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockCases } from "@/data/mockData";
import { Deadline } from "@/types";

export default function DeadlineCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Extract all deadlines from all cases
  const allDeadlines = useMemo(() => {
    const deadlines: (Deadline & { caseFileNumber: string })[] = [];
    
    mockCases.forEach(c => {
      if (c.deadlines && c.deadlines.length > 0) {
        c.deadlines.forEach(d => {
          deadlines.push({
            ...d,
            caseFileNumber: c.fileNumber
          });
        });
      }
    });
    
    return deadlines;
  }, []);

  // Create a lookup for deadlines by date
  const deadlinesByDate = useMemo(() => {
    const lookup: Record<string, (Deadline & { caseFileNumber: string })[]> = {};
    
    allDeadlines.forEach(deadline => {
      const deadlineDate = new Date(deadline.date).toISOString().split('T')[0];
      if (!lookup[deadlineDate]) {
        lookup[deadlineDate] = [];
      }
      lookup[deadlineDate].push(deadline);
    });
    
    return lookup;
  }, [allDeadlines]);

  // Generate dates with deadlines for calendar highlighting
  const datesWithDeadlines = useMemo(() => {
    return Object.keys(deadlinesByDate).map(dateStr => new Date(dateStr));
  }, [deadlinesByDate]);

  // Function to check if a date has deadlines
  const hasDeadlines = useCallback(
    (day: Date) => {
      return datesWithDeadlines.some(
        (date) => date.toDateString() === day.toDateString()
      );
    },
    [datesWithDeadlines]
  );

  // Get deadlines for selected date
  const selectedDateDeadlines = useMemo(() => {
    if (!date) return [];
    
    const dateString = date.toISOString().split('T')[0];
    return deadlinesByDate[dateString] || [];
  }, [date, deadlinesByDate]);

  return (
    <Card className="col-span-1 shadow-sm">
      <CardHeader>
        <CardTitle>Deadlines</CardTitle>
        <CardDescription>
          Track and manage upcoming case deadlines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="mx-auto"
          modifiersClassNames={{
            today: "bg-law-teal text-white",
          }}
          modifiers={{
            hasDeadline: hasDeadlines,
          }}
          modifiersStyles={{
            hasDeadline: { 
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: "var(--law-amber)",
            }
          }}
        />
        
        <div className="mt-4">
          <h3 className="font-medium mb-2">
            {date?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <ScrollArea className="h-[120px]">
            {selectedDateDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">No deadlines for this date</p>
            ) : (
              <div className="space-y-2">
                {selectedDateDeadlines.map((deadline) => (
                  <div key={deadline.id} className="p-2 border rounded text-left">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{deadline.title}</span>
                      <span className="text-xs bg-law-slate text-white px-1.5 py-0.5 rounded">
                        {deadline.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {deadline.caseFileNumber}: {deadline.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
