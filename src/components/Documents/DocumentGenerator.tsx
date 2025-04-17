
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Button } from "@/components/ui/button";
import { Case } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

interface DocumentGeneratorProps {
  selectedCase: Case | null;
  caseId?: string; // Add caseId as an optional property
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ selectedCase, caseId }) => {
  const [documentType, setDocumentType] = useState<string>('Demand Letter');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentCase, setCurrentCase] = useState<Case | null>(selectedCase);

  useEffect(() => {
    if (selectedCase) {
      setCurrentCase(selectedCase);
      console.log("Selected Case in DocumentGenerator:", selectedCase);
    } else if (caseId) {
      // Fetch case data if caseId is provided but no selectedCase
      fetchCaseById(caseId);
    }
  }, [selectedCase, caseId]);

  const fetchCaseById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          id,
          file_number,
          status,
          created_at,
          updated_at,
          notes,
          court_file_number,
          hearing_date,
          court_registry,
          judge_name,
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
          parties: case_parties (
            party: parties (
              id,
              name,
              type,
              email,
              phone,
              address
            )
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
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching case:", error);
        return;
      }

      if (data) {
        // Transform the data to match the Case type
        const transformedCase: Case = {
          id: data.id,
          fileNumber: data.file_number,
          status: data.status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          property: {
            id: data.property?.id,
            address: {
              street: data.property?.street || "",
              city: data.property?.city || "",
              province: data.property?.province || "",
              postalCode: data.property?.postal_code || "",
            },
            pid: data.property?.pid || "",
            legal_description: data.property?.legal_description || "",
            propertyType: data.property?.property_type || "Residential",
          },
          parties: data.parties.map((cp: any) => ({
            id: cp.party.id,
            name: cp.party.name,
            type: cp.party.type,
            contactInfo: {
              email: cp.party.email || '',
              phone: cp.party.phone || '',
              address: cp.party.address || ''
            }
          })),
          mortgage: {
            id: data.mortgage?.id,
            registrationNumber: data.mortgage?.registration_number,
            principal: data.mortgage?.principal,
            interestRate: data.mortgage?.interest_rate,
            startDate: data.mortgage?.start_date,
            currentBalance: data.mortgage?.current_balance,
            perDiemInterest: data.mortgage?.per_diem_interest || 0
          },
          deadlines: [],
          documents: [],
          court: {
            fileNumber: data.court_file_number || '',
            registry: data.court_registry || '',
            hearingDate: data.hearing_date || null,
            judgeName: data.judge_name || ''
          },
        };
        setCurrentCase(transformedCase);
      }
    } catch (error) {
      console.error("Error fetching case:", error);
    }
  };

  const generateDocument = async () => {
    if (!currentCase) {
      toast.error("No case selected. Please select a case to generate a document.");
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();

      // Document header
      doc.setFontSize(18);
      doc.text(`Document Type: ${documentType}`, 10, 10);

      // Case details
      doc.setFontSize(12);
      doc.text(`Case File Number: ${currentCase.fileNumber}`, 10, 20);
      doc.text(`Property Address: ${currentCase.property.address.street}, ${currentCase.property.address.city}`, 10, 30);

      // Parties involved
      let yOffset = 40;
      currentCase.parties.forEach(party => {
        doc.text(`${party.type}: ${party.name}`, 10, yOffset);
        yOffset += 10;
      });

      // Mortgage details
      doc.text(`Mortgage Registration Number: ${currentCase.mortgage.registrationNumber}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Principal Amount: ${currentCase.mortgage.principal.toString()}`, 10, yOffset);

      // Example table (using jspdf-autotable)
      (doc as any).autoTable({
        head: [['Header 1', 'Header 2']],
        body: [
          ['row 1 col 1', 'row 1 col 2'],
          ['row 2 col 1', 'row 2 col 2']
        ],
        startY: yOffset + 10,
      });

      // Save the PDF
      const filename = `Case_${currentCase.fileNumber}_${documentType}.pdf`;
      doc.save(filename);

      // Upload the document to Supabase storage
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(`${currentCase.id}/${filename}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Error uploading document:", error);
        toast.error("Failed to upload document to storage.");
      } else {
        console.log("Document uploaded successfully:", data);
        toast.success("Document generated and uploaded successfully!");

        // Optionally, update the case document list in the database
        const newDocument = {
          case_id: currentCase.id,
          title: filename,
          type: documentType,
          created_at: new Date().toISOString(),
          status: "Finalized",
          url: data.path // Store the path in Supabase storage
        };

        const { data: dbData, error: dbError } = await supabase
          .from('documents')
          .insert([newDocument]);

        if (dbError) {
          console.error("Error saving document metadata:", dbError);
          toast.error("Failed to save document metadata.");
        } else {
          console.log("Document metadata saved:", dbData);
        }
      }
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate document.");
    } finally {
      setIsGenerating(false);
    }
  };

  const templateData = {
    caseFileNumber: currentCase?.fileNumber || '',
    court: {
      fileNumber: currentCase?.court?.fileNumber || '',
      registry: currentCase?.court?.registry || '',
      hearingDate: currentCase?.court?.hearingDate ? format(parseISO(currentCase.court.hearingDate), 'MMMM d, yyyy') : '',
      judgeName: currentCase?.court?.judgeName || ''
    },
    property: {
      address: currentCase?.property.address.street || '',
      city: currentCase?.property.address.city || '',
      province: currentCase?.property.address.province || '',
      postalCode: currentCase?.property.address.postalCode || '',
      legalDescription: currentCase?.property.legal_description || '',
      propertyType: currentCase?.property.propertyType || ''
    },
    mortgage: {
      registrationNumber: currentCase?.mortgage.registrationNumber || '',
      principal: currentCase?.mortgage.principal || 0,
      interestRate: currentCase?.mortgage.interestRate || 0,
      startDate: currentCase?.mortgage.startDate ? format(parseISO(currentCase.mortgage.startDate), 'MMMM d, yyyy') : '',
      currentBalance: currentCase?.mortgage.currentBalance || 0,
      perDiemInterest: currentCase?.mortgage.perDiemInterest || 0
    },
    parties: currentCase?.parties.map(party => ({
      name: party.name,
      type: party.type,
      email: party.contactInfo.email,
      phone: party.contactInfo.phone
    })) || []
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Generate Document</h2>
      <div className="mb-4">
        <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
          Document Type:
        </label>
        <select
          id="documentType"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <option>Demand Letter</option>
          <option>Petition</option>
          <option>Order Nisi</option>
          <option>Conduct of Sale</option>
          <option>Affidavit</option>
          <option>Final Order</option>
          <option>Other</option>
        </select>
      </div>
      <Button onClick={generateDocument} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Generate Document"}
      </Button>
    </div>
  );
};

export default DocumentGenerator;
