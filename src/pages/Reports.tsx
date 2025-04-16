
import { useState, useEffect } from "react";
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
import { CalendarIcon, Check, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

const CustomFieldOption = ({ id, label, defaultChecked = false }: { id: string; label: string; defaultChecked?: boolean }) => {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={`field-${id}`} 
        checked={checked} 
        onCheckedChange={(checked) => setChecked(checked as boolean)} 
      />
      <label htmlFor={`field-${id}`} className="text-sm cursor-pointer">{label}</label>
    </div>
  );
};

export default function Reports() {
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [formatType, setFormatType] = useState("pdf");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any[] | null>(null);

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast.error("Please select a report type");
      return;
    }

    setIsGenerating(true);
    setReportData(null);
    
    try {
      // Simulate fetching report data
      let data = [];
      
      switch (reportType) {
        case "case-status":
          data = [
            { status: "New", count: 12 },
            { status: "In Progress", count: 8 },
            { status: "Discovery", count: 5 },
            { status: "Trial", count: 3 },
            { status: "Closed", count: 7 },
          ];
          break;
        case "financial":
          data = [
            { month: "Jan", revenue: 12500, expenses: 8200 },
            { month: "Feb", revenue: 15000, expenses: 9100 },
            { month: "Mar", revenue: 18200, expenses: 10400 },
            { month: "Apr", revenue: 17800, expenses: 9800 },
            { month: "May", revenue: 21000, expenses: 11200 },
          ];
          break;
        case "activity":
          data = [
            { date: "2025-04-12", action: "Document Filed", case: "Johnson v. State" },
            { date: "2025-04-10", action: "Client Meeting", case: "Smith Property Dispute" },
            { date: "2025-04-08", action: "Court Hearing", case: "Davidson Trust" },
            { date: "2025-04-05", action: "Settlement Negotiation", case: "Metro Inc. Merger" },
            { date: "2025-04-01", action: "Brief Submitted", case: "Taylor Appeal" },
          ];
          break;
        case "custom":
          data = [
            { field1: "Sample data", field2: "Custom value", field3: "Additional info" },
            { field1: "More data", field2: "Custom metric", field3: "Supplemental details" },
            { field1: "Other data", field2: "Custom analysis", field3: "Context information" },
          ];
          break;
      }
      
      setTimeout(() => {
        setReportData(data);
        setIsGenerating(false);
        toast.success("Report generated successfully", {
          description: `Your ${reportType} report is ready to view or download.`,
          action: {
            label: "Download",
            onClick: () => handleDownloadReport(),
          },
        });
      }, 1500);
      
    } catch (error) {
      setIsGenerating(false);
      toast.error("Failed to generate report");
      console.error("Report generation error:", error);
    }
  };

  const handleDownloadReport = () => {
    if (!reportData) return;
    
    const reportTitle = reportType.replace("-", "_");
    const fileName = `${reportTitle}_report_${formatDate(new Date())}.${formatType}`;
    
    // Convert reportData to appropriate format
    let content = '';
    let blob;
    let contentType = '';
    
    if (formatType === 'csv') {
      content = convertToCSV(reportData);
      blob = new Blob([content], { type: 'text/csv' });
      contentType = 'text/csv';
    } else if (formatType === 'excel') {
      content = convertToCSV(reportData); // For demo we'll just use CSV for Excel too
      blob = new Blob([content], { type: 'application/vnd.ms-excel' });
      contentType = 'application/vnd.ms-excel';
    } else {
      // For PDF, create a simple HTML representation that will print as PDF
      content = createPdfContent(reportData, reportType);
      blob = new Blob([content], { type: 'text/html' });
      contentType = 'text/html';
      fileName = fileName.replace('pdf', 'html');
    }
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Report downloaded as ${fileName}`);
    console.info("Downloaded report:", reportType, formatType);
  };
  
  const createPdfContent = (data: any[], reportType: string) => {
    const title = getReportTitle(reportType);
    const headers = Object.keys(data[0]);
    
    let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; }
        h1 { text-align: center; color: #333366; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f0f0f0; font-weight: bold; text-align: left; }
        th, td { padding: 8px; border: 1px solid #ddd; }
        .footer { margin-top: 30px; font-size: 12px; text-align: center; color: #666; }
        @media print {
          body { margin: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header.charAt(0).toUpperCase() + header.slice(1)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(header => `<td>${row[header]}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Report generated by LegalFlow Case Management System</p>
      </div>
      <script>
        window.onload = function() {
          // Auto-print for PDF
          if (${formatType === 'pdf'}) {
            window.print();
          }
        };
      </script>
    </body>
    </html>
    `;
    
    return htmlContent;
  };
  
  const getReportTitle = (reportType: string) => {
    switch (reportType) {
      case "case-status":
        return "Case Status Summary Report";
      case "financial":
        return "Financial Analysis Report";
      case "activity":
        return "Activity Timeline Report";
      case "custom":
        return "Custom Analytics Report";
      default:
        return "Generated Report";
    }
  };
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    const rows = data.map(row => {
      return headers.map(header => {
        const cell = row[header] === null || row[header] === undefined ? '' : row[header];
        return typeof cell === 'string' ? `"${cell}"` : cell;
      }).join(',');
    });
    
    return [headerRow, ...rows].join('\n');
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
                            <Select defaultValue="pdf" onValueChange={setFormatType}>
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
                            <Label>Include Fields</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <CustomFieldOption id="case-number" label="Case Number" defaultChecked />
                                <CustomFieldOption id="parties" label="Parties" defaultChecked />
                                <CustomFieldOption id="status" label="Status" defaultChecked />
                              </div>
                              <div className="space-y-2">
                                <CustomFieldOption id="deadlines" label="Deadlines" defaultChecked />
                                <CustomFieldOption id="financials" label="Financials" defaultChecked />
                                <CustomFieldOption id="timeline" label="Timeline" />
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

          {reportData && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {reportType === "case-status" 
                      ? "Case Status Summary" 
                      : reportType === "financial" 
                      ? "Financial Report" 
                      : reportType === "activity"
                      ? "Activity Timeline"
                      : "Custom Report"}
                  </CardTitle>
                  <Button 
                    variant="outline"
                    onClick={handleDownloadReport}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        {reportData.length > 0 && 
                          Object.keys(reportData[0]).map((key) => (
                            <th key={key} className="text-left p-2">{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                          ))
                        }
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row, index) => (
                        <tr key={index} className="border-b">
                          {Object.values(row).map((value: any, i) => (
                            <td key={i} className="p-2">{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
