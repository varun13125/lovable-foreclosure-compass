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
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ selectedCase }) => {
  const [documentType, setDocumentType] = useState<string>('Demand Letter');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (selectedCase) {
      console.log("Selected Case in DocumentGenerator:", selectedCase);
    }
  }, [selectedCase]);

  const generateDocument = async () => {
    if (!selectedCase) {
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
      doc.text(`Case File Number: ${selectedCase.fileNumber}`, 10, 20);
      doc.text(`Property Address: ${selectedCase.property.address.street}, ${selectedCase.property.address.city}`, 10, 30);

      // Parties involved
      let yOffset = 40;
      selectedCase.parties.forEach(party => {
        doc.text(`${party.type}: ${party.name}`, 10, yOffset);
        yOffset += 10;
      });

      // Mortgage details
      doc.text(`Mortgage Registration Number: ${selectedCase.mortgage.registrationNumber}`, 10, yOffset);
      yOffset += 10;
      doc.text(`Principal Amount: ${selectedCase.mortgage.principal.toString()}`, 10, yOffset);

      // Add more details as needed

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
      const filename = `Case_${selectedCase.fileNumber}_${documentType}.pdf`;
      doc.save(filename);

      // Upload the document to Supabase storage
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(`${selectedCase.id}/${filename}`, file, {
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
          title: filename,
          type: documentType,
          createdAt: new Date().toISOString(),
          status: "Finalized",
          caseId: selectedCase.id,
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
    caseFileNumber: selectedCase?.fileNumber || '',
    court: {
      fileNumber: selectedCase?.court?.fileNumber || '',
      registry: selectedCase?.court?.registry || '',
      hearingDate: selectedCase?.court?.hearingDate ? format(parseISO(selectedCase.court.hearingDate), 'MMMM d, yyyy') : '',
      judgeName: selectedCase?.court?.judgeName || ''
    },
    property: {
      address: selectedCase?.property.address.street || '',
      city: selectedCase?.property.address.city || '',
      province: selectedCase?.property.address.province || '',
      postalCode: selectedCase?.property.address.postalCode || '',
      legalDescription: selectedCase?.property.legal_description || '',
      propertyType: selectedCase?.property.propertyType || ''
    },
    mortgage: {
      registrationNumber: selectedCase?.mortgage.registrationNumber || '',
      principal: selectedCase?.mortgage.principal || 0,
      interestRate: selectedCase?.mortgage.interestRate || 0,
      startDate: selectedCase?.mortgage.startDate ? format(parseISO(selectedCase.mortgage.startDate), 'MMMM d, yyyy') : '',
      currentBalance: selectedCase?.mortgage.currentBalance || 0,
      perDiemInterest: selectedCase?.mortgage.perDiemInterest || 0
    },
    parties: selectedCase?.parties.map(party => ({
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
