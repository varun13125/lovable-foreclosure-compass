
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
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(`${caseId}/${filename}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

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

    if (dbError) throw dbError;

    toast.success("Document generated and uploaded successfully!");
    return data;
  } catch (error) {
    console.error("Error uploading document:", error);
    toast.error("Failed to upload document.");
    throw error;
  }
};
