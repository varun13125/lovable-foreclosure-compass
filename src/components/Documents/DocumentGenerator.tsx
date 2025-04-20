
import React from 'react';
import { Case } from '@/types';
import { useCase } from '@/hooks/useCase';
import DocumentEditor from './DocumentEditor';
import { toast } from 'sonner';

interface DocumentGeneratorProps {
  selectedCase: Case | null;
  caseId?: string;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ selectedCase, caseId }) => {
  const { currentCase } = useCase(selectedCase, caseId);
  
  if (!currentCase) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <h3 className="mb-2 font-semibold">Case data not available</h3>
        <p className="text-muted-foreground">
          Unable to load case data. Please try again or check if the case exists.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <DocumentEditor 
        selectedCase={currentCase} 
        caseId={caseId} 
        onError={(error) => toast.error(error)}
      />
    </div>
  );
};

export default DocumentGenerator;
