
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
  Save
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { mockCases } from "@/data/mockData";
import { Case, Party, Document } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface DocumentGeneratorProps {
  caseId?: string;
}

export default function DocumentGenerator({ caseId }: DocumentGeneratorProps) {
  const [selectedCase, setSelectedCase] = useState<string | undefined>(caseId);
  const [documentType, setDocumentType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [activeCaseData, setActiveCaseData] = useState<Case | undefined>(undefined);
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [documents, setDocuments] = useState<Document[]>([]);

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

  // Reset document type when case changes
  useEffect(() => {
    setDocumentType("");
    setPreviewMode(false);
    
    if (selectedCase) {
      // Fetch case data when selected
      fetchCaseData(selectedCase);
    }
  }, [selectedCase]);
  
  // Fetch real case data from Supabase
  const fetchCaseData = async (caseId: string) => {
    try {
      // Use mock data for now, would replace with real data fetch
      const caseData = cases.find(c => c.id === caseId);
      setActiveCaseData(caseData);
      
      // Fetch documents for the selected case
      if (caseId) {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Transform to match Document type
        const transformedDocs: Document[] = data.map(doc => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          createdAt: doc.created_at,
          status: doc.status,
          caseId: doc.case_id,
          url: doc.url || undefined
        }));
        
        setDocuments(transformedDocs);
      }
    } catch (error) {
      console.error("Error fetching case data:", error);
      toast({
        title: "Error",
        description: "Could not load case data",
        variant: "destructive"
      });
    }
  };

  const handleGenerate = async () => {
    if (!selectedCase || !documentType) {
      toast({
        title: "Missing Information",
        description: "Please select both a case and document type.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // In a real app, we would generate the document content here
      // For now, simulate document generation with timeout
      setTimeout(async () => {
        // Create a new document record in the database
        const documentTitle = `${getDocumentTypeName(documentType)} - ${activeCaseData?.fileNumber || "Unknown"}`;
        
        const { data: docData, error } = await supabase
          .from('documents')
          .insert({
            title: documentTitle,
            type: mapDocumentTypeToEnum(documentType),
            case_id: selectedCase,
            status: "Draft",
            content: generateDocumentContent(documentType, activeCaseData)
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
        
        toast({
          title: "Document Generated",
          description: `${documentTitle} created successfully.`,
        });
      }, 1500);
    } catch (error) {
      console.error("Error generating document:", error);
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to generate document",
        variant: "destructive"
      });
    }
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
  
  // Generate document content based on template and case data
  const generateDocumentContent = (docType: string, caseData?: Case): string => {
    if (!caseData) return "";
    
    const borrower = caseData.parties.find(p => p.type === "Borrower");
    const lender = caseData.parties.find(p => p.type === "Lender");
    
    switch (docType) {
      case "demand":
        return `WITHOUT PREJUDICE

RE: DEMAND FOR PAYMENT

Property: ${caseData.property.address.street}, ${caseData.property.address.city}
Mortgage: ${caseData.mortgage.registrationNumber}
Balance Due: $${caseData.mortgage.currentBalance.toLocaleString()}

Dear ${borrower?.name},

Please be advised that we represent ${lender?.name} in connection with the above-noted mortgage. Our client advises that you are in default of your payment obligations under the mortgage.

As of ${new Date().toLocaleDateString()}, the following amounts are due and owing:

Principal Balance: $${caseData.mortgage.currentBalance.toLocaleString()}
Arrears: $${caseData.mortgage.arrears?.toLocaleString() || "0.00"}
Per Diem Interest: $${caseData.mortgage.perDiemInterest.toLocaleString()}/day

DEMAND IS HEREBY MADE for payment of the full amount due and owing within 10 days of the date of this letter, failing which our client may commence foreclosure proceedings without further notice to you.

Yours truly,`;

      case "petition":
        return `No. ${caseData.court?.fileNumber || "[Court File Number]"}
${caseData.court?.registry || "Vancouver"} Registry

IN THE SUPREME COURT OF BRITISH COLUMBIA

BETWEEN:
${lender?.name}
PETITIONER

AND:
${borrower?.name}
RESPONDENT

PETITION TO THE COURT

ON NOTICE TO:
${borrower?.name}, of ${caseData.property.address.street}, ${caseData.property.address.city}, ${caseData.property.address.province}

This proceeding is brought for the foreclosure of a mortgage.

[...]`;
      
      case "payout":
        return `MORTGAGE PAYOUT STATEMENT

Property: ${caseData.property.address.street}
Mortgagor: ${borrower?.name}
Principal Balance: $${caseData.mortgage.currentBalance.toLocaleString()}
Per Diem Interest: $${caseData.mortgage.perDiemInterest.toLocaleString()}/day

[...]`;
        
      case "ordernisi":
        return `ORDER NISI OF FORECLOSURE

No. ${caseData.court?.fileNumber || "[Court File Number]"}
${caseData.court?.registry || "Vancouver"} Registry

BEFORE THE HONOURABLE
JUSTICE [NAME]
)
)
) [DATE]

BETWEEN:
${lender?.name}
PETITIONER

AND:
${borrower?.name}
RESPONDENT

[...]
REDEMPTION PERIOD: 6 MONTHS`;
      
      case "conduct":
        return `APPLICATION FOR CONDUCT OF SALE

No. ${caseData.court?.fileNumber || "[Court File Number]"}
${caseData.court?.registry || "Vancouver"} Registry

BETWEEN:
${lender?.name}
PETITIONER

AND:
${borrower?.name}
RESPONDENT

[...]`;
      
      default:
        return "";
    }
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
                    {generateDocumentContent(documentType, activeCaseData)}
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
                  <Button className="gap-2 bg-law-navy hover:bg-law-navy/90">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    onClick={() => setPreviewMode(true)}
                    disabled={!selectedCase || !documentType}
                  >
                    <FilePlus className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button 
                    className="gap-2 bg-law-navy hover:bg-law-navy/90"
                    onClick={handleGenerate}
                    disabled={!selectedCase || !documentType || isGenerating}
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
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-law-teal" />
                      <span className="text-sm">{doc.title}</span>
                    </div>
                    <Badge variant="outline">{doc.status}</Badge>
                  </div>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground">
                  No recent documents
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
