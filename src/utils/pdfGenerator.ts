
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Case, DocumentType } from '@/types';
import { format } from 'date-fns';

// Extend jsPDF with autotable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Function to replace template variables with actual data
const replaceTemplateVariables = (template: string, currentCase: Case): string => {
  const replacements: Record<string, string> = {
    '{date}': format(new Date(), 'MMMM d, yyyy'),
    '{property.address}': `${currentCase.property.address.street}, ${currentCase.property.address.city}, ${currentCase.property.address.province} ${currentCase.property.address.postalCode}`,
    '{mortgage.number}': currentCase.mortgage.registrationNumber,
    '{mortgage.balance}': currentCase.mortgage.currentBalance.toLocaleString(),
    '{mortgage.principal}': currentCase.mortgage.principal.toLocaleString(),
    '{mortgage.per_diem}': currentCase.mortgage.perDiemInterest.toFixed(2),
    '{mortgage.interest_rate}': `${currentCase.mortgage.interestRate}%`,
    '{court.file_number}': currentCase.court?.fileNumber || 'N/A',
    '{court.registry}': currentCase.court?.registry || 'N/A',
    '{court.hearing_date}': currentCase.court?.hearingDate 
      ? format(new Date(currentCase.court.hearingDate), 'MMMM d, yyyy') 
      : 'N/A',
    '{court.judge_name}': currentCase.court?.judgeName || 'N/A'
  };

  // Add parties dynamically
  currentCase.parties.forEach(party => {
    const type = party.type.toLowerCase();
    replacements[`{${type}.name}`] = party.name;
    replacements[`{${type}.email}`] = party.contactInfo.email;
    replacements[`{${type}.phone}`] = party.contactInfo.phone;
    if (party.contactInfo.address) {
      replacements[`{${type}.address}`] = party.contactInfo.address;
    }
  });

  // Replace all variables in the template
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.split(key).join(value);
  }
  
  return result;
};

export const generateCaseDocument = (currentCase: Case, documentType: string, template?: string) => {
  const doc = new jsPDF();
  
  if (template) {
    // Process template-based document
    const processedContent = replaceTemplateVariables(template, currentCase);
    const lines = processedContent.split('\n');
    
    let yPos = 20;
    doc.setFontSize(12);
    
    lines.forEach(line => {
      if (line.trim().length === 0) {
        yPos += 10; // Empty line spacing
        return;
      }
      
      // Check if line should be a header
      if (line.toUpperCase() === line && line.length > 10) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(line, 20, yPos);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
      } else {
        doc.text(line, 20, yPos);
      }
      
      yPos += 10;
      
      // Add new page if needed
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    return doc;
  }
  
  // Fall back to the default document generation if no template provided
  doc.setFontSize(18);
  doc.text(`Document Type: ${documentType}`, 10, 10);
  
  // Document timestamp
  const timestamp = format(new Date(), 'MMMM d, yyyy h:mm a');
  doc.setFontSize(10);
  doc.text(`Generated: ${timestamp}`, 10, 20);
  
  // Case details
  doc.setFontSize(12);
  doc.text(`Case File Number: ${currentCase.fileNumber}`, 10, 30);
  
  // Property details
  doc.text(`Property Address: ${currentCase.property.address.street}, ${currentCase.property.address.city}`, 10, 40);
  doc.text(`Province: ${currentCase.property.address.province}`, 10, 50);
  doc.text(`Postal Code: ${currentCase.property.address.postalCode}`, 10, 60);
  doc.text(`Property ID: ${currentCase.property.pid || 'N/A'}`, 10, 70);
  
  // Parties involved
  doc.setFontSize(14);
  doc.text('Parties Involved', 10, 85);
  
  let yOffset = 95;
  currentCase.parties.forEach(party => {
    doc.setFontSize(12);
    doc.text(`${party.type}: ${party.name}`, 10, yOffset);
    doc.setFontSize(10);
    doc.text(`Contact: ${party.contactInfo.email || 'N/A'}, ${party.contactInfo.phone || 'N/A'}`, 20, yOffset + 5);
    yOffset += 15;
  });
  
  // Mortgage details
  doc.setFontSize(14);
  doc.text('Mortgage Details', 10, yOffset + 5);
  yOffset += 15;
  
  doc.setFontSize(12);
  doc.text(`Registration Number: ${currentCase.mortgage.registrationNumber}`, 10, yOffset);
  yOffset += 10;
  doc.text(`Principal Amount: $${currentCase.mortgage.principal.toLocaleString()}`, 10, yOffset);
  yOffset += 10;
  doc.text(`Current Balance: $${currentCase.mortgage.currentBalance.toLocaleString()}`, 10, yOffset);
  yOffset += 10;
  doc.text(`Interest Rate: ${currentCase.mortgage.interestRate}%`, 10, yOffset);
  yOffset += 10;
  doc.text(`Per Diem Interest: $${currentCase.mortgage.perDiemInterest.toFixed(2)}`, 10, yOffset);
  
  // Case status and notes
  yOffset += 20;
  doc.setFontSize(14);
  doc.text('Case Information', 10, yOffset);
  yOffset += 10;
  doc.setFontSize(12);
  doc.text(`Status: ${currentCase.status}`, 10, yOffset);
  
  // Add notes if available
  if (currentCase.notes) {
    yOffset += 15;
    doc.setFontSize(14);
    doc.text('Notes', 10, yOffset);
    yOffset += 10;
    doc.setFontSize(10);
    
    // Split long notes into multiple lines
    const splitNotes = doc.splitTextToSize(currentCase.notes, 180);
    doc.text(splitNotes, 10, yOffset);
  }
  
  return doc;
};
