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
  if (!currentCase) {
    console.error("No case data provided to replace template variables");
    return template;
  }
  
  console.log("Replacing variables for case:", currentCase.fileNumber);
  
  const replacements: Record<string, string> = {
    '{date}': format(new Date(), 'MMMM d, yyyy'),
    '{property.address}': currentCase.property ? 
      `${currentCase.property.address.street}, ${currentCase.property.address.city}, ${currentCase.property.address.province} ${currentCase.property.address.postalCode}` : 'N/A',
    '{mortgage.number}': currentCase.mortgage?.registrationNumber || 'N/A',
    '{mortgage.balance}': (currentCase.mortgage?.currentBalance || 0).toLocaleString(),
    '{mortgage.principal}': (currentCase.mortgage?.principal || 0).toLocaleString(),
    '{mortgage.per_diem}': (currentCase.mortgage?.perDiemInterest || 0).toFixed(2),
    '{mortgage.interest_rate}': `${currentCase.mortgage?.interestRate || 0}%`,
    '{mortgage.arrears}': currentCase.mortgage?.arrears?.toLocaleString() || 'N/A',
    '{court.file_number}': currentCase.court?.fileNumber || 'N/A',
    '{court.registry}': currentCase.court?.registry || 'N/A',
    '{court.hearing_date}': currentCase.court?.hearingDate 
      ? format(new Date(currentCase.court.hearingDate), 'MMMM d, yyyy') 
      : 'N/A',
    '{court.judge_name}': currentCase.court?.judgeName || 'N/A',
    '{case.file_number}': currentCase.fileNumber || 'N/A',
    '{case.status}': currentCase.status || 'N/A',
    '{case.created_at}': currentCase.createdAt ? format(new Date(currentCase.createdAt), 'MMMM d, yyyy') : 'N/A'
  };

  // Add parties dynamically
  if (currentCase.parties && Array.isArray(currentCase.parties)) {
    currentCase.parties.forEach(party => {
      if (!party || !party.type) return;
      
      const type = party.type.toLowerCase();
      replacements[`{${type}.name}`] = party.name || 'N/A';
      if (party.contactInfo) {
        replacements[`{${type}.email}`] = party.contactInfo.email || 'N/A';
        replacements[`{${type}.phone}`] = party.contactInfo.phone || 'N/A';
        if (party.contactInfo.address) {
          replacements[`{${type}.address}`] = party.contactInfo.address;
        }
      }
    });
  }

  // Find lender/borrower if not found in specific types
  if (!replacements['{lender.name}']) {
    const lender = currentCase.parties?.find(p => 
      p.type.toLowerCase().includes('lender') || 
      p.type.toLowerCase().includes('mortgagee')
    );
    if (lender) {
      replacements['{lender.name}'] = lender.name || 'N/A';
      replacements['{lender.email}'] = lender.contactInfo?.email || 'N/A';
      replacements['{lender.phone}'] = lender.contactInfo?.phone || 'N/A';
    }
  }
  
  if (!replacements['{borrower.name}']) {
    const borrower = currentCase.parties?.find(p => 
      p.type.toLowerCase().includes('borrower') || 
      p.type.toLowerCase().includes('mortgagor')
    );
    if (borrower) {
      replacements['{borrower.name}'] = borrower.name || 'N/A';
      replacements['{borrower.email}'] = borrower.contactInfo?.email || 'N/A';
      replacements['{borrower.phone}'] = borrower.contactInfo?.phone || 'N/A';
    }
  }

  console.log("Variable replacements:", replacements);

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

