
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

import { mockCases } from "@/data/mockData";
import { Deadline } from "@/types";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  
  // Extract all deadlines from all cases
  const allDeadlines: (Deadline & { caseFileNumber: string; caseId: string })[] = [];
  mockCases.forEach(c => {
    if (c.deadlines && c.deadlines.length > 0) {
      c.deadlines.forEach(d => {
        allDeadlines.push({
          ...d,
          caseFileNumber: c.fileNumber,
          caseId: c.id
        });
      });
    }
  });
  
  // Filter deadlines for the selected date
  const selectedDateDeadlines = allDeadlines.filter(deadline => {
    if (!date) return false;
    const deadlineDate = new Date(deadline.date);
    return (
      deadlineDate.getDate() === date.getDate() &&
      deadlineDate.getMonth() === date.getMonth() &&
      deadlineDate.getFullYear() === date.getFullYear()
    );
  });
  
  // Create a lookup for deadlines by date
  const deadlinesByDate: Record<string, typeof allDeadlines> = {};
  allDeadlines.forEach(deadline => {
    const deadlineDate = new Date(deadline.date).toISOString().split('T')[0];
    if (!deadlinesByDate[deadlineDate]) {
      deadlinesByDate[deadlineDate] = [];
    }
    deadlinesByDate[deadlineDate].push(deadline);
  });
  
  // Generate dates with deadlines for calendar highlighting
  const datesWithDeadlines = Object.keys(deadlinesByDate).map(dateStr => new Date(dateStr));
  
  // Function to check if a date has deadlines
  const hasDeadlines = (day: Date) => {
    return datesWithDeadlines.some(date => 
      date.getDate() === day.getDate() &&
      date.getMonth() === day.getMonth() &&
      date.getFullYear() === day.getFullYear()
    );
  };
  
  const getDeadlineTypeColor = (type: string) => {
    switch (type) {
      case 'Statutory':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Court':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Internal':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'Client':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Calendar</h1>
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline">Today</Button>
              <Button variant="outline" className="gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button className="gap-2 bg-law-teal hover:bg-law-teal/90">
                <Plus className="h-4 w-4" />
                New Deadline
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>View and manage all case deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-semibold">
                      {date ? format(date, 'MMMM yyyy') : ''}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant={view === 'month' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setView('month')}
                      >
                        Month
                      </Button>
                      <Button 
                        variant={view === 'week' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setView('week')}
                      >
                        Week
                      </Button>
                      <Button 
                        variant={view === 'day' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setView('day')}
                      >
                        Day
                      </Button>
                    </div>
                  </div>
                  
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
                </div>
              </CardContent>
            </Card>
            
            <div className="lg:col-span-4 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Select a date'}
                    </CardTitle>
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedDateDeadlines.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No deadlines scheduled for this date
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateDeadlines.map((deadline) => (
                        <div key={deadline.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{deadline.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {deadline.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className={getDeadlineTypeColor(deadline.type)}>
                                  {deadline.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {deadline.caseFileNumber}
                                </span>
                              </div>
                            </div>
                            <div className={`h-2 w-2 rounded-full ${deadline.complete ? 'bg-green-500' : 'bg-amber-500'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allDeadlines
                      .filter(d => !d.complete && new Date(d.date) >= new Date())
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .slice(0, 5)
                      .map(deadline => (
                        <div key={deadline.id} className="flex justify-between p-2 border-b last:border-b-0">
                          <div>
                            <div className="font-medium">{deadline.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {deadline.caseFileNumber}
                            </div>
                          </div>
                          <div className="text-sm">
                            {format(new Date(deadline.date), 'MMM d')}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Case</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDeadlines
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 10)
                    .map(deadline => (
                      <TableRow key={deadline.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{deadline.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {deadline.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{deadline.caseFileNumber}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getDeadlineTypeColor(deadline.type)}>
                            {deadline.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(deadline.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          {deadline.complete ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
