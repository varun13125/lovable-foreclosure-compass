
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
  Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { mockCases } from "@/data/mockData";
import { Case } from "@/types";

interface DocumentGeneratorProps {
  caseId?: string;
}

export default function DocumentGenerator({ caseId }: DocumentGeneratorProps) {
  const [selectedCase, setSelectedCase] = useState<string | undefined>(caseId);
  const [documentType, setDocumentType] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  // Reset document type when case changes
  useEffect(() => {
    setDocumentType("");
    setPreviewMode(false);
  }, [selectedCase]);

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

  const activeCaseData: Case | undefined = selectedCase 
    ? mockCases.find(c => c.id === selectedCase)
    : undefined;

  const handleGenerate = () => {
    if (!selectedCase || !documentType) {
      toast({
        title: "Missing Information",
        description: "Please select both a case and document type.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate document generation with timeout
    setTimeout(() => {
      setIsGenerating(false);
      setPreviewMode(true);
      
      toast({
        title: "Document Generated",
        description: `${getDocumentTypeName(documentType)} created successfully.`,
      });
    }, 1500);
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
                  {mockCases.map((caseItem) => (
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
                
                <div className="border rounded bg-muted/30 p-3 text-sm mb-3">
                  {documentType === "demand" && (
                    <div className="space-y-2">
                      <p>WITHOUT PREJUDICE</p>
                      <p className="font-semibold">RE: DEMAND FOR PAYMENT</p>
                      <p>Property: {activeCaseData.property.address.street}, {activeCaseData.property.address.city}</p>
                      <p>Mortgage: {activeCaseData.mortgage.registrationNumber}</p>
                      <p>Balance Due: ${activeCaseData.mortgage.currentBalance.toLocaleString()}</p>
                      
                      <p>Dear {activeCaseData.parties.find(p => p.type === "Borrower")?.name},</p>
                      
                      <p>Please be advised that we represent {activeCaseData.parties.find(p => p.type === "Lender")?.name} in connection with the above-noted mortgage...</p>
                      
                      <p className="text-muted-foreground">[Preview truncated]</p>
                    </div>
                  )}
                  
                  {documentType === "payout" && (
                    <div className="space-y-2">
                      <p className="font-semibold text-center">MORTGAGE PAYOUT STATEMENT</p>
                      <p>Property: {activeCaseData.property.address.street}</p>
                      <p>Mortgagor: {activeCaseData.parties.find(p => p.type === "Borrower")?.name}</p>
                      <p>Principal Balance: ${activeCaseData.mortgage.currentBalance.toLocaleString()}</p>
                      <p>Per Diem Interest: ${activeCaseData.mortgage.perDiemInterest.toLocaleString()}/day</p>
                      
                      <p className="text-muted-foreground">[Preview truncated]</p>
                    </div>
                  )}
                  
                  {(documentType === "petition" || documentType === "ordernisi" || documentType === "conduct") && (
                    <div className="space-y-2">
                      <p className="font-semibold text-center">
                        {documentType === "petition" ? "PETITION TO THE COURT" : 
                         documentType === "ordernisi" ? "ORDER NISI" : 
                         "APPLICATION FOR CONDUCT OF SALE"}
                      </p>
                      <p>No. {activeCaseData.court?.fileNumber || "[Court File Number]"}</p>
                      <p>{activeCaseData.court?.registry || "Vancouver"} Registry</p>
                      <p>IN THE SUPREME COURT OF BRITISH COLUMBIA</p>
                      
                      <p>BETWEEN:</p>
                      <p className="font-semibold">{activeCaseData.parties.find(p => p.type === "Lender")?.name}</p>
                      <p>PETITIONER</p>
                      
                      <p>AND:</p>
                      <p className="font-semibold">{activeCaseData.parties.find(p => p.type === "Borrower")?.name}</p>
                      <p>RESPONDENT</p>
                      
                      <p className="text-muted-foreground">[Preview truncated]</p>
                    </div>
                  )}
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
              {(selectedCase ? 
                mockCases.find(c => c.id === selectedCase)?.documents : 
                mockCases[0]?.documents)?.length > 0 ? (
                  (selectedCase ? 
                    mockCases.find(c => c.id === selectedCase)?.documents : 
                    mockCases[0]?.documents
                  )?.map((doc) => (
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
