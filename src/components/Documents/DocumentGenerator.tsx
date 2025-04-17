
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Case, DocumentType } from '@/types';
import { toast } from 'sonner';
import { useCase } from '@/hooks/useCase';
import { generateCaseDocument } from '@/utils/pdfGenerator';
import { uploadDocument } from '@/services/documentService';
import DocumentTypeSelect from './DocumentTypeSelect';

interface DocumentGeneratorProps {
  selectedCase: Case | null;
  caseId?: string;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ selectedCase, caseId }) => {
  const [documentType, setDocumentType] = useState<DocumentType>('Demand Letter');
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentCase } = useCase(selectedCase, caseId);

  const generateDocument = async () => {
    if (!currentCase) {
      toast.error("No case selected. Please select a case to generate a document.");
      return;
    }

    setIsGenerating(true);

    try {
      const doc = generateCaseDocument(currentCase, documentType);
      const filename = `Case_${currentCase.fileNumber}_${documentType}.pdf`;
      
      // Create PDF blob and file
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      
      // Save locally
      doc.save(filename);
      
      // Upload to storage
      await uploadDocument(currentCase.id, file, filename, documentType);
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
      <DocumentTypeSelect value={documentType} onChange={setDocumentType} />
      <Button onClick={generateDocument} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Generate Document"}
      </Button>
    </div>
  );
};

export default DocumentGenerator;
