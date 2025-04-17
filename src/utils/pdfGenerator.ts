
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Case } from '@/types';

// Extend jsPDF with autotable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateCaseDocument = (currentCase: Case, documentType: string) => {
  const doc = new jsPDF();
  
  // Document header
  doc.setFontSize(18);
  doc.text(`Document Type: ${documentType}`, 10, 10);
  
  // Case details
  doc.setFontSize(12);
  doc.text(`Case File Number: ${currentCase.fileNumber}`, 10, 20);
  doc.text(`Property Address: ${currentCase.property.address.street}, ${currentCase.property.address.city}`, 10, 30);
  
  // Parties involved
  let yOffset = 40;
  currentCase.parties.forEach(party => {
    doc.text(`${party.type}: ${party.name}`, 10, yOffset);
    yOffset += 10;
  });
  
  // Mortgage details
  doc.text(`Mortgage Registration Number: ${currentCase.mortgage.registrationNumber}`, 10, yOffset);
  yOffset += 10;
  doc.text(`Principal Amount: ${currentCase.mortgage.principal.toString()}`, 10, yOffset);
  
  // Example table
  doc.autoTable({
    head: [['Header 1', 'Header 2']],
    body: [
      ['row 1 col 1', 'row 1 col 2'],
      ['row 2 col 1', 'row 2 col 2']
    ],
    startY: yOffset + 10
  });
  
  return doc;
};
