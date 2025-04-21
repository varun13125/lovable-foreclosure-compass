
import React from "react";
import RichTextEditor from "@/components/RichTextEditor";

interface DocumentViewerEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const DocumentViewerEditor: React.FC<DocumentViewerEditorProps> = ({
  value,
  onChange,
}) => (
  <div className="fixed-height-container" style={{ height: "70vh", overflow: "hidden", position: "relative" }}>
    <RichTextEditor
      value={value}
      onChange={onChange}
      minHeight="70vh"
    />
  </div>
);

export default DocumentViewerEditor;
