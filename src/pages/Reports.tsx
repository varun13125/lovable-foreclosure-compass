
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Check, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { supabase } from "@/integrations/supabase/client";

export default function Reports() {
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [format, setFormat] = useState("pdf");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast.error("Please select a report type");
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Report generated successfully", {
        description: `Your ${reportType} report is ready to download.`,
        action: {
          label: "Download",
          onClick: () => {
            // Simulate download
            console.log("Downloading report:", reportType);
          },
        },
      });
    }, 2000);
  };

  const getReportDescription = () => {
    switch (reportType) {
      case "case-status":
        return "Summary of all case statuses and their counts";
      case "financial":
        return "Financial overview of all active cases";
      case "activity":
        return "Timeline of all activities across cases";
      case "custom":
        return "Create a custom report with specific parameters";
      default:
        return "Select a report type to see its description";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Reports</h1>
              <p className="text-muted-foreground">View and export case analytics and reports</p>
            </div>
            <Button 
              className="bg-law-teal hover:bg-law-teal/90"
              onClick={handleGenerateReport}
              disabled={!reportType || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Report Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div 
                      className={cn(
                        "p-4 border rounded-md cursor-pointer",
                        reportType === "case-status" ? "border-law-teal bg-law-teal/5" : "hover:bg-muted/50"
                      )}
                      onClick={() => setReportType("case-status")}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Case Status Summary</h3>
                        {reportType === "case-status" && <Check className="h-4 w-4 text-law-teal" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Overview of cases by status
                      </p>
                    </div>
                    
                    <div 
                      className={cn(
                        "p-4 border rounded-md cursor-pointer",
                        reportType === "financial" ? "border-law-teal bg-law-teal/5" : "hover:bg-muted/50"
                      )}
                      onClick={() => setReportType("financial")}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Financial Reports</h3>
                        {reportType === "financial" && <Check className="h-4 w-4 text-law-teal" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Financial summaries and projections
                      </p>
                    </div>
                    
                    <div 
                      className={cn(
                        "p-4 border rounded-md cursor-pointer",
                        reportType === "activity" ? "border-law-teal bg-law-teal/5" : "hover:bg-muted/50"
                      )}
                      onClick={() => setReportType("activity")}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Activity Timeline</h3>
                        {reportType === "activity" && <Check className="h-4 w-4 text-law-teal" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Timeline of case activities
                      </p>
                    </div>
                    
                    <div 
                      className={cn(
                        "p-4 border rounded-md cursor-pointer",
                        reportType === "custom" ? "border-law-teal bg-law-teal/5" : "hover:bg-muted/50"
                      )}
                      onClick={() => setReportType("custom")}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Custom Report</h3>
                        {reportType === "custom" && <Check className="h-4 w-4 text-law-teal" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Build a report with custom parameters
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Report Options</CardTitle>
                </CardHeader>
                <CardContent>
                  {!reportType ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Select a report type to configure options</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">{reportType === "case-status" 
                          ? "Case Status Report" 
                          : reportType === "financial" 
                          ? "Financial Report" 
                          : reportType === "activity"
                          ? "Activity Report"
                          : "Custom Report"}
                        </h3>
                        <p className="text-muted-foreground">{getReportDescription()}</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="date-range">Date Range</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="date-from"
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !dateRange.from && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.from ? (
                                      format(dateRange.from, "PPP")
                                    ) : (
                                      <span>From date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={dateRange.from}
                                    onSelect={(date) =>
                                      setDateRange((prev) => ({ ...prev, from: date }))
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                              
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="date-to"
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !dateRange.to && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.to ? (
                                      format(dateRange.to, "PPP")
                                    ) : (
                                      <span>To date</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={dateRange.to}
                                    onSelect={(date) =>
                                      setDateRange((prev) => ({ ...prev, to: date }))
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="format">Export Format</Label>
                            <Select defaultValue="pdf" onValueChange={setFormat}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Document Type</SelectLabel>
                                  <SelectItem value="pdf">PDF Document</SelectItem>
                                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                                  <SelectItem value="csv">CSV File</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {reportType === "custom" && (
                          <div className="space-y-2">
                            <Label htmlFor="custom-fields">Include Fields</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <input type="checkbox" id="field-case-number" defaultChecked />
                                  <label htmlFor="field-case-number">Case Number</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input type="checkbox" id="field-parties" defaultChecked />
                                  <label htmlFor="field-parties">Parties</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input type="checkbox" id="field-status" defaultChecked />
                                  <label htmlFor="field-status">Status</label>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <input type="checkbox" id="field-deadlines" defaultChecked />
                                  <label htmlFor="field-deadlines">Deadlines</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input type="checkbox" id="field-financials" defaultChecked />
                                  <label htmlFor="field-financials">Financials</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input type="checkbox" id="field-timeline" />
                                  <label htmlFor="field-timeline">Timeline</label>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-4">
                          <Button 
                            className="w-full bg-law-teal hover:bg-law-teal/90"
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Report...
                              </>
                            ) : (
                              <>
                                <FileText className="mr-2 h-4 w-4" />
                                Generate {reportType === "case-status" 
                                  ? "Case Status Report" 
                                  : reportType === "financial" 
                                  ? "Financial Report" 
                                  : reportType === "activity"
                                  ? "Activity Report"
                                  : "Custom Report"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
