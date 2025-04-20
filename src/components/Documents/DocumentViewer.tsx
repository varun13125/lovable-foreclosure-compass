
import React, { useState, useEffect, useRef } from 'react';
import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Download, Printer, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateCaseDocument } from '@/utils/pdfGenerator';

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
  const [documentContent, setDocumentContent] = useState(content);
  const [saving, setSaving] = useState(false);
  const [formattedContent, setFormattedContent] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
    node: Node | null;
  } | null>(null);

  useEffect(() => {
    if (content) {
      // Apply basic formatting to enhance readability
      let formatted = content;
      if (!formatted.trim().startsWith('<')) {
        // If content is plain text, add paragraph tags
        formatted = `<div style="font-family: Arial, sans-serif; line-height: 1.5;">${formatted
          .split('\n\n')
          .map(para => `<p>${para}</p>`)
          .join('')}</div>`;
      }
      setFormattedContent(formatted);
      setDocumentContent(formatted);
    }
  }, [content]);

  // Save selection state when user is editing
  const saveSelection = () => {
    if (window.getSelection && editorRef.current) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
        const range = sel.getRangeAt(0);
        setSelection({
          start: range.startOffset,
          end: range.endOffset,
          node: range.startContainer
        });
      }
    }
  };

  // Restore selection after DOM updates
  const restoreSelection = () => {
    if (selection && editorRef.current) {
      const sel = window.getSelection();
      if (sel && selection.node && editorRef.current.contains(selection.node)) {
        const range = document.createRange();
        try {
          range.setStart(selection.node, selection.start);
          range.setEnd(selection.node, selection.end);
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (error) {
          console.error("Failed to restore selection:", error);
        }
      }
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      saveSelection();
      setDocumentContent(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    if (isEditing && editorRef.current) {
      const editor = editorRef.current;
      
      // Focus the editor when editing starts
      editor.focus();
      
      // Setup event handlers for cursor position tracking
      const handleKeyEvents = () => {
        saveSelection();
      };
      
      const handleBlur = () => {
        saveSelection();
      };
      
      const handleFocus = () => {
        setTimeout(restoreSelection, 0);
      };
      
      // Add all event listeners
      editor.addEventListener('keyup', handleKeyEvents);
      editor.addEventListener('keydown', handleKeyEvents);
      editor.addEventListener('mouseup', handleKeyEvents);
      editor.addEventListener('blur', handleBlur);
      editor.addEventListener('focus', handleFocus);
      editor.addEventListener('input', handleContentChange);
      
      // Clean up event listeners
      return () => {
        editor.removeEventListener('keyup', handleKeyEvents);
        editor.removeEventListener('keydown', handleKeyEvents);
        editor.removeEventListener('mouseup', handleKeyEvents);
        editor.removeEventListener('blur', handleBlur);
        editor.removeEventListener('focus', handleFocus);
        editor.removeEventListener('input', handleContentChange);
      };
    }
  }, [isEditing]);

  // Restore cursor position after render
  useEffect(() => {
    if (isEditing) {
      restoreSelection();
    }
  }, [documentContent, isEditing]);

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
                  setDocumentContent(formattedContent);
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
          <ScrollArea 
            className={`h-[70vh] w-full ${isEditing ? 'bg-white' : 'bg-gray-50 dark:bg-gray-900/20'}`}
            viewportRef={viewportRef}
          >
            <div className="p-6">
              {isEditing ? (
                <div
                  ref={editorRef}
                  contentEditable
                  className="outline-none min-h-full prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: documentContent }}
                  suppressContentEditableWarning
                />
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
