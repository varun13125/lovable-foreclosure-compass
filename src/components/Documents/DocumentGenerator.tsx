
import React from 'react';
import { Case } from '@/types';
import { useCase } from '@/hooks/useCase';
import DocumentEditor from './DocumentEditor';

interface DocumentGeneratorProps {
  selectedCase: Case | null;
  caseId?: string;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ selectedCase, caseId }) => {
  const { currentCase } = useCase(selectedCase, caseId);
  
  return (
    <div>
      <DocumentEditor selectedCase={currentCase} caseId={caseId} />
    </div>
  );
};

export default DocumentGenerator;
