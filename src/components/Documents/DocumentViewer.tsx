
import React, { useState, useEffect } from 'react';
import { Document } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateCaseDocument } from '@/utils/pdfGenerator';
import DocumentViewerHeader from './DocumentViewerHeader';
import DocumentViewerEditor from './DocumentViewerEditor';
import DocumentViewerDisplay from './DocumentViewerDisplay';

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
      <DocumentViewerHeader
        title={document.title}
        type={document.type}
        createdAt={format(new Date(document.createdAt), 'MMMM d, yyyy')}
        status={document.status}
        isEditing={isEditing}
        saving={saving}
        onEdit={() => setIsEditing(true)}
        onCancelEdit={() => {
          setIsEditing(false);
          setDocumentContent(content || '');
        }}
        onSave={handleSave}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onFinalize={handleFinalizeDocument}
        canFinalize={document.status !== 'Finalized'}
      />
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isEditing ? (
            <DocumentViewerEditor
              value={documentContent}
              onChange={setDocumentContent}
            />
          ) : (
            <DocumentViewerDisplay content={documentContent} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentViewer;
