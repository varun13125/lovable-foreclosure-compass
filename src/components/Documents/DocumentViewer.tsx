
import React, { useState, useEffect } from 'react';
import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateCaseDocument } from '@/utils/pdfGenerator';
import RichTextEditor from '@/components/RichTextEditor';

interface DocumentViewerProps {
  document: Document;
  content: string;
  onStatusChange?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  content,
  onStatusChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [documentContent, setDocumentContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content) {
      setDocumentContent(content);
    }
  }, [content]);

  const handlePrint = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${document.title || 'Document'}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 2cm;
                  color: #000;
                }
                h1, h2, h3 { margin-top: 20px; margin-bottom: 10px; }
                p { margin-bottom: 10px; }
                .document-header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .print-button {
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: #0077cc;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 4px;
                  cursor: pointer;
                }
                @media print {
                  .print-button { display: none; }
                }
              </style>
            </head>
            <body>
              <button class="print-button" onclick="window.print()">Print Document</button>
              <div class="document-header">
                <h1>${document.title || document.type}</h1>
                <div>Generated: ${format(new Date(document.createdAt), 'MMMM d, yyyy')}</div>
              </div>
              <div>${documentContent}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        toast.error("Unable to open print window. Please check your popup settings.");
      }
    } catch (error) {
      console.error("Error preparing print view:", error);
      toast.error("Failed to prepare document for printing.");
    }
  };

  const handleDownload = () => {
    try {
      // Create a mock case object for the PDF generator
      const mockCase = {
        fileNumber: document.caseNumber || 'Unknown',
        id: document.caseId || 'unknown',
        property: { address: { street: '', city: '', province: '', postalCode: '' } },
      };

      const doc = generateCaseDocument(mockCase as any, document.type, documentContent);
      if (!doc) {
        throw new Error("Failed to generate document");
      }

      const filename = document.title ? 
        `${document.title.replace(/\s+/g, '_')}.pdf` : 
        `Document_${document.id}.pdf`;

      doc.save(filename);
      toast.success("Document downloaded successfully!");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document.");
    }
  };

  const handleSave = async () => {
    if (!document.id) {
      toast.error("Document ID is missing.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ content: documentContent })
        .eq('id', document.id);

      if (error) throw error;
      
      toast.success("Document saved successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizeDocument = async () => {
    if (!document.id) {
      toast.error("Document ID is missing.");
      return;
    }

    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          status: 'Finalized',
          content: documentContent
        })
        .eq('id', document.id);

      if (error) throw error;
      
      toast.success("Document finalized successfully");
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error finalizing document:", error);
      toast.error("Failed to finalize document");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold">{document.title || document.type}</h2>
          <p className="text-muted-foreground">
            Created: {format(new Date(document.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setDocumentContent(content || '');
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={document.status === 'Finalized'}
              >
                Edit
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              {document.status !== 'Finalized' && (
                <Button 
                  onClick={handleFinalizeDocument}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" /> Finalize
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <ScrollArea className="h-[70vh] w-full bg-gray-50 dark:bg-gray-900/20">
            <div className="p-6">
              {isEditing ? (
                <div className="edit-container" style={{ height: "60vh" }}>
                  <RichTextEditor
                    value={documentContent}
                    onChange={setDocumentContent}
                    minHeight="60vh"
                  />
                </div>
              ) : (
                <div 
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: documentContent }}
                />
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentViewer;
