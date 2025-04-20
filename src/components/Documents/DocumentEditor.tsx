
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Case, DocumentType } from '@/types';
import { generateCaseDocument } from '@/utils/pdfGenerator';
import { uploadDocument } from '@/services/documentService';
import { useCase } from '@/hooks/useCase';
import DocumentTypeSelect from './DocumentTypeSelect';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Undo, Redo, Mail, Printer, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentEditorProps {
  selectedCase: Case | null;
  caseId?: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ selectedCase, caseId }) => {
  const [documentType, setDocumentType] = useState<DocumentType>('Demand Letter');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [content, setContent] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const { currentCase } = useCase(selectedCase, caseId);
  const contentRef = useRef<HTMLDivElement>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  
  // Load templates from local storage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('document_templates');
    if (savedTemplates) {
      const parsedTemplates = JSON.parse(savedTemplates);
      setTemplates(parsedTemplates);
      
      // Auto-select template that matches document type
      const matchingTemplate = parsedTemplates.find((t: Template) => t.name === documentType);
      if (matchingTemplate) {
        setSelectedTemplate(matchingTemplate.id);
        setContent(matchingTemplate.content);
      } else {
        setSelectedTemplate(null);
      }
    }
  }, [documentType]);
  
  // Load template content when template is selected
  useEffect(() => {
    if (selectedTemplate !== null) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setContent(template.content);
        if (!documentTitle) {
          setDocumentTitle(`${documentType} - ${format(new Date(), 'yyyy-MM-dd')}`);
        }
      }
    }
  }, [selectedTemplate, templates, documentType]);
  
  // Generate preview content with case variables replaced
  useEffect(() => {
    if (currentCase && content) {
      const processedContent = replaceTemplateVariables(content, currentCase);
      setPreviewContent(processedContent);
    }
  }, [content, currentCase, activeTab]);

  // Replace template variables with case data
  const replaceTemplateVariables = (template: string, currentCase: Case): string => {
    const replacements: Record<string, string> = {
      '{date}': format(new Date(), 'MMMM d, yyyy'),
      '{property.address}': `${currentCase.property.address.street}, ${currentCase.property.address.city}, ${currentCase.property.address.province} ${currentCase.property.address.postalCode}`,
      '{mortgage.number}': currentCase.mortgage.registrationNumber,
      '{mortgage.balance}': currentCase.mortgage.currentBalance.toLocaleString(),
      '{mortgage.principal}': currentCase.mortgage.principal.toLocaleString(),
      '{mortgage.per_diem}': currentCase.mortgage.perDiemInterest.toFixed(2),
      '{mortgage.interest_rate}': `${currentCase.mortgage.interestRate}%`,
      '{mortgage.arrears}': currentCase.mortgage.arrears?.toLocaleString() || 'N/A',
      '{court.file_number}': currentCase.court?.fileNumber || 'N/A',
      '{court.registry}': currentCase.court?.registry || 'N/A',
      '{court.hearing_date}': currentCase.court?.hearingDate 
        ? format(new Date(currentCase.court.hearingDate), 'MMMM d, yyyy') 
        : 'N/A',
      '{court.judge_name}': currentCase.court?.judgeName || 'N/A',
      '{case.file_number}': currentCase.fileNumber,
      '{case.status}': currentCase.status,
      '{case.created_at}': format(new Date(currentCase.createdAt), 'MMMM d, yyyy')
    };

    // Add parties dynamically
    currentCase.parties.forEach(party => {
      const type = party.type.toLowerCase();
      replacements[`{${type}.name}`] = party.name;
      replacements[`{${type}.email}`] = party.contactInfo.email || 'N/A';
      replacements[`{${type}.phone}`] = party.contactInfo.phone || 'N/A';
      if (party.contactInfo.address) {
        replacements[`{${type}.address}`] = party.contactInfo.address;
      }
    });

    // Find lender/borrower if not found in specific types
    if (!replacements['{lender.name}']) {
      const lender = currentCase.parties.find(p => 
        p.type.toLowerCase().includes('lender') || 
        p.type.toLowerCase().includes('mortgagee')
      );
      if (lender) {
        replacements['{lender.name}'] = lender.name;
        replacements['{lender.email}'] = lender.contactInfo.email || 'N/A';
        replacements['{lender.phone}'] = lender.contactInfo.phone || 'N/A';
      }
    }
    
    if (!replacements['{borrower.name}']) {
      const borrower = currentCase.parties.find(p => 
        p.type.toLowerCase().includes('borrower') || 
        p.type.toLowerCase().includes('mortgagor')
      );
      if (borrower) {
        replacements['{borrower.name}'] = borrower.name;
        replacements['{borrower.email}'] = borrower.contactInfo.email || 'N/A';
        replacements['{borrower.phone}'] = borrower.contactInfo.phone || 'N/A';
      }
    }

    // Replace all variables in the template
    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.split(key).join(value);
    }
    
    return result;
  };

  const handleTextFormatting = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };
  
  const handleSaveDocument = async () => {
    if (!currentCase) {
      toast.error("No case selected. Please select a case to save a document.");
      return;
    }

    if (!documentTitle) {
      toast.error("Please provide a document title.");
      return;
    }

    setIsGenerating(true);

    try {
      // Get the final content with variables replaced
      const finalContent = replaceTemplateVariables(content, currentCase);
      
      // Generate PDF from the content
      const doc = generateCaseDocument(currentCase, documentType, finalContent);
      const filename = `${documentTitle.replace(/\s+/g, '_')}.pdf`;
      
      // Create PDF blob and file
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      
      // Upload to storage
      await uploadDocument(currentCase.id, file, filename, documentType);
      
      toast.success("Document saved successfully!");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${documentTitle || documentType}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
              h1, h2, h3 { margin-top: 20px; }
              @media print {
                button { display: none !important; }
              }
            </style>
          </head>
          <body>
            <div>
              ${previewContent}
            </div>
            <script>
              setTimeout(() => window.print(), 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      toast.error("Unable to open print window. Please check your popup settings.");
    }
  };

  const handleDownload = () => {
    if (!currentCase) {
      toast.error("No case selected.");
      return;
    }
    
    try {
      // Generate PDF
      const doc = generateCaseDocument(currentCase, documentType, previewContent);
      const filename = documentTitle ? 
        `${documentTitle.replace(/\s+/g, '_')}.pdf` : 
        `Case_${currentCase.fileNumber}_${documentType}.pdf`;
      
      // Save the document
      doc.save(filename);
      toast.success("Document downloaded successfully!");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document.");
    }
  };

  const handleEmail = () => {
    // Create mailto link with subject and body
    const subject = encodeURIComponent(documentTitle || documentType);
    const body = encodeURIComponent('Please see the attached document.');
    
    // Open email client
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    toast.info("Email client opened. Please attach the downloaded document manually.");
    
    // Prompt to download the document first
    handleDownload();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col gap-2">
          <Input 
            type="text" 
            placeholder="Document Title" 
            value={documentTitle} 
            onChange={(e) => setDocumentTitle(e.target.value)} 
            className="text-lg font-semibold w-full lg:w-96"
          />
          <div className="flex gap-2">
            <DocumentTypeSelect value={documentType} onChange={setDocumentType} />
            
            <Select 
              value={selectedTemplate?.toString() || "default"} 
              onValueChange={(value) => setSelectedTemplate(value !== "default" ? parseInt(value) : null)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Template</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} disabled={!currentCase || !content}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint} disabled={!currentCase || !content}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button variant="outline" onClick={handleEmail} disabled={!currentCase || !content}>
            <Mail className="h-4 w-4 mr-1" />
            Email
          </Button>
          <Button onClick={handleSaveDocument} disabled={isGenerating || !currentCase || !content}>
            <FileText className="h-4 w-4 mr-1" />
            {isGenerating ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="border rounded-md p-4">
          <div className="mb-4 flex flex-wrap gap-1 border-b pb-2">
            <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('bold')}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('italic')}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('underline')}>
              <Underline className="h-4 w-4" />
            </Button>
            <div className="h-6 border-r mx-1"></div>
            <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('justifyLeft')}>
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('justifyCenter')}>
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('justifyRight')}>
              <AlignRight className="h-4 w-4" />
            </Button>
            <div className="h-6 border-r mx-1"></div>
            <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('undo')}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('redo')}>
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          
          <div 
            ref={contentRef}
            className="min-h-[500px] p-4 border rounded-md focus:outline-none whitespace-pre-wrap" 
            contentEditable={true}
            onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Available variables:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              <span>{'{date}'}</span>
              <span>{'{property.address}'}</span>
              <span>{'{mortgage.number}'}</span>
              <span>{'{mortgage.balance}'}</span>
              <span>{'{mortgage.principal}'}</span>
              <span>{'{mortgage.per_diem}'}</span>
              <span>{'{mortgage.interest_rate}'}</span>
              <span>{'{case.file_number}'}</span>
              <span>{'{lender.name}'}</span>
              <span>{'{borrower.name}'}</span>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="border rounded-md p-4">
          <div className="min-h-[500px] p-4 border rounded-md whitespace-pre-wrap">
            {previewContent ? (
              <div dangerouslySetInnerHTML={{ __html: previewContent }} />
            ) : (
              <p className="text-muted-foreground">Preview will appear here...</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentEditor;
