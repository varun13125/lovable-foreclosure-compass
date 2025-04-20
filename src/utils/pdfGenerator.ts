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

  // Replace all variables in the template with regex to catch all occurrences
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    // Escape special characters in the key for regex
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKey, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
};

// Helper function to clean HTML to plain text
const cleanHtmlContent = (html: string): string => {
  // Create a temporary div to render the HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Preserve line breaks and formatting
  const processNode = (node: Node): string => {
    if (node.nodeType === 3) { // Text node
      return node.textContent || '';
    }
    
    if (node.nodeType === 1) { // Element node
      const el = node as HTMLElement;
      
      // Handle specific tags
      if (el.tagName === 'BR') return '\n';
      if (el.tagName === 'P') return processChildren(el) + '\n\n';
      if (el.tagName === 'DIV') return processChildren(el) + '\n';
      if (el.tagName === 'H1') return processChildren(el).toUpperCase() + '\n\n';
      if (el.tagName === 'H2' || el.tagName === 'H3') return processChildren(el) + '\n\n';
      if (el.tagName === 'B' || el.tagName === 'STRONG') return processChildren(el);
      if (el.tagName === 'I' || el.tagName === 'EM') return processChildren(el);
      if (el.tagName === 'U') return processChildren(el);
      if (el.tagName === 'LI') return '• ' + processChildren(el) + '\n';
      if (el.tagName === 'UL' || el.tagName === 'OL') return processChildren(el) + '\n';
      
      // For other elements, just process children
      return processChildren(el);
    }
    
    return '';
  };
  
  const processChildren = (element: Node): string => {
    return Array.from(element.childNodes).map(processNode).join('');
  };
  
  // Process the entire document
  return processNode(temp).trim();
};

export const generateCaseDocument = (currentCase: Case, documentType: string, template?: string) => {
  const doc = new jsPDF();
  
  if (template) {
    // Process template-based document
    // Set default font
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    // Add document header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${documentType}`, 105, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 195, 30, { align: 'right' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Convert HTML content to text, preserving structure as much as possible
    const cleanContent = cleanHtmlContent(template);
    const lines = cleanContent.split('\n');
    
    let yPos = 40;
    
    // Process each line
    lines.forEach(line => {
      if (line.trim().length === 0) {
        yPos += 6; // Empty line spacing
        return;
      }
      
      // Check if line is all caps (likely a header)
      if (line === line.toUpperCase() && line.trim().length > 3) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(line, 20, yPos);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        yPos += 8;
      } else {
        // Split long lines to fit on the page
        const splitText = doc.splitTextToSize(line, 170);
        splitText.forEach((textLine: string) => {
          doc.text(textLine, 20, yPos);
          yPos += 7;
        });
      }
      
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
