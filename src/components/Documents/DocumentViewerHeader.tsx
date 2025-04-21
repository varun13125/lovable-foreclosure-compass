
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Check } from "lucide-react";

interface DocumentViewerHeaderProps {
  title: string;
  type?: string;
  createdAt: string;
  status: string;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onFinalize: () => void;
  canFinalize: boolean;
}

const DocumentViewerHeader: React.FC<DocumentViewerHeaderProps> = ({
  title,
  type,
  createdAt,
  status,
  isEditing,
  saving,
  onEdit,
  onCancelEdit,
  onSave,
  onDownload,
  onPrint,
  onFinalize,
  canFinalize,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <div>
        <h2 className="text-xl font-semibold">{title || type}</h2>
        <p className="text-muted-foreground">
          Created: {createdAt}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {isEditing ? (
          <>
            <Button 
              variant="outline" 
              onClick={onCancelEdit}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={onSave} 
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onEdit}
              disabled={status === 'Finalized'}
            >
              Edit
            </Button>
            <Button 
              variant="outline" 
              onClick={onDownload}
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button 
              variant="outline" 
              onClick={onPrint}
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            {canFinalize && (
              <Button 
                onClick={onFinalize}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" /> Finalize
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentViewerHeader;
