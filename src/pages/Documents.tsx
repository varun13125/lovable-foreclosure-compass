
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import DocumentGenerator from "@/components/Documents/DocumentGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Eye, Plus, Filter } from "lucide-react";
import { Document, Case } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Documents() {
  const navigate = useNavigate();
  const [showGenerator, setShowGenerator] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id, 
          title, 
          type, 
          created_at, 
          status, 
          case_id,
          url,
          cases (
            file_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedDocs: Document[] = data.map(doc => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          createdAt: doc.created_at,
          status: doc.status,
          caseId: doc.case_id,
          url: doc.url || undefined,
          caseNumber: doc.cases?.file_number
        }));
        setDocuments(formattedDocs);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = () => {
    setShowGenerator(true);
  };

  const handleViewDocument = (documentId: string) => {
    navigate(`/document/${documentId}`);
  };

  // Filter documents based on search term and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (doc.caseNumber && doc.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get unique document types for filter
  const documentTypes = Array.from(new Set(documents.map(doc => doc.type)));

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "Petition":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "Demand Letter": 
        return <FileText className="h-5 w-5 text-red-500" />;
      case "Order Nisi":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "Conduct of Sale":
        return <FileText className="h-5 w-5 text-amber-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Documents</h1>
              <p className="text-muted-foreground">Generate and manage legal documents</p>
            </div>
            <Button 
              className="bg-law-teal hover:bg-law-teal/90"
              onClick={handleCreateDocument}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Document
            </Button>
          </div>
          
          {showGenerator ? (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Create New Document</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowGenerator(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DocumentGenerator selectedCase={null} />
                </CardContent>
              </Card>
            </div>
          ) : null}
          
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <div className="w-40">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <span>Status</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Finalized">Finalized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-52">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <span>Document Type</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {documentTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-law-teal"></div>
                </div>
              ) : filteredDocuments.length > 0 ? (
                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-10 px-4 text-left font-medium">Document</th>
                          <th className="h-10 px-2 text-left font-medium">Case Number</th>
                          <th className="h-10 px-2 text-left font-medium">Type</th>
                          <th className="h-10 px-2 text-left font-medium">Created</th>
                          <th className="h-10 px-2 text-left font-medium">Status</th>
                          <th className="h-10 px-2 text-right font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.map((doc) => (
                          <tr key={doc.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {getDocumentTypeIcon(doc.type)}
                                <span className="font-medium">{doc.title}</span>
                              </div>
                            </td>
                            <td className="px-2">{doc.caseNumber || "-"}</td>
                            <td className="px-2">{doc.type}</td>
                            <td className="px-2">{formatDate(doc.createdAt)}</td>
                            <td className="px-2">
                              <Badge variant={doc.status === "Draft" ? "outline" : "default"}>
                                {doc.status}
                              </Badge>
                            </td>
                            <td className="px-2 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDocument(doc.id)}
                                className="gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 border rounded-md">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-2 font-semibold">No documents found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || statusFilter !== "all" || typeFilter !== "all" 
                      ? "Try adjusting your filters" 
                      : "Get started by creating your first document"}
                  </p>
                  {!documents.length && (
                    <Button 
                      className="mt-4 bg-law-teal hover:bg-law-teal/90"
                      onClick={handleCreateDocument}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Document
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
