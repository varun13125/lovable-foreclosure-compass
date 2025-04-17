import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Printer, Save } from "lucide-react";
import { Document } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DocumentViewerProps {
  document: Document;
  content?: string;
  onStatusChange?: () => void;
}

const DocumentViewer = ({ document, content, onStatusChange }: DocumentViewerProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleDownload = () => {
    if (!content) {
      toast.error("Document content is not available");
      return;
    }
    
    setLoading(true);
    
    try {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${document.title}.txt`;
      window.document.body.appendChild(a);
      a.click();
      
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${document.title} downloaded successfully`);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!content) {
      toast.error("Document content is not available");
      return;
    }
    
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${document.title}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 40px;
                  line-height: 1.5;
                }
                h1 {
                  text-align: center;
                  font-size: 18px;
                  margin-bottom: 20px;
                }
                pre {
                  white-space: pre-wrap;
                  font-family: Arial, sans-serif;
                }
              </style>
            </head>
            <body>
              <h1>${document.title}</h1>
              <pre>${content}</pre>
              <script>
                window.onload = function() {
                  window.print();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        toast.success("Print dialog opened");
      } else {
        toast.error("Could not open print window. Please check your popup blocker settings.");
      }
    } catch (error) {
      console.error("Error printing document:", error);
      toast.error("Failed to print document");
    }
  };

  const handleFinalize = async () => {
    if (!document.id) {
      toast.error("Cannot finalize document: missing document ID");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'Finalized' })
        .eq('id', document.id);
        
      if (error) throw error;
      
      toast.success("Document status updated to 'Finalized'");
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error finalizing document:", error);
      toast.error("Failed to finalize document");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'Finalized': return 'default';
      case 'Filed': return 'success';
      case 'Served': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-law-teal" />
            <CardTitle className="text-lg">{document.title}</CardTitle>
          </div>
          <Badge variant={getStatusBadgeVariant(document.status)}>
            {document.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {content ? (
          <div className="space-y-4">
            <div className="border rounded bg-muted/30 p-4 text-sm max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">{content}</pre>
            </div>
            <div className="flex justify-end gap-2">
              {document.status === "Draft" && (
                <Button
                  variant="default" 
                  className="gap-2 bg-law-navy hover:bg-law-navy/90"
                  onClick={handleFinalize}
                  disabled={loading}
                >
                  <Save className="h-4 w-4" />
                  Save Final
                </Button>
              )}
              {document.status !== "Finalized" && (
                <Button
                  variant="outline"
                  className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                  onClick={handleFinalize}
                >
                  Finalize Document
                </Button>
              )}
              <Button
                variant="outline"
                className="gap-2"
                onClick={handlePrint}
                disabled={loading}
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                variant="secondary"
                className="gap-2"
                onClick={handleDownload}
                disabled={loading}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-gray-100 rounded border-dashed border-2 text-muted-foreground">
            <span>Document content not available</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentViewer;
