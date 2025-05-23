
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Case, DocumentType } from '@/types';
import { generateCaseDocument } from '@/utils/pdfGenerator';
import { uploadDocument } from '@/services/documentService';
import { useCase } from '@/hooks/useCase';
import DocumentTypeSelect from './DocumentTypeSelect';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Save, Printer, Download, FileText, Type, ListOrdered, 
  List, Image, Link
} from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface FontOption {
  name: string;
  value: string;
}

const fontOptions: FontOption[] = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Calibri', value: 'Calibri, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
];

const fontSizes = ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt', '32pt', '36pt', '48pt', '72pt'];

const DocumentEditor: React.FC<DocumentEditorProps> = ({ selectedCase, caseId }) => {
  const [documentType, setDocumentType] = useState<DocumentType>('Demand Letter');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [content, setContent] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const { currentCase } = useCase(selectedCase, caseId);
  const editorRef = useRef<HTMLDivElement>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [currentFont, setCurrentFont] = useState<string>(fontOptions[0].value);
  const [currentFontSize, setCurrentFontSize] = useState<string>('12pt');
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Load templates and initial content
  useEffect(() => {
    const savedTemplates = localStorage.getItem('document_templates');
    if (savedTemplates) {
      try {
        const parsedTemplates = JSON.parse(savedTemplates);
        setTemplates(parsedTemplates);
        
        const matchingTemplate = parsedTemplates.find((t: Template) => t.name === documentType);
        if (matchingTemplate) {
          setSelectedTemplate(matchingTemplate.id);
          setContent(matchingTemplate.content);
        } else {
          setSelectedTemplate(null);
          setContent('<p>Enter your document content here...</p>');
        }
      } catch (error) {
        console.error("Failed to parse templates:", error);
        setContent('<p>Enter your document content here...</p>');
      }
    } else {
      setContent('<p>Enter your document content here...</p>');
    }
    
    if (!documentTitle && currentCase) {
      setDocumentTitle(`${documentType} - ${currentCase.fileNumber} - ${format(new Date(), 'yyyy-MM-dd')}`);
    } else if (!documentTitle) {
      setDocumentTitle(`${documentType} - ${format(new Date(), 'yyyy-MM-dd')}`);
    }
  }, [documentType, currentCase]);
  
  // Load template content when template changes
  useEffect(() => {
    if (selectedTemplate !== null) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setContent(template.content);
        if (!documentTitle && currentCase) {
          setDocumentTitle(`${template.name} - ${currentCase.fileNumber} - ${format(new Date(), 'yyyy-MM-dd')}`);
        } else if (!documentTitle) {
          setDocumentTitle(`${template.name} - ${format(new Date(), 'yyyy-MM-dd')}`);
        }
      }
    }
  }, [selectedTemplate, templates]);
  
  // Process template variables when content or case changes
  useEffect(() => {
    if (currentCase && content) {
      try {
        const processedContent = replaceTemplateVariables(content, currentCase);
        setPreviewContent(processedContent);
      } catch (error) {
        console.error("Error processing template variables:", error);
        setPreviewContent(content);
      }
    } else {
      setPreviewContent(content);
    }
  }, [content, currentCase, activeTab]);
  
  // Setup editor event handlers
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      
      const handleInput = () => {
        setContent(editor.innerHTML);
        saveSelection();
      };
      
      const handleFocus = () => {
        if (savedSelection) {
          restoreSelection();
        }
        
        // Set default font and size
        document.execCommand('fontName', false, currentFont);
        document.execCommand('fontSize', false, currentFontSize);
      };
      
      const handleBlur = () => {
        saveSelection();
      };
      
      const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain') || '';
        document.execCommand('insertText', false, text);
      };
      
      // Prevent default handling that might cause scroll issues
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          document.execCommand('insertText', false, '    ');
        }
        
        // Don't let these events bubble up
        e.stopPropagation();
      };
      
      // Attach all event handlers
      editor.addEventListener('input', handleInput);
      editor.addEventListener('focus', handleFocus);
      editor.addEventListener('blur', handleBlur);
      editor.addEventListener('paste', handlePaste);
      editor.addEventListener('keydown', handleKeyDown);
      
      // Clean up
      return () => {
        editor.removeEventListener('input', handleInput);
        editor.removeEventListener('focus', handleFocus);
        editor.removeEventListener('blur', handleBlur);
        editor.removeEventListener('paste', handlePaste);
        editor.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentFont, currentFontSize, savedSelection]);
  
  // Save and restore selection to maintain cursor position
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      setSavedSelection(selection.getRangeAt(0).cloneRange());
    }
  };
  
  const restoreSelection = () => {
    if (savedSelection && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection);
      }
    }
  };

  // Replace template variables with case data
  const replaceTemplateVariables = (template: string, caseData: Case): string => {
    if (!caseData) return template;
    
    const replacements: Record<string, string> = {
      '{date}': format(new Date(), 'MMMM d, yyyy'),
      '{property.address}': caseData.property ? `${caseData.property.address.street}, ${caseData.property.address.city}, ${caseData.property.address.province} ${caseData.property.address.postalCode}` : 'N/A',
      '{mortgage.number}': caseData.mortgage?.registrationNumber || 'N/A',
      '{mortgage.balance}': (caseData.mortgage?.currentBalance || 0).toLocaleString(),
      '{mortgage.principal}': (caseData.mortgage?.principal || 0).toLocaleString(),
      '{mortgage.per_diem}': (caseData.mortgage?.perDiemInterest || 0).toFixed(2),
      '{mortgage.interest_rate}': `${caseData.mortgage?.interestRate || 0}%`,
      '{mortgage.arrears}': caseData.mortgage?.arrears?.toLocaleString() || 'N/A',
      '{court.file_number}': caseData.court?.fileNumber || 'N/A',
      '{court.registry}': caseData.court?.registry || 'N/A',
      '{court.hearing_date}': caseData.court?.hearingDate 
        ? format(new Date(caseData.court.hearingDate), 'MMMM d, yyyy') 
        : 'N/A',
      '{court.judge_name}': caseData.court?.judgeName || 'N/A',
      '{case.file_number}': caseData.fileNumber || 'N/A',
      '{case.status}': caseData.status || 'N/A',
      '{case.created_at}': caseData.createdAt ? format(new Date(caseData.createdAt), 'MMMM d, yyyy') : 'N/A'
    };

    if (caseData.parties && Array.isArray(caseData.parties)) {
      caseData.parties.forEach(party => {
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

    if (!replacements['{lender.name}']) {
      const lender = caseData.parties?.find(p => 
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
      const borrower = caseData.parties?.find(p => 
        p.type.toLowerCase().includes('borrower') || 
        p.type.toLowerCase().includes('mortgagor')
      );
      if (borrower) {
        replacements['{borrower.name}'] = borrower.name || 'N/A';
        replacements['{borrower.email}'] = borrower.contactInfo?.email || 'N/A';
        replacements['{borrower.phone}'] = borrower.contactInfo?.phone || 'N/A';
      }
    }

    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedKey, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  };

  // Format text in editor
  const handleTextFormatting = (command: string, value: string = '') => {
    if (!editorRef.current) return;
    
    // Focus editor
    editorRef.current.focus();
    
    // Restore selection if needed
    if (savedSelection) {
      restoreSelection();
    }
    
    // Execute command
    document.execCommand(command, false, value);
    
    // Update state and save selection
    setContent(editorRef.current.innerHTML);
    saveSelection();
  };
  
  // Apply font size to selected text
  const applyFontSize = (size: string) => {
    setCurrentFontSize(size);
    
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    if (savedSelection) {
      restoreSelection();
    }
    
    const span = document.createElement('span');
    span.style.fontSize = size;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      if (range.collapsed) {
        // No text selected, just set for upcoming text
        span.innerHTML = '&#8203;'; // Zero-width space
        range.insertNode(span);
        range.setStartAfter(span);
        range.collapse(true);
      } else {
        // Wrap selected text
        span.appendChild(range.extractContents());
        range.insertNode(span);
        range.selectNodeContents(span);
      }
      
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    setContent(editorRef.current.innerHTML);
    saveSelection();
  };

  // Save document
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
      const finalContent = replaceTemplateVariables(content, currentCase);
      
      const doc = generateCaseDocument(currentCase, documentType, finalContent);
      if (!doc) {
        throw new Error("Failed to generate document");
      }
      
      const filename = `${documentTitle.replace(/\s+/g, '_')}.pdf`;
      
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      
      await uploadDocument(currentCase.id, file, filename, documentType);
      
      toast.success("Document saved successfully!");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Print document
  const handlePrint = () => {
    if (!currentCase) {
      toast.error("No case selected. Please select a case for document generation.");
      return;
    }
    
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${documentTitle || documentType}</title>
              <style>
                @media print {
                  body { 
                    font-family: ${currentFont}; 
                    line-height: 1.6; 
                    margin: 20px;
                    color: #000;
                  }
                  h1, h2, h3 { margin-top: 20px; margin-bottom: 10px; }
                  p { margin-bottom: 10px; }
                  button { display: none !important; }
                  @page { margin: 2cm; }
                }
                body { 
                  font-family: ${currentFont}; 
                  line-height: 1.6; 
                  margin: 20px;
                  padding: 20px;
                }
                .document-header {
                  text-align: center;
                  margin-bottom: 30px;
                }
                .document-title {
                  font-size: 24px;
                  font-weight: bold;
                }
                .document-date {
                  color: #666;
                  margin-top: 5px;
                  font-size: 14px;
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
                .print-button:hover {
                  background: #0066b3;
                }
                @media print {
                  .print-button {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              <button class="print-button" onclick="window.print()">Print Document</button>
              
              <div class="document-header">
                <div class="document-title">${documentTitle || documentType}</div>
                <div class="document-date">Generated: ${format(new Date(), 'MMMM d, yyyy')}</div>
              </div>
              
              <div>
                ${previewContent}
              </div>
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

  // Download document
  const handleDownload = () => {
    if (!currentCase) {
      toast.error("No case selected.");
      return;
    }
    
    try {
      const doc = generateCaseDocument(currentCase, documentType, previewContent);
      if (!doc) {
        throw new Error("Failed to generate document");
      }
      
      const filename = documentTitle ? 
        `${documentTitle.replace(/\s+/g, '_')}.pdf` : 
        `Case_${currentCase.fileNumber}_${documentType}.pdf`;
      
      doc.save(filename);
      toast.success("Document downloaded successfully!");
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document.");
    }
  };

  // Email document
  const handleEmail = () => {
    const subject = encodeURIComponent(documentTitle || documentType);
    const body = encodeURIComponent('Please see the attached document.');
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    toast.info("Email client opened. Please attach the downloaded document manually.");
    
    handleDownload();
  };

  // Set font for editor
  const handleSetFont = (font: string) => {
    setCurrentFont(font);
    handleTextFormatting('fontName', font);
  };

  // Insert variable into editor
  const insertVariable = (variable: string) => {
    if (!editorRef.current) return;
    
    // Focus and restore selection
    editorRef.current.focus();
    if (savedSelection) {
      restoreSelection();
    }
    
    const span = document.createElement('span');
    span.className = 'bg-blue-100 rounded-md px-1 py-0.5 text-blue-800';
    span.contentEditable = 'false';
    span.textContent = variable;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(span);
      
      // Move cursor after variable
      range.setStartAfter(span);
      range.setEndAfter(span);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Add space after variable
      document.execCommand('insertText', false, ' ');
      
      // Save cursor position and update content
      saveSelection();
      setContent(editorRef.current.innerHTML);
    }
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
              value={selectedTemplate !== null ? selectedTemplate.toString() : "no-template"} 
              onValueChange={(value) => setSelectedTemplate(value !== "no-template" ? parseInt(value) : null)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-template">No Template</SelectItem>
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
            <Link className="h-4 w-4 mr-1" />
            Email
          </Button>
          <Button onClick={handleSaveDocument} disabled={isGenerating || !currentCase || !content}>
            <Save className="h-4 w-4 mr-1" />
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
            <div className="flex items-center gap-1 mr-2">
              <Select value={currentFont} onValueChange={handleSetFont}>
                <SelectTrigger className="w-40 h-8">
                  <Type className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map(font => (
                    <SelectItem key={font.name} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={currentFontSize} onValueChange={applyFontSize}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map(size => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-0.5">
              <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('bold')} className="h-8 px-2">
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('italic')} className="h-8 px-2">
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('underline')} className="h-8 px-2">
                <Underline className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="h-6 border-r mx-1"></div>
            
            <div className="flex items-center gap-0.5">
              <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('justifyLeft')} className="h-8 px-2">
                <AlignLeft className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('justifyCenter')} className="h-8 px-2">
                <AlignCenter className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('justifyRight')} className="h-8 px-2">
                <AlignRight className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('justifyFull')} className="h-8 px-2">
                <AlignJustify className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="h-6 border-r mx-1"></div>
            
            <div className="flex items-center gap-0.5">
              <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('insertOrderedList')} className="h-8 px-2">
                <ListOrdered className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('insertUnorderedList')} className="h-8 px-2">
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="h-6 border-r mx-1"></div>
            
            <div className="flex items-center gap-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 px-2">
                    <Type className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleTextFormatting('formatBlock', '<h1>')}>
                    <Type className="h-3.5 w-3.5 mr-2" /> Heading 1
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTextFormatting('formatBlock', '<h2>')}>
                    <Type className="h-3.5 w-3.5 mr-2" /> Heading 2
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTextFormatting('formatBlock', '<h3>')}>
                    <Type className="h-3.5 w-3.5 mr-2" /> Heading 3
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTextFormatting('formatBlock', '<p>')}>
                    <Type className="h-3.5 w-3.5 mr-2" /> Paragraph
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="h-6 border-r mx-1"></div>
            
            <div className="flex items-center gap-0.5">
              <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('undo')} className="h-8 px-2">
                <Undo className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleTextFormatting('redo')} className="h-8 px-2">
                <Redo className="h-3.5 w-3.5" />
              </Button>
            </div>
            
            <div className="h-6 border-r mx-1"></div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="ml-auto h-8">
                  Insert Variable
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <Card>
                  <ScrollArea className="h-60">
                    <div className="p-2 grid grid-cols-2 gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="justify-start text-left text-xs h-7"
                        onClick={() => insertVariable('{date}')}
                      >
                        {'{date}'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="justify-start text-left text-xs h-7"
                        onClick={() => insertVariable('{property.address}')}
                      >
                        {'{property.address}'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="justify-start text-left text-xs h-7"
                        onClick={() => insertVariable('{mortgage.number}')}
                      >
                        {'{mortgage.number}'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="justify-start text-left text-xs h-7"
                        onClick={() => insertVariable('{mortgage.balance}')}
                      >
                        {'{mortgage.balance}'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="justify-start text-left text-xs h-7"
                        onClick={() => insertVariable('{mortgage.principal}')}
                      >
                        {'{mortgage.principal}'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="justify-start text-left text-xs h-7"
                        onClick={() => insertVariable('{mortgage.per_diem}')}
                      >
                        {'{mortgage.per_diem}'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="justify-start text-left text-xs h-7"
                        onClick={() => insertVariable('{mortgage.interest_rate}')}
                      >
                        {'{mortgage.interest_rate}'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="justify-start text-left text-xs h-7"
                        onClick={() => insertVariable('{mortgage.arrears}')}
                      >
                        {'{mortgage.arrears}'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="justify-start text-left text-xs h-7"
                        onClick={() => insertVariable('{case.file_number}')}
                      >
                        {'{case.file_number}'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="justify-start text-left text-xs h-7"
                        onClick={() => insertVariable('{lender.name}')}
                      >
                        {'{lender.name}'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="justify-start text-left text-xs h-7"
                        onClick={() => insertVariable('{borrower.name}')}
                      >
                        {'{borrower.name}'}
                      </Button>
                    </div>
                  </ScrollArea>
                </Card>
              </PopoverContent>
            </Popover>
          </div>
          
          <ScrollArea className="h-[500px] w-full border rounded-md p-3">
            <div
              ref={editorRef}
              className="min-h-full outline-none"
              contentEditable
              dangerouslySetInnerHTML={{ __html: content }}
              style={{ fontFamily: currentFont }}
            />
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="preview" className="border rounded-md">
          <ScrollArea className="h-[600px] w-full p-6">
            <div 
              className="preview-content" 
              style={{ fontFamily: currentFont }}
              dangerouslySetInnerHTML={{ __html: previewContent }} 
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentEditor;
