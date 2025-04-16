import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  FilePlus, 
  ChevronRight,
  FileCheck,
  Download,
  Save,
  Printer,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Case, Party, Document } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface DocumentGeneratorProps {
  caseId?: string;
}

export default function DocumentGenerator({ caseId }: DocumentGeneratorProps) {
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState<string | undefined>(caseId);
  const [documentType, setDocumentType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [activeCaseData, setActiveCaseData] = useState<Case | undefined>(undefined);
  const [cases, setCases] = useState<Case[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<{id: number; name: string; description: string; content: string}[]>([]);
  const [currentDocumentContent, setCurrentDocumentContent] = useState<string>("");

  // Fetch all cases and templates on component mount
  useEffect(() => {
    fetchAllCases();
    fetchTemplates();
  }, []);

  // Reset document type when case changes
  useEffect(() => {
    setDocumentType("");
    setPreviewMode(false);
    
    if (selectedCase) {
      // Fetch case data when selected
      fetchCaseData(selectedCase);
    }
  }, [selectedCase]);
  
  // Fetch templates from database or local storage
  const fetchTemplates = async () => {
    try {
      // First check if we have templates in local storage
      const savedTemplates = localStorage.getItem('document_templates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      } else {
        // Default templates if nothing in storage
        const defaultTemplates = [
          {
            id: 1,
            name: "Demand Letter",
            description: "Default template for initial demands",
            content: "This is a sample demand letter template content."
          },
          {
            id: 2,
            name: "Petition",
            description: "Standard foreclosure petition",
            content: "This is a sample petition template content."
          },
          {
            id: 3,
            name: "Order Nisi",
            description: "Court order template",
            content: "This is a sample court order template content."
          }
        ];
        setTemplates(defaultTemplates);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Could not load document templates");
    }
  };

  // Fetch all cases from database
  const fetchAllCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          file_number,
          status,
          created_at,
          updated_at,
          property: properties (
            id,
            street,
            city,
            province,
            postal_code,
            property_type
          ),
          mortgage: mortgages (
            id,
            registration_number,
            principal,
            interest_rate,
            start_date,
            current_balance,
            per_diem_interest
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform case data
      if (data) {
        setCases(data.map(item => ({
          id: item.id,
          fileNumber: item.file_number,
          status: item.status,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          property: {
            id: item.property?.id || '',
            address: {
              street: item.property?.street || '',
              city: item.property?.city || '',
              province: item.property?.province || '',
              postalCode: item.property?.postal_code || ''
            },
            pid: '',
            legalDescription: '',
            propertyType: item.property?.property_type || 'Residential'
          },
          parties: [],
          mortgage: {
            id: item.mortgage?.id || '',
            registrationNumber: item.mortgage?.registration_number || '',
            principal: item.mortgage?.principal || 0,
            interestRate: item.mortgage?.interest_rate || 0,
            startDate: item.mortgage?.start_date || '',
            currentBalance: item.mortgage?.current_balance || 0,
            perDiemInterest: item.mortgage?.per_diem_interest || 0
          },
          deadlines: [],
          documents: []
        })));
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
      toast.error("Could not load cases");
    }
  };

  // Fetch detailed case data with parties
  const fetchCaseData = async (caseId: string) => {
    try {
      // Fetch case data including parties
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select(`
          id,
          file_number,
          status,
          created_at,
          updated_at,
          notes,
          court_file_number,
          court_registry,
          judge_name,
          hearing_date,
          property: properties (
            id,
            street,
            city,
            province,
            postal_code,
            property_type,
            pid,
            legal_description
          ),
          mortgage: mortgages (
            id,
            registration_number,
            principal,
            interest_rate,
            start_date,
            current_balance,
            per_diem_interest,
            arrears
          )
        `)
        .eq('id', caseId)
        .single();

      if (caseError) throw caseError;

      // Fetch parties for this case
      const { data: partyData, error: partyError } = await supabase
        .from('case_parties')
        .select(`
          party: parties (
            id,
            name,
            type,
            email,
            phone,
            address
          )
        `)
        .eq('case_id', caseId);

      if (partyError) throw partyError;

      // Fetch documents for the case
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });
          
      if (docError) throw docError;
        
      // Transform to match Document type
      const transformedDocs: Document[] = docData?.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        createdAt: doc.created_at,
        status: doc.status,
        caseId: doc.case_id,
        url: doc.url || undefined
      })) || [];
      
      setDocuments(transformedDocs);

      // Transform parties data
      const parties = partyData?.map(p => ({
        id: p.party.id,
        name: p.party.name,
        type: p.party.type,
        contactInfo: {
          email: p.party.email || '',
          phone: p.party.phone || '',
          address: p.party.address || ''
        }
      })) || [];

      // Create the full case object
      const fullCase: Case = {
        id: caseData.id,
        fileNumber: caseData.file_number,
        status: caseData.status,
        createdAt: caseData.created_at,
        updatedAt: caseData.updated_at,
        notes: caseData.notes,
        court: {
          fileNumber: caseData.court_file_number,
          registry: caseData.court_registry,
          judgeName: caseData.judge_name,
          hearingDate: caseData.hearing_date
        },
        property: {
          id: caseData.property.id,
          address: {
            street: caseData.property.street,
            city: caseData.property.city,
            province: caseData.property.province || '',
            postalCode: caseData.property.postal_code || ''
          },
          pid: caseData.property.pid || '',
          legalDescription: caseData.property.legalDescription || '',
          propertyType: caseData.property.property_type
        },
        mortgage: {
          id: caseData.mortgage.id,
          registrationNumber: caseData.mortgage.registration_number,
          principal: caseData.mortgage.principal,
          interestRate: caseData.mortgage.interest_rate,
          startDate: caseData.mortgage.start_date,
          currentBalance: caseData.mortgage.current_balance,
          perDiemInterest: caseData.mortgage.per_diem_interest,
          arrears: caseData.mortgage.arrears
        },
        parties: parties,
        deadlines: [],
        documents: transformedDocs
      };

      setActiveCaseData(fullCase);
      
    } catch (error) {
      console.error("Error fetching case data:", error);
      toast.error("Could not load case data");
    }
  };

  const handleGenerate = async () => {
    if (!selectedCase || !documentType) {
      toast.error("Please select both a case and document type");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Find the selected template
      const selectedTemplate = templates.find(t => `template-${t.id}` === documentType);
      
      // Generate document content based on template and case data
      const documentContent = selectedTemplate 
        ? generateDocumentContentFromTemplate(selectedTemplate.content, activeCaseData)
        : generateDocumentContent(documentType, activeCaseData);
        
      // Save current document content for preview
      setCurrentDocumentContent(documentContent);
        
      const documentTitle = selectedTemplate 
        ? `${selectedTemplate.name} - ${activeCaseData?.fileNumber || "Unknown"}`
        : `${getDocumentTypeName(documentType)} - ${activeCaseData?.fileNumber || "Unknown"}`;
      
      // Create a new document record in the database
      const { data: docData, error } = await supabase
        .from('documents')
        .insert({
          title: documentTitle,
          type: selectedTemplate ? "Other" : mapDocumentTypeToEnum(documentType),
          case_id: selectedCase,
          status: "Draft",
          content: documentContent
        })
        .select('*')
        .single();
          
      if (error) throw error;
        
      // Add the new document to the list
      const newDoc: Document = {
        id: docData.id,
        title: docData.title,
        type: docData.type,
        createdAt: docData.created_at,
        status: docData.status,
        caseId: docData.case_id,
        url: docData.url || undefined
      };
        
      setDocuments(prev => [newDoc, ...prev]);
      setIsGenerating(false);
      setPreviewMode(true);
        
      toast.success(`${documentTitle} created successfully`);
    } catch (error) {
      console.error("Error generating document:", error);
      setIsGenerating(false);
      toast.error("Failed to generate document");
    }
  };

  // Replace template variables with actual case data
  const generateDocumentContentFromTemplate = (templateContent: string, caseData?: Case): string => {
    if (!caseData) return templateContent;
    
    const borrower = caseData.parties.find(p => p.type === "Borrower");
    const lender = caseData.parties.find(p => p.type === "Lender");
    
    // Format helpers
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return new Date().toLocaleDateString('en-CA');
      return new Date(dateStr).toLocaleDateString('en-CA', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    };
    
    const formatCurrency = (value?: number) => {
      if (value === undefined) return "$0.00";
      return new Intl.NumberFormat('en-CA', {
        style: 'currency', currency: 'CAD'
      }).format(value);
    };
    
    // Replace variables in template
    let content = templateContent;
    
    // Basic replacements
    const replacements: Record<string, string> = {
      '{date}': formatDate(),
      '{property.address}': `${caseData.property.address.street}, ${caseData.property.address.city}, ${caseData.property.address.province} ${caseData.property.address.postalCode}`,
      '{property.street}': caseData.property.address.street,
      '{property.city}': caseData.property.address.city,
      '{property.province}': caseData.property.address.province,
      '{property.postal_code}': caseData.property.address.postalCode,
      '{property.pid}': caseData.property.pid || "[PID]",
      '{property.legal_description}': caseData.property.legalDescription || "[Legal Description]",
      '{mortgage.number}': caseData.mortgage.registrationNumber,
      '{mortgage.principal}': formatCurrency(caseData.mortgage.principal),
      '{mortgage.interest_rate}': `${caseData.mortgage.interestRate}%`,
      '{mortgage.balance}': formatCurrency(caseData.mortgage.currentBalance),
      '{mortgage.per_diem}': formatCurrency(caseData.mortgage.perDiemInterest),
      '{mortgage.arrears}': formatCurrency(caseData.mortgage.arrears),
      '{case.file_number}': caseData.fileNumber,
      '{case.status}': caseData.status,
      '{court.file_number}': caseData.court?.fileNumber || "[Court File Number]",
      '{court.registry}': caseData.court?.registry || "Vancouver",
      '{court.hearing_date}': formatDate(caseData.court?.hearingDate),
      '{court.judge_name}': caseData.court?.judgeName || "[Judge Name]",
      '{borrower.name}': borrower?.name || "[BORROWER NAME]",
      '{borrower.address}': borrower?.contactInfo?.address || "[BORROWER ADDRESS]",
      '{borrower.email}': borrower?.contactInfo?.email || "",
      '{borrower.phone}': borrower?.contactInfo?.phone || "",
      '{lender.name}': lender?.name || "[LENDER NAME]",
      '{lender.address}': lender?.contactInfo?.address || ""
    };
    
    // Replace all variables
    for (const [key, value] of Object.entries(replacements)) {
      content = content.replace(new RegExp(key, 'g'), value);
    }
    
    return content;
  };

  // Map our internal document type IDs to the enum values expected by the database
  const mapDocumentTypeToEnum = (docType: string): Document['type'] => {
    switch (docType) {
      case "demand": return "Demand Letter";
      case "payout": return "Other";
      case "petition": return "Petition";
      case "ordernisi": return "Order Nisi";
      case "conduct": return "Conduct of Sale";
      default: return "Other";
    }
  };

  const getDocumentTypeName = (typeId: string): string => {
    if (typeId.startsWith('template-')) {
      const templateId = parseInt(typeId.split('-')[1]);
      return templates.find(t => t.id === templateId)?.name || "Document";
    }
    return templateTypes.find(t => t.id === typeId)?.name || "Document";
  };

  const getDocumentIcon = (docType: string) => {
    switch (docType) {
      case "petition":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "demand": 
        return <FileText className="h-5 w-5 text-red-500" />;
      case "payout":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "ordernisi":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "conduct":
        return <FileText className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };
  
  // Template types for document generation
  const templateTypes = [
    {
      id: "demand",
      name: "Demand Letter",
      description: "Default demand letter with 10-day notice period",
    },
    {
      id: "payout",
      name: "Payout Statement",
      description: "Statement of mortgage payout with per diem interest",
    },
    {
      id: "petition",
      name: "Petition Package",
      description: "Complete foreclosure petition with supporting documents",
    },
    {
      id: "ordernisi",
      name: "Order Nisi",
      description: "Order Nisi with redemption period",
    },
    {
      id: "conduct",
      name: "Conduct of Sale",
      description: "Application for conduct of sale",
    },
  ];

  const generateDocumentContent = (docType: string, caseData?: Case): string => {
    if (!caseData) return "";
    
    const borrower = caseData.parties.find(p => p.type === "Borrower");
    const lender = caseData.parties.find(p => p.type === "Lender");
    
    // Format date helper function
    const formatDateString = (dateStr?: string) => {
      if (!dateStr) return new Date().toLocaleDateString('en-CA');
      return new Date(dateStr).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Format currency helper function
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD'
      }).format(value);
    };
    
    switch (docType) {
      case "demand":
        return `WITHOUT PREJUDICE

DATE: ${formatDateString()}

RE: DEMAND FOR PAYMENT

Property: ${caseData.property.address.street}, ${caseData.property.address.city}, ${caseData.property.address.province}
Mortgage Registration: ${caseData.mortgage.registrationNumber}
Balance Due: ${formatCurrency(caseData.mortgage.currentBalance)}

Dear ${borrower?.name || "[BORROWER NAME]"},

Please be advised that we represent ${lender?.name || "[LENDER NAME]"} in connection with the above-noted mortgage. Our client advises that you are in default of your payment obligations under the mortgage.

As of ${formatDateString()}, the following amounts are due and owing:

Principal Balance: ${formatCurrency(caseData.mortgage.currentBalance)}
Arrears: ${formatCurrency(caseData.mortgage.arrears || 0)}
Per Diem Interest: ${formatCurrency(caseData.mortgage.perDiemInterest)}/day

DEMAND IS HEREBY MADE for payment of the full amount due and owing within 10 days of the date of this letter, failing which our client may commence foreclosure proceedings without further notice to you.

Yours truly,`;

      case "petition":
        return `No. ${caseData.court?.fileNumber || "[Court File Number]"}
${caseData.court?.registry || "Vancouver"} Registry

IN THE SUPREME COURT OF BRITISH COLUMBIA

BETWEEN:
${lender?.name || "[LENDER NAME]"}
PETITIONER

AND:
${borrower?.name || "[BORROWER NAME]"}
RESPONDENT

PETITION TO THE COURT

ON NOTICE TO:
${borrower?.name || "[BORROWER NAME]"}, of ${caseData.property.address.street}, ${caseData.property.address.city}, ${caseData.property.address.province} ${caseData.property.address.postalCode}

This proceeding is brought for the foreclosure of a mortgage.

THE PETITIONER CLAIMS:

1. An Order Nisi of Foreclosure with respect to the lands and premises legally described as:
   PID: ${caseData.property.pid || "[PID]"}
   ${caseData.property.legalDescription || "[LEGAL DESCRIPTION]"}
   (the "Property")

2. A declaration that as at ${formatDateString()}, the Respondent is indebted to the Petitioner under the mortgage in the amount of ${formatCurrency(caseData.mortgage.currentBalance)}.

3. A declaration that the monies secured by the mortgage are due and owing to the Petitioner.

4. Interest pursuant to the mortgage at the rate of ${caseData.mortgage.interestRate}% per annum.

5. A redemption period of six months.

[...]`;
      
      case "payout":
        return `MORTGAGE PAYOUT STATEMENT

DATE: ${formatDateString()}

RE: ${caseData.property.address.street}, ${caseData.property.address.city}, ${caseData.property.address.province}

Mortgagor: ${borrower?.name || "[BORROWER NAME]"}
Mortgagee: ${lender?.name || "[LENDER NAME]"}
Mortgage Registration: ${caseData.mortgage.registrationNumber}

MORTGAGE BALANCE

Principal Balance: ${formatCurrency(caseData.mortgage.currentBalance)}
Interest to ${formatDateString()}: ${formatCurrency((caseData.mortgage.perDiemInterest || 0) * 10)} (10 days)
Per Diem Interest: ${formatCurrency(caseData.mortgage.perDiemInterest)}/day
Legal Fees and Disbursements: ${formatCurrency(1250.00)} (estimated)

TOTAL PAYOUT AMOUNT: ${formatCurrency(caseData.mortgage.currentBalance + ((caseData.mortgage.perDiemInterest || 0) * 10) + 1250.00)}

This statement is valid until ${formatDateString(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString())}

[...]`;
        
      case "ordernisi":
        return `ORDER NISI OF FORECLOSURE

No. ${caseData.court?.fileNumber || "[Court File Number]"}
${caseData.court?.registry || "Vancouver"} Registry

BEFORE THE HONOURABLE
JUSTICE ${caseData.court?.judgeName || "[NAME]"}
)
)
) ${formatDateString(caseData.court?.hearingDate)}

BETWEEN:
${lender?.name || "[LENDER NAME]"}
PETITIONER

AND:
${borrower?.name || "[BORROWER NAME]"}
RESPONDENT

ORDER

THIS APPLICATION of the Petitioner coming on for hearing before me on ${formatDateString(caseData.court?.hearingDate)} and on hearing counsel for the Petitioner and no one appearing for the Respondent although duly served; AND JUDGMENT being granted to the Petitioner against the Respondent for the sum of ${formatCurrency(caseData.mortgage.currentBalance)} together with interest thereon at the rate of ${caseData.mortgage.interestRate}% per annum from the date of judgment.

THIS COURT ORDERS that:

1. The Respondent shall have a period of six (6) months from the date of this Order (the "Redemption Period") to redeem the mortgage in question (the "Mortgage") by paying to the Petitioner the sum of ${formatCurrency(caseData.mortgage.currentBalance)} together with interest thereon at the rate of ${caseData.mortgage.interestRate}% per annum from the date of judgment.

[...]
REDEMPTION PERIOD: 6 MONTHS`;
      
      case "conduct":
        return `APPLICATION FOR CONDUCT OF SALE

No. ${caseData.court?.fileNumber || "[Court File Number]"}
${caseData.court?.registry || "Vancouver"} Registry

BETWEEN:
${lender?.name || "[LENDER NAME]"}
PETITIONER

AND:
${borrower?.name || "[BORROWER NAME]"}
RESPONDENT

APPLICATION

TO: The Respondents, ${borrower?.name || "[BORROWER NAME]"}

TAKE NOTICE that an application will be made by the Petitioner to the presiding Judge at the Courthouse at ${caseData.court?.registry || "Vancouver"}, British Columbia, on ${formatDateString(caseData.court?.hearingDate)} for an Order that:

1. The Petitioner shall have conduct of sale of the lands and premises legally described as:
   PID: ${caseData.property.pid || "[PID]"}
   ${caseData.property.legalDescription || "[LEGAL DESCRIPTION]"}
   (the "Property")

2. The Property shall be listed for sale on the Multiple Listing Service with a licensed real estate agent chosen by the Petitioner;

3. The Petitioner shall be at liberty to approve any offer to purchase the Property;

4. The sale shall be free and clear of the interest of all Respondents;

[...]`;
      
      default:
        return "";
    }
  };

  const handleSaveDocument = async (documentId: string) => {
    toast.success("Document status updated to 'Finalized'");
    
    try {
      // Update document status in database
      await supabase
        .from('documents')
        .update({ status: 'Finalized' })
        .eq('id', documentId);
        
      // Update local state
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'Finalized' } 
            : doc
        )
      );
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document");
    }
  };
  
  const handlePrintDocument = (documentId: string) => {
    const documentToPrint = documents.find(doc => doc.id === documentId);
    if (!documentToPrint) {
      toast.error("Document not found");
      return;
    }
    
    // Fetch document content if needed
    fetchDocumentContent(documentId).then(content => {
      if (!content) {
        toast.error("Could not load document content");
        return;
      }
      
      // Open a new window with formatted content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${documentToPrint.title}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 40px;
                  line-height: 1.5;
                }
                h1 {
                  text-align: center;
                  font-size: 18px;
                  margin-bottom: 20px;
                }
                pre {
                  white-space: pre-wrap;
                  font-family: Arial, sans-serif;
                }
              </style>
            </head>
            <body>
              <h1>${documentToPrint.title}</h1>
              <pre>${content}</pre>
              <script>
                window.onload = function() {
                  window.print();
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        toast.success("Print dialog opened");
      } else {
        toast.error("Could not open print window. Please check your popup blocker settings.");
      }
    });
  };
  
  const handleDownloadDocument = (documentId: string) => {
    const documentToDownload = documents.find(doc => doc.id === documentId);
    if (!documentToDownload) {
      toast.error("Document not found");
      return;
    }
    
    // Fetch document content if needed
    fetchDocumentContent(documentId).then(content => {
      if (!content) {
        toast.error("Could not load document content");
        return;
      }
      
      // Create a Blob containing the document content
      const blob = new Blob([content], { type: "text/plain" });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentToDownload.title}.txt`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${documentToDownload.title} downloaded successfully`);
    });
  };

  const fetchDocumentContent = async (documentId: string): Promise<string> => {
    try {
      // If we're in preview mode and it's the current document, return the current content
      if (previewMode && documents[0]?.id === documentId && currentDocumentContent) {
        return currentDocumentContent;
      }
      
      const { data, error } = await supabase
        .from('documents')
        .select('content')
        .eq('id', documentId)
        .single();
        
      if (error) throw error;
      return data.content || "";
    } catch (error) {
      console.error("Error fetching document content:", error);
      return "";
    }
  };
  
  const viewDocument = (documentId: string) => {
    navigate(`/document/${documentId}`);
  };

  return (
    <Card className={caseId ? "shadow-sm" : "shadow-sm"}>
      {!caseId && (
        <CardHeader>
          <CardTitle>Document Generator</CardTitle>
          <CardDescription>
            Generate legal documents with auto-populated case data
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid gap-4">
          {!caseId && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Case</label>
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a case" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((caseItem) => (
                    <SelectItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.fileNumber} - {caseItem.property.address.street}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Document Type</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {/* Built-in templates */}
                <SelectItem value="built-in-header" disabled>Built-in Templates</SelectItem>
                {templateTypes.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex flex-col">
                      <span>{template.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {template.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                
                {/* Custom templates */}
                {templates.length > 0 && <SelectItem value="custom-header" disabled className="mt-2">Custom Templates</SelectItem>}
                {templates.map((template) => (
                  <SelectItem key={`template-${template.id}`} value={`template-${template.id}`}>
                    <div className="flex flex-col">
                      <span>{template.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {template.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Document Preview</h3>
            
            {previewMode && documentType && activeCaseData ? (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {getDocumentIcon(documentType)}
                  <span className="font-medium">
                    {getDocumentTypeName(documentType)} - {activeCaseData.fileNumber}
                  </span>
                </div>
                
                <div className="border rounded bg-muted/30 p-3 text-sm mb-3 max-h-60 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans">
                    {currentDocumentContent || (documentType.startsWith('template-') 
                      ? generateDocumentContentFromTemplate(
                          templates.find(t => `template-${t.id}` === documentType)?.content || "",
                          activeCaseData
                        )
                      : generateDocumentContent(documentType, activeCaseData))
                    }
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 bg-gray-100 rounded border-dashed border-2 text-muted-foreground">
                <FileText className="h-12 w-12 opacity-30" />
              </div>
            )}
            
            <div className="mt-4 flex justify-end gap-3">
              {previewMode ? (
                <>
                  <Button variant="outline" className="gap-2" onClick={() => setPreviewMode(false)}>
                    <FileText className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    className="gap-2 bg-law-navy hover:bg-law-navy/90"
                    onClick={() => handleSaveDocument(documents[0]?.id)}
                  >
                    <Save className="h-4 w-4" />
                    Save Final
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="gap-2"
                    onClick={() => handlePrintDocument(documents[0]?.id)}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => handleDownloadDocument(documents[0]?.id)}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    onClick={() => {
                      if (selectedCase && documentType && activeCaseData) {
                        setPreviewMode(true);
                      } else {
                        toast.error("Please select case and document type");
                      }
                    }}
                    disabled={!selectedCase || !documentType || !activeCaseData}
                  >
                    <FilePlus className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    className="gap-2 bg-law-navy hover:bg-law-navy/90"
                    onClick={handleGenerate}
                    disabled={!selectedCase || !documentType || !activeCaseData || isGenerating}
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      <>
                        Generate
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-2">
            <h3 className="text-sm font-medium mb-2">Recent Documents</h3>
            <div className="space-y-2">
              {documents && documents.length > 0 ? (
                documents.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 cursor-pointer"
                    onClick={() => viewDocument(doc.id)}
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-law-teal" />
                      <span className="text-sm">{doc.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={doc.status === "Draft" ? "outline" : "default"}>
                        {doc.status}
                      </Badge>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground p-3 border rounded-md text-center">
                  No documents found
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
