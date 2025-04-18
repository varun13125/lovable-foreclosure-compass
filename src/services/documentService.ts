
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DocumentType, DocumentStatus } from '@/types';

export const uploadDocument = async (
  caseId: string,
  file: File,
  filename: string,
  documentType: DocumentType,
) => {
  try {
    // First, ensure documents bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
    
    if (!documentsBucket) {
      console.error("Documents bucket doesn't exist");
      toast.error("Storage not configured properly. Please contact support.");
      throw new Error("Documents bucket doesn't exist");
    }

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(`${caseId}/${filename}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw error;
    }

    if (!data || !data.path) {
      throw new Error("Upload successful but no file path returned");
    }

    // Create document record in the database
    const newDocument = {
      case_id: caseId,
      title: filename,
      type: documentType,
      created_at: new Date().toISOString(),
      status: "Finalized" as DocumentStatus,
      url: data.path
    };

    const { error: dbError } = await supabase
      .from('documents')
      .insert([newDocument]);

    if (dbError) {
      console.error("Database insert error:", dbError);
      throw dbError;
    }

    toast.success("Document generated and uploaded successfully!");
    return data;
  } catch (error) {
    console.error("Error uploading document:", error);
    toast.error("Failed to upload document. Please try again.");
    throw error;
  }
};

export const getDocumentDownloadUrl = async (path: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(path, 60); // URL valid for 60 seconds

    if (error) throw error;
    if (!data?.signedUrl) throw new Error("Failed to get download URL");

    return data.signedUrl;
  } catch (error) {
    console.error("Error creating download URL:", error);
    toast.error("Failed to generate download link");
    throw error;
  }
};

export const getDocumentsByCase = async (caseId: string) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching documents:", error);
    toast.error("Failed to load documents");
    throw error;
  }
};
