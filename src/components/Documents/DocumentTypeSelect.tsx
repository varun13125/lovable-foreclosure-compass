
import { DocumentType } from '@/types';

interface DocumentTypeSelectProps {
  value: DocumentType;
  onChange: (value: DocumentType) => void;
}

const DocumentTypeSelect = ({ value, onChange }: DocumentTypeSelectProps) => {
  return (
    <div className="mb-4">
      <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
        Document Type:
      </label>
      <select
        id="documentType"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        value={value}
        onChange={(e) => onChange(e.target.value as DocumentType)}
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
  );
};

export default DocumentTypeSelect;
