
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
import { FileText, FilePlus, ChevronRight } from "lucide-react";
import { mockCases } from "@/data/mockData";

export default function DocumentGenerator() {
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

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Document Generator</CardTitle>
        <CardDescription>
          Generate legal documents with auto-populated case data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Case</label>
            <Select>
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
          
          <div>
            <label className="block text-sm font-medium mb-1">Document Type</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {templateTypes.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Document Preview</h3>
            <div className="flex items-center justify-center h-32 bg-gray-100 rounded border-dashed border-2 text-muted-foreground">
              <FileText className="h-12 w-12 opacity-30" />
            </div>
            
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" className="gap-2">
                <FilePlus className="h-4 w-4" />
                Preview
              </Button>
              <Button className="gap-2 bg-law-navy hover:bg-law-navy/90">
                Generate
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-2">
            <h3 className="text-sm font-medium mb-2">Recent Documents</h3>
            <div className="space-y-2">
              {mockCases[0].documents.length > 0 ? (
                mockCases[0].documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-law-teal" />
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
