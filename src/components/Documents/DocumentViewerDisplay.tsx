
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentViewerDisplayProps {
  content: string;
}

const DocumentViewerDisplay: React.FC<DocumentViewerDisplayProps> = ({ content }) => (
  <ScrollArea className="h-[70vh] w-full bg-gray-50 dark:bg-gray-900/20">
    <div className="p-6">
      <div 
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  </ScrollArea>
);

export default DocumentViewerDisplay;