// Enhanced HTML parsing to retain formatting
const cleanHtmlContent = (html: string): { text: string, formatting: any[] } => {
  // Create a temporary div to render the HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Store formatting information
  const formatting: any[] = [];
  
  // Process a node and extract formatting
  const processNode = (node: Node, currentPos: number = 0, parentFormatting: any = {}): { text: string, position: number } => {
    if (node.nodeType === 3) { // Text node
      const text = node.textContent || '';
      if (text.trim()) {
        // Add formatting info for this text segment if there's parent formatting
        if (Object.keys(parentFormatting).length > 0) {
          formatting.push({
            start: currentPos,
            end: currentPos + text.length,
            ...parentFormatting
          });
        }
      }
      return { text, position: currentPos + text.length };
    }
    
    if (node.nodeType === 1) { // Element node
      const el = node as HTMLElement;
      const nodeFormatting = { ...parentFormatting };
      
      // Handle specific elements and their formatting
      if (el.tagName === 'B' || el.tagName === 'STRONG') nodeFormatting.bold = true;
      if (el.tagName === 'I' || el.tagName === 'EM') nodeFormatting.italic = true;
      if (el.tagName === 'U') nodeFormatting.underline = true;
      
      // Get font or size information
      const fontFamily = el.style.fontFamily;
      if (fontFamily) nodeFormatting.font = fontFamily;
      
      const fontSize = el.style.fontSize;
      if (fontSize) nodeFormatting.size = fontSize;
      
      // Get alignment
      const textAlign = el.style.textAlign;
      if (textAlign) nodeFormatting.align = textAlign;
      
      // Process color
      const color = el.style.color;
      if (color) nodeFormatting.color = color;
      
      // Compute line breaks and formatting for special elements
      let prefix = '';
      let suffix = '';
      
      if (el.tagName === 'BR') return { text: '\n', position: currentPos + 1 };
      if (el.tagName === 'P' && currentPos > 0) prefix = '\n\n';
      if (el.tagName === 'DIV' && currentPos > 0) prefix = '\n';
      if (el.tagName === 'H1') {
        prefix = currentPos > 0 ? '\n\n' : '';
        suffix = '\n';
        nodeFormatting.size = '24pt';
        nodeFormatting.bold = true;
      }
      if (el.tagName === 'H2') {
        prefix = currentPos > 0 ? '\n\n' : '';
        suffix = '\n';
        nodeFormatting.size = '20pt';
        nodeFormatting.bold = true;
      }
      if (el.tagName === 'H3') {
        prefix = currentPos > 0 ? '\n\n' : '';
        suffix = '\n';
        nodeFormatting.size = '16pt';
        nodeFormatting.bold = true;
      }
      if (el.tagName === 'LI') {
        prefix = '• ';
        suffix = '\n';
      }
      if (el.tagName === 'UL' || el.tagName === 'OL') {
        suffix = '\n';
      }
      
      // Process children with accumulated formatting
      let text = prefix;
      let position = currentPos + prefix.length;
      
      for (const child of Array.from(el.childNodes)) {
        const result = processNode(child, position, nodeFormatting);
        text += result.text;
        position = result.position;
      }
      
      text += suffix;
      position += suffix.length;
      
      return { text, position };
    }
    
    return { text: '', position: currentPos };
  };
  
  const result = processNode(temp);
  
  return { 
    text: result.text.trim(), 
    formatting: formatting
  };
};

export const generateCaseDocument = (currentCase: Case, documentType: string, template?: string) => {
  if (!currentCase) {
    console.error("Cannot generate document: No case data provided");
    return null;
  }
  
  console.log("Generating document for case:", currentCase.fileNumber);
  const doc = new jsPDF();
  
  if (template) {
    // Process the template with case data
    const processedTemplate = replaceTemplateVariables(template, currentCase);
    
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
    
    // Convert HTML content to text, preserving formatting
    const { text, formatting } = cleanHtmlContent(processedTemplate);
    const lines = text.split('\n');
    
    let yPos = 40;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Track paragraph positions for formatting
    let currentTextPos = 0;
    
    // Process each line with formatting
    lines.forEach((line, lineIndex) => {
      if (line.trim().length === 0) {
        yPos += 6; // Empty line spacing
        currentTextPos += 1; // Account for the newline
        return;
      }
      
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // Split long lines to fit on the page
      const maxWidth = 170;
      const splitText = doc.splitTextToSize(line, maxWidth);
      
      // Apply formatting to each text segment
      splitText.forEach((textLine: string) => {
        // Find applicable formatting for this text position
        const lineFormatting = formatting.filter(f => 
          currentTextPos >= f.start && currentTextPos < f.end
        );
        
        // Apply formatting
        if (lineFormatting.length > 0) {
          const format = lineFormatting[0];
          
          // Set font style based on formatting
          let fontStyle = 'normal';
          if (format.bold && format.italic) fontStyle = 'bolditalic';
          else if (format.bold) fontStyle = 'bold';
          else if (format.italic) fontStyle = 'italic';
          
          doc.setFont('helvetica', fontStyle);
          
          // Set font size if specified
          if (format.size) {
            const size = parseInt(format.size);
            if (!isNaN(size)) {
              doc.setFontSize(size);
            }
          }
          
          // Set color if specified
          if (format.color) {
            doc.setTextColor(format.color);
          } else {
            doc.setTextColor(0, 0, 0); // Default black
          }
        } else {
          // Reset to default formatting
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
        }
        
        // Text alignment
        const textAlign = lineFormatting.length > 0 && lineFormatting[0].align 
          ? lineFormatting[0].align : 'left';
        
        let xPos = 20;
        const alignment: any = { align: 'left' };
        
        if (textAlign === 'center') {
          xPos = 105;
          alignment.align = 'center';
        } else if (textAlign === 'right') {
          xPos = 190;
          alignment.align = 'right';
        }
        
        // Render text with formatting
        doc.text(textLine, xPos, yPos, alignment);
        yPos += 7;
        
        // Update current position in text
        currentTextPos += textLine.length + 1; // +1 for the newline
      });
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
