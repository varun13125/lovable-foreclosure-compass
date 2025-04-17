
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import { Download, Eye, Link2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DocumentViewerProps {
  document: Document;
  content?: string; // Make content optional to match usage in ViewDocument
  onStatusChange?: () => void; // Add onStatusChange as an optional prop
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, content, onStatusChange }) => {
  const { title, type, createdAt, status, caseNumber } = document;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <Badge variant="outline" className="bg-yellow-500 text-black">Draft</Badge>;
      case "Finalized":
        return <Badge variant="default" className="bg-green-500">Finalized</Badge>;
      case "Filed":
        return <Badge variant="secondary" className="bg-blue-500">Filed</Badge>;
      case "Served":
        return <Badge variant="destructive" className="bg-red-500">Served</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {type} - Created on {format(new Date(createdAt), 'MMMM dd, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge(status)}
        </div>
        {caseNumber && (
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Case File Number:</span>
            <span className="text-sm">{caseNumber}</span>
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="ghost" onClick={() => toast.info("Preview document")}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.info("Edit document")}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button size="sm" variant="default" onClick={() => toast.success("Download document")}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast.success("Copy public URL")}>
            <Link2 className="mr-2 h-4 w-4" />
            Get Link
          </Button>
          <Button size="sm" variant="destructive" onClick={() => toast.error("Delete document")}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentViewer;
