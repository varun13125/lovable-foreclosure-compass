
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentType } from '@/types';

interface DocumentTypeSelectProps {
  value: DocumentType;
  onChange: (value: DocumentType) => void;
}

const DocumentTypeSelect = ({ value, onChange }: DocumentTypeSelectProps) => {
  const documentTypes: DocumentType[] = [
    'Demand Letter',
    'Petition',
    'Order Nisi',
    'Conduct of Sale',
    'Affidavit',
    'Final Order',
    'Other'
  ];

  return (
    <div className="w-48">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Document Type" />
        </SelectTrigger>
        <SelectContent>
          {documentTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DocumentTypeSelect;
