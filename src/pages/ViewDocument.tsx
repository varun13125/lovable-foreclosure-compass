import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/types";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import DocumentViewer from "@/components/Documents/DocumentViewer";

export default function ViewDocument() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      fetchDocument(id);
    }
  }, [id]);

  const fetchDocument = async (documentId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;
      
      if (data) {
        const documentData: Document = {
          id: data.id,
          title: data.title,
          type: data.type,
          createdAt: data.created_at,
          status: data.status,
          caseId: data.case_id,
          url: data.url
        };
        
        setDocument(documentData);
        setContent(data.content || "");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Could not load document");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = () => {
    if (document) {
      setDocument({
        ...document,
        status: "Finalized"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="gap-2 mb-4"
              onClick={() => navigate('/documents')}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Documents
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              View Document
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-law-teal"></div>
            </div>
          ) : document ? (
            <DocumentViewer 
              document={document} 
              content={content} 
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <h3 className="mb-2 font-semibold">Document not found</h3>
              <p className="text-muted-foreground">
                The document you're looking for doesn't exist or you don't have permission to view it.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
