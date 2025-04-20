
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Case, DocumentType } from '@/types';
import { toast } from 'sonner';
import { useCase } from '@/hooks/useCase';
import { generateCaseDocument } from '@/utils/pdfGenerator';
import { uploadDocument } from '@/services/documentService';
import DocumentTypeSelect from './DocumentTypeSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentGeneratorProps {
  selectedCase: Case | null;
  caseId?: string;
}

interface Template {
  id: number;
  name: string;
  description: string;
  content: string;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ selectedCase, caseId }) => {
  const [documentType, setDocumentType] = useState<DocumentType>('Demand Letter');
  const [isGenerating, setIsGenerating] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const { currentCase } = useCase(selectedCase, caseId);

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
      } else {
        setSelectedTemplate(null);
      }
    }
  }, [documentType]);

  const generateDocument = async () => {
    if (!currentCase) {
      toast.error("No case selected. Please select a case to generate a document.");
      return;
    }

    setIsGenerating(true);

    try {
      // Get the selected template content if available
      const template = selectedTemplate 
        ? templates.find(t => t.id === selectedTemplate)?.content 
        : undefined;
      
      const doc = generateCaseDocument(currentCase, documentType, template);
      const filename = `Case_${currentCase.fileNumber}_${documentType}.pdf`;
      
      // Create PDF blob and file
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      
      // Save locally
      doc.save(filename);
      
      // Upload to storage
      await uploadDocument(currentCase.id, file, filename, documentType);
      
      toast.success("Document generated successfully!");
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate document.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Generate Document</h2>
      
      <div className="space-y-4">
        <div>
          <DocumentTypeSelect value={documentType} onChange={setDocumentType} />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Template</label>
          <Select 
            value={selectedTemplate?.toString() || "default"} 
            onValueChange={(value) => setSelectedTemplate(value !== "default" ? parseInt(value) : null)}
          >
            <SelectTrigger className="w-full">
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
        
        <Button 
          onClick={generateDocument} 
          disabled={isGenerating || !currentCase}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate Document"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentGenerator;
